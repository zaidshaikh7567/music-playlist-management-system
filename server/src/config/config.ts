import dotenv from "dotenv";

dotenv.config();

const config = {
  port: Number.parseInt(process.env.PORT!) || 5000,
  mongodbUrl:
    process.env.MONGO_URI! || "mongodb://localhost/playlist-management-db",
};

export default config;
