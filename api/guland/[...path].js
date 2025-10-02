export const config = { runtime: 'edge' };

export default async function handler(req) {
  const url = new URL(req.url);
  // Strip /api/guland from the front to get upstream path (e.g., /ban-do-gia/...)
  const upstreamPath = url.pathname.replace(/^\/api\/guland/, "");
  const target = "https://guland.vn" + upstreamPath + url.search;

  // Forward the request to guland.vn
  const upstreamRes = await fetch(new Request(target, req));

  // Clone & relax anti-embed headers
  const headers = new Headers(upstreamRes.headers);
  headers.delete("x-frame-options");
  const csp = headers.get("content-security-policy");
  if (csp) {
    headers.set("content-security-policy", csp.replace(/frame-ancestors[^;]*;?/gi, ""));
  }
  headers.set("access-control-allow-origin", "*");

  return new Response(upstreamRes.body, { status: upstreamRes.status, headers });
}
