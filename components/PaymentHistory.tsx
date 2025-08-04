import { History } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Session } from 'next-auth';
import { Subscription, User } from '@/app/types';

interface Purchase {
  id: string;
  creatorId: string;
  creatorName: string;
  amount: number;
  description: string;
  purchaseDate: Date;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  type: 'subscription' | 'tip' | 'content';
}

interface PaymentHistoryProps {
  session: Session | null;
}

const PaymentHistory: React.FC<PaymentHistoryProps> = ({ session }) => {

  const purchases = (session?.user as any)?.purchases || [];
  const subscriptions = (session?.user as any)?.subscriptions || [];

  // Combine purchases and subscription payments into a unified history
  const paymentHistory = [
    // Map purchases to payment history format
    ...purchases.map((purchase: Purchase) => ({
      id: purchase.id,
      date: purchase.purchaseDate,
      amount: purchase.amount,
      description: purchase.description,
      status: purchase.status,
      type: purchase.type,
      creatorName: purchase.creatorName
    })),
    // Map subscription payments (using subscription date as payment date)
    ...subscriptions.map((subscription: Subscription) => ({
      id: subscription.creatorId.toString(),
      date: subscription.subscriptionDate,
      amount: subscription.price,
      description: `${subscription.creatorName} - Monthly Subscription`,
      status: subscription.status === 'active' ? 'completed' : subscription.status,
      type: 'subscription',
      creatorName: subscription.creatorName
    }))
  ];

  // Sort by date (most recent first)
  const sortedHistory = paymentHistory.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(new Date(date));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500 text-white text-xs">Completed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-white text-xs">Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 text-white text-xs">Failed</Badge>;
      case 'refunded':
        return <Badge className="bg-gray-500 text-white text-xs">Refunded</Badge>;
      case 'cancelled':
        return <Badge className="bg-orange-500 text-white text-xs">Cancelled</Badge>;
      case 'expired':
        return <Badge className="bg-red-500 text-white text-xs">Expired</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white text-xs">{status}</Badge>;
    }
  };

  if (sortedHistory.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">Payment History</h3>
          <p className="text-gray-400">View your past transactions</p>
        </div>
        <div className="text-center py-12">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Payment History</h3>
          <p className="text-gray-400">You haven't made any payments yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">Payment History</h3>
        <p className="text-gray-400">View your past transactions</p>
      </div>
      
      <div className="space-y-3">
        {sortedHistory.map((payment) => (
          <div key={`${payment.type}-${payment.id}-${payment.date}`} className="bg-white/5 rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <History className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-white font-medium">{payment.description}</p>
                  <p className="text-gray-400 text-sm">
                    {formatDate(payment.date)} • {payment.creatorName}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white font-semibold">${payment.amount.toFixed(2)}</p>
                {getStatusBadge(payment.status)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentHistory;