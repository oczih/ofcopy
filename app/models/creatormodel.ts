import mongoose, { Schema, model } from "mongoose";

export interface CreatorDocument {
    username: string;
    _id: string;
    name: string;
    email: string;
    password: string;
    googleId: string | null;
    image?: string;
    oauthProvider?: string;
    oauthId?: string;
    bio?: string
    lastUsernameChange?: Date;
    subscribers?: number;
    price?: number;
    category?: string;
    banner?: string  
    posts?: mongoose.Types.ObjectId[];
}

const creatorSchema = new Schema<CreatorDocument>({
    name: {
        type: String,
        required: [true, "Name is required"]
      },
    username: { type: String, required: false, unique: true },
    password: { type: String },
    email: {
        type: String,
        unique: true,
        required: function() {
        // Email is required only if no OAuth provider is specified (i.e., for credentials login)
        return !this.oauthProvider;
        },
        match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Email is invalid",
        ],
    },

    googleId: {
        type: String,
        default: null,
    },
    image: { type: String },
    banner: {type: String},
    bio: {type: String},
    oauthProvider: { type: String },
    oauthId: { type: String },
    lastUsernameChange: {
        type: Date,
        default: '',
    },
    subscribers: {
        type: Number,
        default: 0,
    },
    price: {
        type: Number,
        default: 9.99,
    },
    category: {
        type: String,
        default: 'General',
    },
    posts: [{ type: Schema.Types.ObjectId, ref: 'Post' }],
}, { timestamps: true })

const Creator = mongoose.models.Creator || model<CreatorDocument>("Creator", creatorSchema);

// Creator Application Model
const CreatorApplicationSchema = new Schema({
  username: { type: String, required: true },
  displayName: { type: String, required: true },
  bio: { type: String, required: true },
  socialLinks: { type: [String], default: [] },
  email: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

export const CreatorApplication = mongoose.models.CreatorApplication || model('CreatorApplication', CreatorApplicationSchema);

export default Creator;