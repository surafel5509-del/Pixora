const PIXABAY = "https://pixabay.com/api/";
const VIDEO_API = "https://pixabay.com/api/videos/";

export default async function handler(req: any, res: any) {
  res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate=3600");
  res.setHeader("X-Content-Type-Options", "nosniff");
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  const key = process.env.PIXABAY_API_KEY;
  if (!key) return res.status(503).json({ error: "Media search is temporarily unavailable." });
  const q = String(req.query.q || "creative inspiration").trim().slice(0, 100);
  const mediaId = String(req.query.id || "").trim().slice(0, 30);
  const type = String(req.query.type || "images") === "videos" ? "videos" : "images";
  const page = Math.max(1, Math.min(50, Number(req.query.page || 1) || 1));
  const perPage = Math.max(12, Math.min(30, Number(req.query.per_page || 24) || 24));
  const endpoint = type === "videos" ? VIDEO_API : PIXABAY;
  const params = new URLSearchParams({
    key, page: String(page), per_page: String(perPage),
    safesearch: "true",
  });
  if (mediaId) params.set("id", mediaId);
  else params.set("q", q);
  if (type === "images") {
    params.set("image_type", "photo");
    params.set("orientation", "all");
  }
  try {
    const upstream = await fetch(endpoint + "?" + params.toString(), { headers: { Accept: "application/json" } });
    if (!upstream.ok) {
      console.error("Media provider returned status", upstream.status);
      return res.status(502).json({ error: "Unable to load media right now." });
    }
    const payload: any = await upstream.json();
    const hits = Array.isArray(payload.hits) ? payload.hits : [];
    const items = hits.map((hit: any) => ({
      id: String(hit.id),
      type,
      title: String(hit.tags || "Creative inspiration").split(",").slice(0, 3).join(", "),
      tags: String(hit.tags || "").split(",").map((tag: string) => tag.trim()).filter(Boolean).slice(0, 12),
      image: type === "videos" ? (hit.videos?.large?.thumbnail || hit.videos?.medium?.thumbnail || hit.videos?.small?.thumbnail || "") : (hit.webformatURL || hit.largeImageURL || hit.previewURL || ""),
      thumbnail: type === "videos" ? (hit.videos?.tiny?.thumbnail || hit.videos?.small?.thumbnail || hit.videos?.medium?.thumbnail || "") : (hit.previewURL || hit.webformatURL || ""),
      full: type === "videos" ? (hit.videos?.large?.url || hit.videos?.medium?.url || hit.videos?.small?.url || "") : (hit.largeImageURL || hit.webformatURL || ""),
      video: type === "videos" ? (hit.videos?.large?.url || hit.videos?.medium?.url || hit.videos?.small?.url || "") : "",
      user: String(hit.user || "Creator"),
      width: Number(hit.imageWidth || hit.videos?.large?.width || 0),
      height: Number(hit.imageHeight || hit.videos?.large?.height || 0),
      likes: Number(hit.likes || 0),
      views: Number(hit.views || 0),
      pageUrl: String(hit.pageURL || ""),
    })).filter((item: any) => item.image);
    return res.status(200).json({ items, total: Number(payload.totalHits || 0), page, hasMore: page * perPage < Number(payload.totalHits || 0) });
  } catch (error) {
    console.error("Media provider request failed", error);
    return res.status(502).json({ error: "Unable to load media right now." });
  }
}
