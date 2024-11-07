import { Request, Response } from "express";
import spotifyClient from "../config/spotify";
import Playlist, { IPlaylist } from "../models/playlist";

export const createPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { name, description } = req.body;
  const userId = (req as any).userId;

  try {
    const newPlaylist: IPlaylist = new Playlist({
      name,
      description,
      userId: userId,
      songs: [],
    });

    await newPlaylist.save();

    res.status(201).json({ playlist: newPlaylist });
  } catch (error) {
    console.error("Create playlist error:", error);

    res.status(500).json({ error: "Error creating playlist" });
  }
};

export const getUserPlaylists = async (
  req: Request,
  res: Response
): Promise<any> => {
  const userId = (req as any).userId;

  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 10;
  const skip = (page - 1) * limit;

  try {
    const [totalPlaylists, playlists] = await Promise.all([
      Playlist.countDocuments({ userId: userId }),
      Playlist.find({ userId: userId }).skip(skip).limit(limit),
    ]);

    const totalPages = Math.ceil(totalPlaylists / limit);

    res.status(200).json({
      playlists,
      pagination: {
        totalPlaylists,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("Get playlist error:", error);

    res.status(500).json({ error: "Error retrieving playlists" });
  }
};

export const updatePlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  try {
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      playlistId,
      { name, description },
      { new: true }
    );

    if (!updatedPlaylist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({ playlist: updatedPlaylist });
  } catch (error) {
    console.error("Update playlist error:", error);

    res.status(500).json({ error: "Error updating playlist" });
  }
};

export const deletePlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { playlistId } = req.params;

  try {
    const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

    if (!deletedPlaylist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    res.status(200).json({ playlist: deletedPlaylist });
  } catch (error) {
    console.error("Delete playlist error:", error);

    res.status(500).json({ error: "Error deleting playlist" });
  }
};

export const addSongToPlaylist = async (
  req: Request,
  res: Response
): Promise<any> => {
  const { playlistId } = req.params;
  const { spotifyId, title, artist, album } = req.body;

  try {
    const playlist = await Playlist.findById(playlistId);

    if (!playlist) {
      return res.status(404).json({ error: "Playlist not found" });
    }

    playlist.songs.push({ spotifyId, title, artist, album });

    await playlist.save();

    res.status(200).json({ playlist });
  } catch (error) {
    console.error("Add song to playlist playlist error:", error);

    res.status(500).json({ error: "Error adding song to playlist" });
  }
};

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
