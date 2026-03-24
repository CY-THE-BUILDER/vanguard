import { NextResponse } from "next/server";
import {
  fetchSpotifyProfile,
  getValidSpotifyAccessToken,
  isSpotifyConfigured
} from "@/lib/spotify-auth";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!isSpotifyConfigured()) {
    return NextResponse.json({
      configured: false,
      connected: false
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  const accessToken = await getValidSpotifyAccessToken();
  if (!accessToken) {
    return NextResponse.json({
      configured: true,
      connected: false
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }

  try {
    const profile = await fetchSpotifyProfile(accessToken);
    return NextResponse.json({
      configured: true,
      connected: true,
      displayName: profile.display_name ?? null,
      avatarUrl: profile.images?.[0]?.url ?? null,
      product: profile.product ?? null,
      profileUrl: profile.external_urls?.spotify ?? null,
      country: profile.country ?? null
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  } catch {
    return NextResponse.json({
      configured: true,
      connected: true,
      displayName: null,
      avatarUrl: null,
      product: null,
      profileUrl: null,
      country: null
    }, {
      headers: {
        "Cache-Control": "no-store"
      }
    });
  }
}
