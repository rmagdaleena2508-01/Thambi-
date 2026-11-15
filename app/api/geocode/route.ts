// Turns a map pin into a road and locality using OpenStreetMap's Nominatim.
// Follows the usage policy: identifying User-Agent, results cached, one call per pin.
const cache = new Map<string, { road: string; locality: string; display: string }>();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const lat = Number(url.searchParams.get("lat"));
  const lng = Number(url.searchParams.get("lng"));
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || lat < 7.5 || lat > 14.5 || lng < 75.5 || lng > 81) {
    return Response.json({ error: "outside_tamil_nadu" }, { status: 400 });
  }
  const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
  const hit = cache.get(key);
  if (hit) return Response.json(hit);

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&addressdetails=1&lat=${lat}&lon=${lng}`,
      {
        headers: { "User-Agent": "Thambi civic app (https://thambi-ten.vercel.app)", "Accept-Language": "en" },
        signal: AbortSignal.timeout(6000),
      },
    );
    if (!res.ok) throw new Error(String(res.status));
    const data = await res.json();
    const a = data?.address ?? {};
    const result = {
      road: a.road ?? a.pedestrian ?? a.residential ?? "",
      locality: a.suburb ?? a.neighbourhood ?? a.quarter ?? a.city_district ?? a.village ?? a.town ?? "",
      display: data?.display_name ?? "",
    };
    if (cache.size > 2000) cache.clear();
    cache.set(key, result);
    return Response.json(result);
  } catch {
    return Response.json({ road: "", locality: "", display: "" });
  }
}
