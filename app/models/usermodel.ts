import mongoose, { Schema, model } from "mongoose";

export interface UserDocument {
    _id: string;
  username: string;
  password: string
  email: string
  name: string
  googleId: string | null,
  image?: string;
  oauthProvider?: string;
  oauthId?: string;
  hasAccess?: boolean;
  customerId?: string;
  priceId?: string;
  membership?: boolean;
  lastUsernameChange?: Date;
}


const userSchema = new Schema<UserDocument>({
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
  hasAccess: {
    type: Boolean,
    default: false,
  },
  customerId: {
    type: String,
    validate(value: string) {
      return value.includes("cus_");
    },
  },
  priceId: {
    type: String,
    validate(value: string) {
      return value.includes("price_");
    },
  },
  membership: {
    type: Boolean,
    default: false,
  },
  lastUsernameChange: {
    type: Date,
    default: '',
  },
}, { timestamps: true });

userSchema.set('toJSON', {
    transform: (_doc, ret: Record<string, any>) => {
      ret.id = ret._id?.toString();
      if ('_id' in ret) delete ret._id;
      if ('__v' in ret) delete ret.__v;
      if ('password' in ret) delete ret.password;
    },
  });
const OFUser = mongoose.models?.OFUser || model<UserDocument>('OFUser', userSchema);

console.log("[OFUser] Model registered:", !!OFUser);

export default OFUser;