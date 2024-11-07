import express from "express";
import { authenticate } from "../middlewares/auth";
import {
  createPlaylist,
  getUserPlaylists,
  updatePlaylist,
  deletePlaylist,
  addSongToPlaylist,
} from "../controllers/playlist";

const router = express.Router();

router.post("/", authenticate, createPlaylist);

router.get("/", authenticate, getUserPlaylists);

router.put("/:playlistId", authenticate, updatePlaylist);

router.delete("/:playlistId", authenticate, deletePlaylist);

router.post("/:playlistId/songs", authenticate, addSongToPlaylist);

export default router;
