/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button';
import { Creator, Subscription } from '@/app/types';
import { useEffect, useMemo, useState } from 'react';
import { Skeleton } from '@mui/material';

interface CancelSubscriptionCardProps {
  subscription: Subscription;
  onConfirm: () => void;
  onCancel: () => void;
  creators: Creator[] | null;
}

const CancelSubscriptionCard: React.FC<CancelSubscriptionCardProps> = ({
  subscription,
  onConfirm,
  onCancel,
  creators
}) => {
    const subscriptionCreator = creators?.find((c: Creator) => c._id === subscription.creatorId)
    const [imageLoading, setImageLoading] = useState(true);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  useEffect(() => {
    const fetchAvatarUrl = async () => {
      if (subscriptionCreator?.avatarKey) {
        try {
          setImageLoading(true);
  
          const key = subscriptionCreator.avatarKey?.replace(/^\/+/, ''); // Remove leading slash
          const res = await fetch("/api/media/download-url", {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({ s3Key: key }),
          });
  
          const data = await res.json();
  
          if (res.ok && data.downloadUrl && data.downloadUrl.startsWith("https://")) {
            setAvatarUrl(data.downloadUrl);
          } else {
            console.error("Invalid download URL:", data.downloadUrl);
          }
        } catch (error) {
          console.error("Error fetching avatar URL:", error);
        } finally {
          setImageLoading(false);
        }
      } else {
        setImageLoading(false);
      }

    };
  
    fetchAvatarUrl();
  }, [subscriptionCreator?.avatarKey]);
  function resolveImageUrl(url: string) {
    if (!url) return null;
    if (url.startsWith("http")) return url; // signed URL is absolute
    return `https://cdn.fanslio.com/${url.replace(/^\/+/, '')}`;
  }
  const resolvedAvatarUrl = useMemo(
    () => resolveImageUrl(avatarUrl ?? ""), // Use empty string if null
    [avatarUrl]
  );
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 max-w-md w-full space-y-6">
        {/* Creator Info */}
        <div className="flex flex-col items-center space-y-4">
        {imageLoading ? (
        <Skeleton className="w-30 h-30 rounded-full bg-gray-200 dark:bg-gray-700" />
        ) : 
        (<img
            src={resolvedAvatarUrl ?? undefined}
            alt={subscriptionCreator?.name || subscriptionCreator?.username || "" }
            width={30} 
            height={30}
            onLoad={() => setImageLoading(false)}
            className="object-cover"
        />)}
          <h3 className="text-white text-lg font-semibold">
            Unsubscribe from @{subscription.creatorUsername}
          </h3>
          <p className="text-gray-400 text-sm text-center">
            {subscription.creatorName} won&apos;t have your support anymore, and you will lose access to{' '}
            <span className="font-semibold text-white">{subscriptionCreator?.posts?.length}</span> exclusive posts.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button variant="outline" className="w-full" onClick={onCancel}>
            Cancel
          </Button>
          <Button className="w-full bg-red-500 hover:bg-red-600" onClick={onConfirm}>
            Unsubscribe
          </Button>
        </div>

        {/* Access Info */}
            <p className="text-gray-400 text-xs text-center">
    You will still have access to the Creator&apos;s content until{' '}
    {subscription.nextBillingDate
        ? new Date(subscription.nextBillingDate).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
        })
        : 'N/A'}
    </p>
      </div>
    </div>
  );
};

export default CancelSubscriptionCard;
