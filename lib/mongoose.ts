// lib/mongoose.ts
import mongoose from "mongoose";

let isConnected: boolean = false;

export const connectDB = async () => {
  console.log("🔗 Attempting to connect to MongoDB...");
  console.log("Current connection status:", isConnected);
  
  if (isConnected) {
    console.log("✅ Already connected to MongoDB");
    return;
  }

  let MONGO_URI = process.env.MONGO_URI;
  
  if (!MONGO_URI) {
    console.log("⚠️ MONGO_URI not found in process.env, trying alternatives...");
    MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DATABASE_URL;
  }


  if (!MONGO_URI) {
    console.error("❌ MONGO_URI is undefined or empty");
    console.error("Available env vars:", Object.keys(process.env));
    throw new Error("❌ MONGO_URI environment variable is not defined");
  }

  try {
    console.log("🌐 Connecting to:", MONGO_URI.substring(0, 50) + "...");
    const db = await mongoose.connect(MONGO_URI);
    isConnected = db.connections[0].readyState === 1;
  
    if (isConnected) {
      console.log("✅ MongoDB connected successfully");
  
      // Always import models AFTER connection
      await import('@/app/models/usermodel');
      await import('@/app/models/creatormodel');
      await import('@/app/models/postmodel');
  
    } else {
      console.log("❌ MongoDB connection failed - readyState:", db.connections[0].readyState);
    }
  
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
};
