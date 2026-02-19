import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || "";

type Json = Record<string, unknown>;

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,DELETE,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const jsonResponse = (data: unknown, status = 200) => {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...CORS_HEADERS,
      "Content-Type": "application/json",
    },
  });
};

const errorResponse = (message: string, status = 400) => {
  return jsonResponse({ error: message }, status);
};

const parseIntParam = (value: string | null, fallback: number, min: number, max: number) => {
  const parsed = Number.parseInt(value ?? "", 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }
  return Math.max(min, Math.min(max, parsed));
};

const normalizePath = (pathname: string) => {
  let path = pathname;
  if (path.startsWith("/api/")) {
    path = path.slice(4);
  } else if (path === "/api") {
    path = "/";
  }
  if (path.startsWith("/music-api/")) {
    path = path.slice(10);
  } else if (path === "/music-api") {
    path = "/";
  }
  return path;
};

const authHeaders = (req: Request, extra?: Record<string, string>) => {
  const authHeader = req.headers.get("authorization");
  return {
    apikey: supabaseKey,
    Authorization: authHeader ?? `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
    ...(extra ?? {}),
  };
};

const supabaseRequest = async (
  req: Request,
  path: string,
  init?: RequestInit,
) => {
  const response = await fetch(`${supabaseUrl}/rest/v1${path}`, {
    ...init,
    headers: {
      ...authHeaders(req),
      ...(init?.headers ?? {}),
    },
  });

  const raw = await response.text();
  const data = raw ? JSON.parse(raw) : null;

  if (!response.ok) {
    const message = data?.message || data?.error || "Supabase request failed";
    throw new Error(message);
  }

  return data;
};

const readJsonBody = async (req: Request) => {
  try {
    return (await req.json()) as Json;
  } catch {
    throw new Error("Invalid JSON body");
  }
};

const getSongs = async (req: Request, url: URL) => {
  const genre = url.searchParams.get("genre");
  const search = url.searchParams.get("search");
  const limit = parseIntParam(url.searchParams.get("limit"), 50, 1, 100);
  const offset = parseIntParam(url.searchParams.get("offset"), 0, 0, 10000);

  const params = new URLSearchParams();
  params.set("select", "*");
  params.set("order", "title.asc");
  params.set("limit", String(limit));
  params.set("offset", String(offset));

  if (genre) {
    params.set("genre", `eq.${genre}`);
  }

  if (search) {
    const escaped = search.replace(/,/g, "");
    params.set("or", `(title.ilike.*${escaped}*,artist.ilike.*${escaped}*,album.ilike.*${escaped}*)`);
  }

  const data = await supabaseRequest(req, `/songs?${params.toString()}`);
  return jsonResponse(data);
};

const getSongById = async (req: Request, id: string) => {
  const params = new URLSearchParams({
    select: "*",
    id: `eq.${id}`,
    limit: "1",
  });
  const rows = await supabaseRequest(req, `/songs?${params.toString()}`);
  if (!Array.isArray(rows) || rows.length === 0) {
    return errorResponse("Song not found", 404);
  }
  return jsonResponse(rows[0]);
};

const getGenres = async (req: Request) => {
  const rows = await supabaseRequest(req, "/songs?select=genre");
  const genres = [...new Set((rows as Array<{ genre?: string }>).map((item) => item.genre).filter(Boolean))].sort();
  return jsonResponse(genres);
};

const getPlaylists = async (req: Request, url: URL) => {
  const userId = url.searchParams.get("user_id");
  const params = new URLSearchParams({
    select: "*",
    order: "created_at.desc",
  });
  if (userId) {
    params.set("user_id", `eq.${userId}`);
  }
  const data = await supabaseRequest(req, `/playlists?${params.toString()}`);
  return jsonResponse(data);
};

const createPlaylist = async (req: Request) => {
  const body = await readJsonBody(req);
  const userId = String(body.user_id ?? "").trim();
  const name = String(body.name ?? "").trim();
  if (!userId || !name) {
    return errorResponse("user_id and name are required", 422);
  }

  const payload = {
    user_id: userId,
    name,
    description: String(body.description ?? "").trim() || null,
    cover_image_url: String(body.cover_image_url ?? "").trim() || null,
    is_public: Boolean(body.is_public ?? false),
  };

  const data = await supabaseRequest(req, "/playlists", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return jsonResponse(data, 201);
};

const getPlaylistSongs = async (req: Request, playlistId: string) => {
  const params = new URLSearchParams({
    select: "id,playlist_id,song_id,position,added_at,songs(*)",
    playlist_id: `eq.${playlistId}`,
    order: "position.asc",
  });
  const data = await supabaseRequest(req, `/playlist_songs?${params.toString()}`);
  return jsonResponse(data);
};

const addSongToPlaylist = async (req: Request, playlistId: string) => {
  const body = await readJsonBody(req);
  const songId = String(body.song_id ?? "").trim();
  const position = Number.parseInt(String(body.position ?? "0"), 10);

  if (!songId) {
    return errorResponse("song_id is required", 422);
  }

  const payload = {
    playlist_id: playlistId,
    song_id: songId,
    position: Number.isNaN(position) || position < 1 ? 1 : position,
  };

  const data = await supabaseRequest(req, "/playlist_songs", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return jsonResponse(data, 201);
};

const removeSongFromPlaylist = async (req: Request, playlistId: string, songId: string) => {
  const params = new URLSearchParams({
    playlist_id: `eq.${playlistId}`,
    song_id: `eq.${songId}`,
  });
  await supabaseRequest(req, `/playlist_songs?${params.toString()}`, {
    method: "DELETE",
  });
  return jsonResponse({ success: true });
};

const getFavorites = async (req: Request, url: URL) => {
  const userId = url.searchParams.get("user_id");
  if (!userId) {
    return errorResponse("user_id query parameter is required", 422);
  }

  const params = new URLSearchParams({
    select: "id,user_id,song_id,created_at,songs(*)",
    user_id: `eq.${userId}`,
    order: "created_at.desc",
  });
  const data = await supabaseRequest(req, `/user_favorites?${params.toString()}`);
  return jsonResponse(data);
};

const addFavorite = async (req: Request) => {
  const body = await readJsonBody(req);
  const userId = String(body.user_id ?? "").trim();
  const songId = String(body.song_id ?? "").trim();

  if (!userId || !songId) {
    return errorResponse("user_id and song_id are required", 422);
  }

  const data = await supabaseRequest(req, "/user_favorites", {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify({ user_id: userId, song_id: songId }),
  });

  return jsonResponse(data, 201);
};

const removeFavorite = async (req: Request, url: URL) => {
  const userId = url.searchParams.get("user_id");
  const songId = url.searchParams.get("song_id");
  if (!userId || !songId) {
    return errorResponse("user_id and song_id query parameters are required", 422);
  }

  const params = new URLSearchParams({
    user_id: `eq.${userId}`,
    song_id: `eq.${songId}`,
  });
  await supabaseRequest(req, `/user_favorites?${params.toString()}`, {
    method: "DELETE",
  });

  return jsonResponse({ success: true });
};

serve(async (req: Request) => {
  if (!supabaseUrl || !supabaseKey) {
    return errorResponse("Missing SUPABASE_URL or SUPABASE_ANON_KEY", 500);
  }

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  const url = new URL(req.url);
  const path = normalizePath(url.pathname);
  const segments = path.split("/").filter(Boolean);

  try {
    if (path === "/health") {
      return jsonResponse({ status: "healthy" });
    }

    if (req.method === "GET" && path === "/songs") {
      return await getSongs(req, url);
    }

    if (req.method === "GET" && segments[0] === "songs" && segments.length === 2) {
      return await getSongById(req, segments[1]);
    }

    if (req.method === "GET" && path === "/genres") {
      return await getGenres(req);
    }

    if (req.method === "GET" && path === "/playlists") {
      return await getPlaylists(req, url);
    }

    if (req.method === "POST" && path === "/playlists") {
      return await createPlaylist(req);
    }

    if (req.method === "GET" && segments[0] === "playlists" && segments[2] === "songs" && segments.length === 3) {
      return await getPlaylistSongs(req, segments[1]);
    }

    if (req.method === "POST" && segments[0] === "playlists" && segments[2] === "songs" && segments.length === 3) {
      return await addSongToPlaylist(req, segments[1]);
    }

    if (
      req.method === "DELETE" &&
      segments[0] === "playlists" &&
      segments[2] === "songs" &&
      segments.length === 4
    ) {
      return await removeSongFromPlaylist(req, segments[1], segments[3]);
    }

    if (req.method === "GET" && path === "/favorites") {
      return await getFavorites(req, url);
    }

    if (req.method === "POST" && path === "/favorites") {
      return await addFavorite(req);
    }

    if (req.method === "DELETE" && path === "/favorites") {
      return await removeFavorite(req, url);
    }

    return errorResponse("Not found", 404);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return errorResponse(message, 500);
  }
});
