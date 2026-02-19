// deno-lint-ignore-file
// @ts-nocheck
/// <reference lib="deno.window" />
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

interface SongsFilter {
  genre?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

// Health check endpoint
const healthHandler = (_req: Request) => {
  return new Response(JSON.stringify({ status: "healthy" }), {
    headers: { "Content-Type": "application/json" },
  });
};

// Get all songs with optional filtering
const getSongsHandler = async (req: Request) => {
  const url = new URL(req.url);
  const genre = url.searchParams.get("genre");
  const search = url.searchParams.get("search");
  const limit = parseInt(url.searchParams.get("limit") || "50");
  const offset = parseInt(url.searchParams.get("offset") || "0");

  try {
    let query = `SELECT * FROM songs`;
    const filters: string[] = [];

    if (genre) {
      filters.push(`genre = '${genre}'`);
    }

    if (search) {
      filters.push(
        `(title ILIKE '%${search}%' OR artist ILIKE '%${search}%' OR album ILIKE '%${search}%')`
      );
    }

    if (filters.length > 0) {
      query += ` WHERE ${filters.join(" AND ")}`;
    }

    query += ` ORDER BY title ASC LIMIT ${limit} OFFSET ${offset}`;

    const response = await fetch(`${supabaseUrl}/rest/v1/songs`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Get all genres
const getGenresHandler = async (req: Request) => {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/songs?select=genre&distinct=true`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();
    const genres = data.map((item: any) => item.genre).filter(Boolean);
    return new Response(JSON.stringify(genres), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Get playlists for user
const getPlaylistsHandler = async (req: Request) => {
  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/playlists`, {
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Get favorite songs
const getFavoritesHandler = async (req: Request) => {
  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/user_favorites?select=song_id`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
      }
    );

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

// Router

serve(async (req: Request) => {
  // CORS headers
  const headers = new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers });
  }

  const url = new URL(req.url);

  if (url.pathname === "/health") {
    return healthHandler(req);
  }

  if (url.pathname.includes("/songs") && !url.pathname.includes("playlist")) {
    return getSongsHandler(req);
  }

  if (url.pathname.includes("/genres")) {
    return getGenresHandler(req);
  }

  if (url.pathname.includes("/playlists")) {
    return getPlaylistsHandler(req);
  }

  if (url.pathname.includes("/favorites")) {
    return getFavoritesHandler(req);
  }

  return new Response(JSON.stringify({ error: "Not found" }), {
    status: 404,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
  });
});
