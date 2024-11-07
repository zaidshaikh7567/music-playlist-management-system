import { z } from "zod";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  addPlaylist,
  deletePlaylist,
  getAllPlaylists,
  updatePlaylist,
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

const Dashboard: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

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
      setTotalPages(data.pagination.totalPages);
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
  };

  useEffect(() => {
    loadPlaylists(currentPage);
  }, [currentPage]);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

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
        <h2 className="text-xl font-semibold mb-4">Playlists</h2>
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
