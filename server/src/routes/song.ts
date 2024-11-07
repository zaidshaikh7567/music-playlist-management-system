import express from "express";
import { authenticate } from "../middlewares/auth";
import { searchSongs } from "../controllers/song";

const router = express.Router();

router.get("/search", authenticate, searchSongs);

export default router;
