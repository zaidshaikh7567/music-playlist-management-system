import express, { Application } from "express";
import cors from "cors";
import config from "./config/config";
import connectWithMongoDB from "./config/db";
import authRoutes from "./routes/auth";
import playlistRoutes from "./routes/playlist";

connectWithMongoDB();

const app: Application = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/playlists", playlistRoutes);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
