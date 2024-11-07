import mongoose, { Document, Schema } from "mongoose";

interface ISong {
  title: string;
  artist: string;
  album: string;
  spotifyId: string;
}

export interface IPlaylist extends Document {
  userId: string;
  name: string;
  description?: string;
  songs: ISong[];
}

const playlistSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  description: { type: String },
  songs: [
    {
      title: String,
      artist: String,
      album: String,
      spotifyId: String,
    },
  ],
});

export default mongoose.model<IPlaylist>("Playlist", playlistSchema);
