import mongoose from 'mongoose';
import Creator from './app/models/creatormodel';
import Post from './app/models/postmodel';

let MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.log("⚠️ MONGO_URI not found in process.env, trying alternatives...");
  MONGO_URI = process.env.MONGODB_URI || process.env.MONGODB_URL || process.env.DATABASE_URL;
}
if (!MONGO_URI) throw new Error('MONGO_URI (or alternative) must be set!');

async function main() {
  await mongoose.connect(MONGO_URI!);
  const creators = await Creator.find({});

  for (const creator of creators) {
    if (!creator.user) continue;

    // Update posts: set post.creator from creator.user to creator._id
    await Post.updateMany(
      { creator: creator.user },
      { $set: { creator: creator._id } }
    );
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
