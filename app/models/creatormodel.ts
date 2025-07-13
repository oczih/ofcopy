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
    lastUsernameChange?: Date;
    subscribers?: number;
    price?: number;
    category?: string;
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
}, { timestamps: true })

const Creator = mongoose.models.Creator || model<CreatorDocument>("Creator", creatorSchema);

export default Creator;