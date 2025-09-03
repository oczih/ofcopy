import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2) {
    return;
  }

  const MONGO_URI =
    process.env.MONGO_URI ||
    process.env.MONGODB_URI ||
    process.env.MONGODB_URL ||
    process.env.DATABASE_URL;

  if (!MONGO_URI) {
    throw new Error("❌ MONGO_URI environment variable is not defined");
  }

  try {
    await mongoose.connect(MONGO_URI);
    isConnected = true;

    // Import models once after connection
    if (!mongoose.models.User) {
      await import("@/app/models/usermodel");
    }
    if (!mongoose.models.Creator) {
      await import("@/app/models/creatormodel");
    }
    if (!mongoose.models.Post) {
      await import("@/app/models/postmodel");
    }
  } catch (error) {
    throw error;
  }
};
