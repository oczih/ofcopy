import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Define the NotificationType union type
export type NotificationType = 'newsub' | 'resub' | 'tip' | 'subcancel' | 'comment' | 'like' | 'newfollower' | 'promotion' | 'post';

export interface NotificationDocument extends Document {
  type: NotificationType;
  date: Date;
  by: Types.ObjectId;
  seen: boolean;
  for: Types.ObjectId[];
  postId?: Types.ObjectId;
  creatorId?: Types.ObjectId; // Array of User IDs
}

const notificationSchema = new Schema<NotificationDocument>({
  type: { 
    type: String, 
    enum: ['newsub', 'resub', 'tip', 'subcancel', 'comment', 'like', 'newfollower', 'promotion', 'post'], 
    required: true 
  },
  by: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  seen: { type: Boolean, required: true },
  for: [{
    id: { type: Schema.Types.ObjectId, required: true },
    model: { type: String, enum: ['User', 'Creator'], required: true }
  }],
  postId: { type: Schema.Types.ObjectId, ref: 'Post' },
  creatorId: { type: Schema.Types.ObjectId, ref: 'Creator' }
}, {
  timestamps: true,
});

// Use a consistent model name, e.g. Notification
const Notification = mongoose.models.Notification || model<NotificationDocument>('Notification', notificationSchema);

export default Notification;
