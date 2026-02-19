import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim();

  if (!q) {
    return NextResponse.json({ error: "Query is required" }, { status: 400 });
  }

  const apiKey = process.env.GIPHY_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "GIPHY_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const url = new URL("https://api.giphy.com/v1/gifs/search");
    url.searchParams.set("api_key", apiKey);
    url.searchParams.set("q", q);
    url.searchParams.set("limit", "20");
    url.searchParams.set("rating", "g");
    url.searchParams.set("lang", "en");

    const response = await fetch(url.toString(), { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`GIPHY API returned ${response.status}`);
    }

    const data = await response.json();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = (data.data ?? []).map((item: any) => ({
      id: item.id,
      title: item.title || "",
      preview: item.images?.fixed_height_small?.url ?? item.images?.downsized_small?.url,
      url: item.images?.fixed_height?.url ?? item.images?.original?.url,
    }));

    return NextResponse.json({ results });
  } catch (error) {
    console.error("GIPHY API error:", error);
    return NextResponse.json({ error: "Failed to fetch from GIPHY" }, { status: 500 });
  }
}
