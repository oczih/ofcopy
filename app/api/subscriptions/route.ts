import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/app/services/subscriptionservice';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    // Get user subscriptions
    const subscriptions = await SubscriptionService.getUserSubscriptions(session.user.email);
    
    return NextResponse.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { creatorId, price } = await request.json();

    if (!creatorId || !price) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Add subscription
    const subscription = await SubscriptionService.addSubscription(
      session.user.email,
      creatorId,
      price
    );

    if (!subscription) {
      return NextResponse.json({ error: 'Failed to add subscription' }, { status: 400 });
    }

    return NextResponse.json({ subscription, message: 'Subscription added successfully' });
  } catch (error) {
    console.error('Error adding subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { searchParams } = new URL(request.url);
    const creatorId = searchParams.get('creatorId');

    if (!creatorId) {
      return NextResponse.json({ error: 'Creator ID is required' }, { status: 400 });
    }

    // Remove subscription
    const success = await SubscriptionService.removeSubscription(
      session.user.email,
      creatorId
    );

    if (!success) {
      return NextResponse.json({ error: 'Failed to remove subscription' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Subscription removed successfully' });
  } catch (error) {
    console.error('Error removing subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
  if (!session || session.user.email !== `${process.env.SECEMAIL}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

    const { creatorId, action, status } = await request.json();

    if (!creatorId || !action) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    let success = false;

    switch (action) {
      case 'cancel_auto_renew':
        success = await SubscriptionService.cancelAutoRenew(session.user.email, creatorId);
        break;
      case 'enable_auto_renew':
        success = await SubscriptionService.enableAutoRenew(session.user.email, creatorId);
        break;
      case 'update_status':
        if (!status) {
          return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }
        success = await SubscriptionService.updateSubscriptionStatus(session.user.email, creatorId, status);
        break;
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    if (!success) {
      return NextResponse.json({ error: 'Failed to update subscription' }, { status: 400 });
    }

    return NextResponse.json({ message: 'Subscription updated successfully' });
  } catch (error) {
    console.error('Error updating subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 