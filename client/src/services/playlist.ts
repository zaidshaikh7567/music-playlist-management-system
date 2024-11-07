import api from "../config/api";

export const addPlaylist = async (name: string, description: string) => {
  try {
    const response = await api.post("/playlists", {
      name,
      description,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error?.message || "Failed to add playlist"
    );
  }
};

export const updatePlaylist = async (
  playlistId: string,
  name: string,
  description: string
) => {
  try {
    const response = await api.put(`/playlists/${playlistId}`, {
      name,
      description,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error ||
        error?.message ||
        "Failed to update playlist"
    );
  }
};

export const deletePlaylist = async (playlistId: string) => {
  try {
    const response = await api.delete(`/playlists/${playlistId}`);

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error ||
        error?.message ||
        "Failed to delete playlist"
    );
  }
};

export const getAllPlaylists = async (page: number, limit: number) => {
  try {
    const response = await api.get("/playlists", { params: { page, limit } });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error?.message || "Failed to get playlists"
    );
  }
};

export const searchSong = async (query: string) => {
  try {
    const response = await api.get(`/songs/search`, {
      params: { query },
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error || error?.message || "Failed to search song"
    );
  }
};

export const addSongToPlaylist = async (playlistId: string, songId: string) => {
  try {
    const response = await api.post(`/playlists/${playlistId}/songs`, {
      songId,
    });

    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.error ||
        error?.message ||
        "Failed to add song to playlist"
    );
  }
};
