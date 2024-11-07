import mongoose from "mongoose";
import config from "./config";

const connectWithMongoDB = async () => {
  try {
    await mongoose.connect(config.mongodbUrl);

    console.log("MongoDB connected");
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
};

export default connectWithMongoDB;
