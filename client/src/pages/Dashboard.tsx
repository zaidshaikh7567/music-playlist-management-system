import { z } from "zod";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  addPlaylist,
  deletePlaylist,
  getAllPlaylists,
  updatePlaylist,
  searchSong,
  addSongToPlaylist,
} from "../services/playlist";

const playlistSchema = z.object({
  name: z.string().min(1, "Playlist name is required"),
  description: z.string().min(1, "Description is required"),
});

type PlaylistFormData = z.infer<typeof playlistSchema>;

type Playlist = {
  _id: string;
  name: string;
  description: string;
  songs: Array<{
    title: string;
    artist: string;
    album: string;
    spotifyId: string;
  }>;
};

type Song = {
  id: string;
  name: string;
  artists: Array<{ name: string; spotifyUrl: string }>;
  album: { name: string; spotifyUrl: string };
  trackUrl: string;
  previewUrl: string;
};

const Dashboard: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [searchCurrentPage, setSearchCurrentPage] = useState<number>(1);
  const [searchTotalPages, setSearchTotalPages] = useState<number>(1);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(
    null
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PlaylistFormData>({
    resolver: zodResolver(playlistSchema),
  });

  const loadPlaylists = async (page: number) => {
    try {
      setLoading(true);
      const data = await getAllPlaylists(page, 10);
      setPlaylists(data.playlists);
      setTotalPages(data.pagination.totalPages || 1);
      setCurrentPage(data.pagination.currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to load playlists");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit: SubmitHandler<PlaylistFormData> = async (data) => {
    try {
      if (editingPlaylist) {
        const updatedPlaylist = await updatePlaylist(
          editingPlaylist._id,
          data.name,
          data.description
        );
        setPlaylists((prev) =>
          prev.map((p) =>
            p._id === editingPlaylist._id ? updatedPlaylist.playlist : p
          )
        );
        setEditingPlaylist(null);
        toast.success("Playlist updated");
      } else {
        const newPlaylist = await addPlaylist(data.name, data.description);
        setPlaylists((prev) => [...prev, newPlaylist.playlist]);
        toast.success("Playlist added");
      }
      reset({ name: "", description: "" });
    } catch (error: any) {
      toast.error(error.message || "Failed to save playlist");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deletePlaylist(id);
      setPlaylists((prev) => prev.filter((p) => p._id !== id));
      toast.success("Playlist deleted");
    } catch (error: any) {
      toast.error(error?.message || "Failed to delete playlist");
    }
  };

  const handleEdit = (playlist: Playlist) => {
    setEditingPlaylist(playlist);
    reset({ name: playlist.name, description: playlist.description });
    window.scrollTo({ top: 0 });
  };

  const handleSearch = async (page: number = 1) => {
    if (!searchQuery) return;
    try {
      const data = await searchSong(searchQuery, page, 10);
      const songs = data.tracks.map((track: any) => ({
        id: track.id,
        name: track.name,
        artists: track.artists.map((artist: any) => ({
          name: artist.name,
          spotifyUrl: artist.external_urls.spotify,
        })),
        album: {
          name: track.album.name,
          spotifyUrl: track.album.external_urls.spotify,
        },
        trackUrl: track.external_urls.spotify,
        previewUrl: track.preview_url,
      }));
      setSearchResults(songs);
      setSearchTotalPages(data.pagination.totalPages);
      setSearchCurrentPage(data.pagination.currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to search songs");
    }
  };

  const handleAddSongToPlaylist = async (
    playlistId: string,
    songId: string
  ) => {
    try {
      await addSongToPlaylist(playlistId, songId);
      toast.success("Song added to playlist");
      loadPlaylists(currentPage);
    } catch (error: any) {
      toast.error(error.message || "Failed to add song to playlist");
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSearchCurrentPage(1);
    setSearchTotalPages(1);
  };

  useEffect(() => {
    loadPlaylists(currentPage);
  }, [currentPage]);

  useEffect(() => {
    handleSearch(searchCurrentPage);
  }, [searchCurrentPage]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="bg-white p-6 rounded shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Search Songs</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a song..."
            className="w-full px-4 py-2 border rounded mb-2"
          />
          <button
            onClick={() => handleSearch(1)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Search
          </button>
          <button
            onClick={handleClearSearch}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 ml-2"
          >
            Clear
          </button>
        </div>

        {searchResults.length > 0 && (
          <ul className="space-y-4">
            {searchResults.map((song) => (
              <li
                key={song.id}
                className="p-4 border rounded flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-semibold text-xl">{song.name}</h3>
                  <p className="text-gray-600">
                    Artists:{" "}
                    {song.artists.map((artist) => artist.name).join(", ")}
                  </p>
                  <p className="text-gray-600">Album: {song.album.name}</p>
                </div>

                <div className="flex space-x-2 mt-4">
                  <select
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="px-4 py-2 border rounded"
                  >
                    <option value="">Select Playlist</option>
                    {playlists.map((playlist) => (
                      <option key={playlist._id} value={playlist._id}>
                        {playlist.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() =>
                      selectedPlaylistId &&
                      handleAddSongToPlaylist(selectedPlaylistId, song.id)
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Add to Playlist
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() =>
              setSearchCurrentPage((prev) => Math.max(prev - 1, 1))
            }
            disabled={searchCurrentPage === 1}
            className={`px-4 py-2 rounded ${
              searchCurrentPage === 1
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {searchCurrentPage} of {searchTotalPages}
          </span>
          <button
            onClick={() =>
              setSearchCurrentPage((prev) =>
                Math.min(prev + 1, searchTotalPages)
              )
            }
            disabled={searchCurrentPage === searchTotalPages}
            className={`px-4 py-2 rounded ${
              searchCurrentPage === searchTotalPages
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {editingPlaylist ? "Edit Playlist" : "Add Playlist"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block font-semibold mb-1">Playlist Name</label>
            <input
              {...register("name")}
              className="w-full px-4 py-2 border rounded"
              placeholder="Enter playlist name"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block font-semibold mb-1">Description</label>
            <textarea
              {...register("description")}
              className="w-full px-4 py-2 border rounded"
              placeholder="Enter description"
            />
            {errors.description && (
              <p className="text-red-500 text-sm">
                {errors.description.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {editingPlaylist ? "Update Playlist" : "Add Playlist"}
          </button>
          {editingPlaylist && (
            <button
              type="button"
              onClick={() => setEditingPlaylist(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded ml-2 hover:bg-gray-600"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      <div className="bg-white p-6 rounded shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Your Playlists</h2>
        {loading ? (
          <p>Loading playlists...</p>
        ) : (
          <ul className="space-y-4">
            {playlists.map((playlist) => (
              <li
                key={playlist._id}
                className="p-4 border rounded flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold">{playlist.name}</h3>
                  <p className="text-gray-600">{playlist.description}</p>
                  <p className="text-gray-500 text-sm">
                    {playlist.songs.length} songs
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(playlist)}
                    className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(playlist._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-center mt-6 space-x-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded ${
              currentPage === 1
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Previous
          </button>
          <span className="px-4 py-2">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(prev + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded ${
              currentPage === totalPages
                ? "bg-gray-400"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
