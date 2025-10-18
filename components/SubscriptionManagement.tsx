import { createPortal } from 'react-dom';
import { Star, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Session } from 'next-auth';
import { Creator, Subscription } from '@/app/types';
import { useState } from 'react';
import CancelSubscriptionCard from './CancelSubscriptionCard';

interface SubscriptionManagementProps {
  session: Session | null;
  creators: Creator[]| null;
}

const SubscriptionCard = ({
  subscription,
  onUnsubscribe,
}: {
  subscription: Subscription;
  onUnsubscribe: (subscription: Subscription) => void;
}) => {
  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(
      new Date(date)
    );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500 text-white">Active</Badge>;
      case 'cancelled':
        return <Badge className="bg-yellow-500 text-white">Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-2 bg-purple-500/20 rounded-lg">
            <Star className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h4 className="text-white font-semibold">{subscription.creatorName}</h4>
            <p className="text-gray-400 text-sm">
              {subscription.price > 0 ? `$${subscription.price}/month` : 'Free'}
              {subscription.nextBillingDate && subscription.status === 'active' && (
                <> • Next billing: {formatDate(subscription.nextBillingDate)}</>
              )}
            </p>
            <p className="text-gray-500 text-xs">
              @{subscription.creatorUsername} • Auto-renew: {subscription.autoRenew ? 'On' : 'Off'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          {getStatusBadge(subscription.status)}
          {subscription.status === 'active' && (
            <Button
              variant="outline"
              size="sm"
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
              onClick={() => onUnsubscribe(subscription)}
            >
              Unsubscribe
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

const SubscriptionManagement: React.FC<SubscriptionManagementProps> = ({ session, creators}) => {
  const [cancelSubscription, setCancelSubscription] = useState<Subscription | null>(null);
  const subscriptions = session?.user.subscriptions;

  const handleConfirmCancel = async () => {
    if (!cancelSubscription) return;

    try {
      await fetch('/api/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: cancelSubscription.id }),
      });

      // Optionally update local state / refetch subscriptions
      setCancelSubscription(null);
    } catch (err) {
      console.error('Failed to cancel subscription', err);
    }
  };

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-white mb-2">No Subscriptions</h3>
        <p className="text-gray-400">You haven&apos;t subscribed to any creators yet.</p>
      </div>
    );
  }

  const activeSubscriptions = subscriptions.filter((sub: Subscription) => sub.status === 'active');
  const nonActiveSubscriptions = subscriptions.filter(
    (sub: Subscription) => sub.status === 'cancelled' || sub.status === 'expired'
  );

  return (
    <div className="space-y-6">
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-semibold text-white">Active Subscriptions</h3>
            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
              {activeSubscriptions.length}
            </Badge>
          </div>
          {activeSubscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} onUnsubscribe={setCancelSubscription} />
          ))}
        </div>
      )}

      {nonActiveSubscriptions.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-semibold text-white">Past Subscriptions</h3>
            <Badge className="bg-gray-500/20 text-gray-400 border-gray-500/30">
              {nonActiveSubscriptions.length}
            </Badge>
          </div>
          {nonActiveSubscriptions.map((sub) => (
            <SubscriptionCard key={sub.id} subscription={sub} onUnsubscribe={() => {}} />
          ))}
        </div>
      )}

      {cancelSubscription &&
        createPortal(
          <CancelSubscriptionCard
            subscription={cancelSubscription}
            onCancel={() => setCancelSubscription(null)}
            onConfirm={handleConfirmCancel}
            creators={creators}
          />,
          document.body
        )}
    </div>
  );
};

export default SubscriptionManagement;
