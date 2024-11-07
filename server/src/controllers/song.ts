import { Request, Response } from "express";
import spotifyClient from "../config/spotify";

export const searchSongs = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: "Invalid request" });
  }

  const page = Number.parseInt(req.query.page as string) || 1;
  const limit = Number.parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const data = await spotifyClient.search(
      query.toString(),
      ["track"],
      "IN",
      limit as any,
      skip
    );

    const totalTracks = data.tracks.total || 0;
    const totalPages = Math.ceil(totalTracks / limit);

    res.status(200).json({
      tracks: data.tracks.items,
      pagination: {
        totalTracks: totalTracks,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Search song error:", error);

    res.status(500).json({ error: "Error fetching songs from Spotify" });
  }
};
