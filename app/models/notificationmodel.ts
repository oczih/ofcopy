import mongoose, { Schema, model, Document, Types } from 'mongoose';

// Define the NotificationType union type
export type NotificationType = 'newsub' | 'resub' | 'tip' | 'subcancel' | 'comment' | 'like' | 'newfollower' | 'promotion';

export interface NotificationDocument extends Document {
  type: NotificationType;
  date: Date;
  seen: boolean;
  for: Types.ObjectId[]; // Array of User IDs
}

const notificationSchema = new Schema<NotificationDocument>({
  type: { 
    type: String, 
    enum: ['newsub', 'resub', 'tip', 'subcancel', 'comment', 'like', 'newfollower'], 
    required: true 
  },
  date: { type: Date, required: true },
  seen: { type: Boolean, required: true },
  for: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }],
}, {
  timestamps: true,
});

// Use a consistent model name, e.g. Notification
const Notification = mongoose.models.Notification || model<NotificationDocument>('Notification', notificationSchema);

export default Notification;
