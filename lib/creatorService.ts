import CreatorModel from "@/app/models/creatormodel";
import mongoose from "mongoose";
import { Follower, Gender } from "@/app/types";

type PublicCreator = {
  id: string;
  username: string;
  name: string;
  bio: string;
  avatarKey?: string;
  gender: Gender;
  price: number;
  followersCount: number;
  user: string; // user id as string
};

type LeanCreator = {
  _id: mongoose.Types.ObjectId;
  username: string;
  name: string;
  bio: string;
  avatarKey?: string;
  gender: Gender;
  price: number;
  followers?: Follower[];
  user: mongoose.Types.ObjectId; // ObjectId of user
};

export function sanitizeCreator(creator: LeanCreator): PublicCreator {
  return {
    id: creator._id.toString(),
    username: creator.username,
    name: creator.name,
    bio: creator.bio,
    avatarKey: creator.avatarKey,
    gender: creator.gender,
    price: creator.price,
    followersCount: creator.followers?.length ?? 0,
    user: creator.user.toString(), // include user id as string
  };
}
export type CreatorWithPosts = PublicCreator & {
  posts?: any[]; // adjust type as needed
};

export function sanitizeCreatorWithPosts(creator: any): CreatorWithPosts {
  return {
    ...sanitizeCreator(creator),
    posts: creator.posts ?? [],
  };
}

export async function getAllCreators(fullFields: boolean = false) {
  if (fullFields) {
    const creators = await CreatorModel.find({})
  .populate("followers")
  .populate("posts")
  .lean();
  
    return creators.map(sanitizeCreatorWithPosts);
  }

  // Include 'user' field explicitly
  const creators = await CreatorModel.find(
    {},
    "username name bio avatarKey gender price followers user"
  )
    .populate("followers")
    .lean<LeanCreator>();

  return creators.map(sanitizeCreator);
}

export async function getNonPublicCreatorsByUserId(userId: string, fullFields: boolean = false) {
  const query = {
    public: false,
    user: new mongoose.Types.ObjectId(userId),
  };

  if (fullFields) {
    return CreatorModel.find(query)
      .populate("followers")
      .lean();
  }

  const creators = await CreatorModel.find(
    query,
    "username name bio avatarKey gender price followers user"
  )
    .populate("followers")
    .lean<LeanCreator>();

  return creators.map(sanitizeCreator);
}
