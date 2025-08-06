import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import Creator from '@/app/models/creatormodel';
import OFUser from '@/app/models/usermodel';
import { auth } from '@/lib/auth-client';

export async function GET() {
  
  await connectDB();
  try {
    // Calculate real stats from the database
    const [
      totalCreators,
      totalUsers,
      totalSubscriptions,
      totalRevenue
    ] = await Promise.all([
      // Count total creators
      Creator.countDocuments({}),
      // Count total users
      OFUser.countDocuments({}),
      // Count total active subscriptions
      OFUser.aggregate([
        { $unwind: '$subscriptions' },
        { $match: { 'subscriptions.status': 'active' } },
        { $count: 'total' }
      ]),
      // Calculate total revenue from active subscriptions
      OFUser.aggregate([
        { $unwind: '$subscriptions' },
        { $match: { 'subscriptions.status': 'active' } },
        { $group: { _id: null, total: { $sum: '$subscriptions.price' } } }
      ])
    ]);

    // Get subscription count (handle empty result)
    const subscriptionCount = totalSubscriptions[0]?.total || 0;
    const revenue = totalRevenue[0]?.total || 0;

    // Calculate additional stats
    const activeCreators = await Creator.countDocuments({ subscribers: { $gt: 0 } });
    const premiumCreators = await Creator.countDocuments({ price: { $gt: 0 } });

    const stats = {
      totalCreators,
      activeCreators,
      premiumCreators,
      totalUsers,
      totalSubscriptions: subscriptionCount,
      totalRevenue: revenue,
      averageSubscribers: totalCreators > 0 ? Math.round((await Creator.aggregate([
        { $group: { _id: null, avg: { $avg: '$subscribers' } } }
      ]))[0]?.avg || 0) : 0,
      averagePrice: totalCreators > 0 ? Math.round((await Creator.aggregate([
        { $group: { _id: null, avg: { $avg: '$price' } } }
      ]))[0]?.avg || 0) : 0
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
} 