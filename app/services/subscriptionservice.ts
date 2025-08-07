import OFUser from '../models/usermodel';
import Creator from '../models/creatormodel';
import { Subscription } from '../types';
import { v4 as uuidv4 } from 'uuid';
export class SubscriptionService {
  /**
   * Add a subscription for a user to a creator
   */
  static async addSubscription(
    userId: string, 
    creatorId: string, 
    price: number
  ): Promise<Subscription | null> {
    try {
      // Get creator information
      const creator = await Creator.findById(creatorId);
      if (!creator) {
        throw new Error('Creator not found');
      }

      // Create subscription object
      const subscription: Subscription = {
        id: uuidv4(),
        creatorId: creatorId,
        creatorName: creator.name,
        creatorUsername: creator.username,
        subscriptionDate: new Date(),
        price: price,
        status: 'active',
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        autoRenew: true
      };

      // Add subscription to user
      const user = await OFUser.findByIdAndUpdate(
        userId,
        { 
          $push: { subscriptions: subscription },
          $set: { hasAccess: true } // Give user access when they subscribe
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Update creator's subscriber count
      await Creator.findByIdAndUpdate(
        creatorId,
        { $inc: { subscribers: 1 } }
      );

      return subscription;
    } catch (error) {
      console.error('Error adding subscription:', error);
      return null;
    }
  }

  /**
   * Remove a subscription for a user
   */
  static async removeSubscription(
    userId: string, 
    creatorId: string
  ): Promise<boolean> {
    try {
      // Remove subscription from user
      const user = await OFUser.findByIdAndUpdate(
        userId,
        { 
          $pull: { subscriptions: { creatorId: creatorId } }
        },
        { new: true }
      );

      if (!user) {
        throw new Error('User not found');
      }

      // Update creator's subscriber count
      await Creator.findByIdAndUpdate(
        creatorId,
        { $inc: { subscribers: -1 } }
      );

      return true;
    } catch (error) {
      console.error('Error removing subscription:', error);
      return false;
    }
  }

  /**
   * Get all subscriptions for a user
   */
  static async getUserSubscriptions(userId: string): Promise<Subscription[]> {
    try {
      const user = await OFUser.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      return user.subscriptions || [];
    } catch (error) {
      console.error('Error getting user subscriptions:', error);
      return [];
    }
  }

  /**
   * Check if user is subscribed to a specific creator
   */
  static async isSubscribedToCreator(
    userId: string, 
    creatorId: string
  ): Promise<boolean> {
    try {
      const user = await OFUser.findById(userId);
      if (!user || !user.subscriptions) {
        return false;
      }

      return user.subscriptions.some(
        (sub: Subscription) => sub.creatorId === creatorId && sub.status === 'active'
      );
    } catch (error) {
      console.error('Error checking subscription status:', error);
      return false;
    }
  }

  /**
   * Update subscription status
   */
  static async updateSubscriptionStatus(
    userId: string,
    creatorId: string,
    status: 'active' | 'cancelled' | 'expired'
  ): Promise<boolean> {
    try {
      const result = await OFUser.updateOne(
        { 
          _id: userId,
          'subscriptions.creatorId': creatorId 
        },
        { 
          $set: { 'subscriptions.$.status': status }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error updating subscription status:', error);
      return false;
    }
  }

  /**
   * Get subscription count for a user
   */
  static async getSubscriptionCount(userId: string): Promise<number> {
    try {
      const user = await OFUser.findById(userId);
      if (!user || !user.subscriptions) {
        return 0;
      }

      return user.subscriptions.filter((sub: Subscription) => sub.status === 'active').length;
    } catch (error) {
      console.error('Error getting subscription count:', error);
      return 0;
    }
  }

  /**
   * Cancel auto-renew for a subscription
   */
  static async cancelAutoRenew(
    userId: string,
    creatorId: string
  ): Promise<boolean> {
    try {
      const result = await OFUser.updateOne(
        { 
          _id: userId,
          'subscriptions.creatorId': creatorId 
        },
        { 
          $set: { 'subscriptions.$.autoRenew': false }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error cancelling auto-renew:', error);
      return false;
    }
  }

  /**
   * Enable auto-renew for a subscription
   */
  static async enableAutoRenew(
    userId: string,
    creatorId: string
  ): Promise<boolean> {
    try {
      const result = await OFUser.updateOne(
        { 
          _id: userId,
          'subscriptions.creatorId': creatorId 
        },
        { 
          $set: { 'subscriptions.$.autoRenew': true }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error('Error enabling auto-renew:', error);
      return false;
    }
  }
} 