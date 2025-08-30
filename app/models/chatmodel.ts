import mongoose, { Schema, Document, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

export interface ChatDocument extends Document {
  uuid: string; // Unique identifier for the chat
  participants: mongoose.Types.ObjectId[]; // user IDs
  content: Array<{
    type: 'text' | 'photo' | 'video' | 'file'; // message type
    senderId: mongoose.Types.ObjectId;
    message: string; // text or file URL
    createdAt: Date;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const chatSchema = new Schema<ChatDocument>(
  {
    uuid: { type: String, default: uuidv4, unique: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'OFUser', required: true }],
    content: [
      {
        type: { type: String, enum: ['text', 'photo', 'video', 'file'], required: true },
        senderId: { type: Schema.Types.ObjectId, ref: 'OFUser', required: true },
        message: { type: String, required: true },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Chat = mongoose.models?.Chat || model<ChatDocument>('Chat', chatSchema);

export default Chat;
