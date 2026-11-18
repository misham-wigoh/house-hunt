import "server-only";

/**
 * Minimal WPGraphQL client. Server-only: it never ships to the browser and
 * only needs the public GraphQL URL (no credentials; contact data is not
 * exposed through GraphQL at all).
 */

const REVALIDATE_SECONDS = 300;

interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function cmsFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  options: { tags?: string[]; revalidate?: number } = {},
): Promise<T> {
  const endpoint = process.env.WORDPRESS_GRAPHQL_URL;
  if (!endpoint) {
    throw new Error(
      "WORDPRESS_GRAPHQL_URL is not set. Copy .env.example to .env.local and set it.",
    );
  }

  // Shared hosting occasionally answers 5xx under bursts; retry briefly before giving up.
  let res: Response | undefined;
  let lastError = "";
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 400 * attempt));
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, variables }),
        next: {
          revalidate: options.revalidate ?? REVALIDATE_SECONDS,
          tags: ["cms", ...(options.tags ?? [])],
        },
      });
      if (res.ok || res.status < 500) break;
      lastError = `${res.status} ${res.statusText} ${(await res.text().catch(() => "")).slice(0, 300)}`;
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      res = undefined;
    }
  }

  if (!res || !res.ok) {
    throw new Error(`WordPress GraphQL request failed: ${res ? `${res.status} ${lastError}` : lastError}`);
  }

  const json = (await res.json()) as GraphQLResponse<T>;
  if (json.errors?.length) {
    throw new Error(`WordPress GraphQL error: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  if (!json.data) {
    throw new Error("WordPress GraphQL returned no data");
  }
  return json.data;
}

interface Page<N> {
  nodes: N[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
}

/**
 * Walks every page of a connection. `query` must accept `$after: String`
 * and return `{ [key]: { nodes, pageInfo { hasNextPage endCursor } } }`.
 */
export async function cmsFetchAll<N>(
  query: string,
  key: string,
  options: { tags?: string[] } = {},
): Promise<N[]> {
  const all: N[] = [];
  let after: string | null = null;
  for (let guard = 0; guard < 50; guard++) {
    const data: Record<string, Page<N>> = await cmsFetch(query, { after }, options);
    const page: Page<N> = data[key];
    all.push(...page.nodes);
    if (!page.pageInfo.hasNextPage) break;
    after = page.pageInfo.endCursor;
  }
  return all;
}
