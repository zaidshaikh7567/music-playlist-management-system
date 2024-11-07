import express, { Application } from "express";
import config from "./config/config";
import connectWithMongoDB from "./config/db";

connectWithMongoDB();

const app: Application = express();

app.use(express.json());

app.use("*", (_, res) => {
  res.status(200).json({ message: "Music playlist management system" });
});

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
});
