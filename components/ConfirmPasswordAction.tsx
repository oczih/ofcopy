'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function ConfirmPasswordAction() {
  const [loading, setLoading] = useState(true);
  const [confirmed, setConfirmed] = useState(false);
  const [isAddingPassword, setIsAddingPassword] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      toast.error('Invalid confirmation link');
      router.push('/login');
      return;
    }

    const confirmAction = async () => {
      try {
        const res = await fetch('/api/auth/confirm-password-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await res.json();
        
        if (res.ok) {
          setConfirmed(true);
          setIsAddingPassword(data.isAddingPassword);
          const actionType = data.isAddingPassword ? 'Password setup' : 'Password reset';
          toast.success(`${actionType} confirmed! You can now log in with your ${data.isAddingPassword ? 'new' : 'updated'} password.`);
          setTimeout(() => router.push('/login'), 3000);
        } else {
          toast.error(data.error || 'Confirmation failed');
          setTimeout(() => router.push('/login'), 2000);
        }
      } catch (error) {
        toast.error('Something went wrong');
        setTimeout(() => router.push('/login'), 2000);
      } finally {
        setLoading(false);
      }
    };

    confirmAction();
  }, [token, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your request...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        {confirmed ? (
          <>
            <div className={`w-16 h-16 ${isAddingPassword ? 'bg-green-100' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${isAddingPassword ? 'text-green-600' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {isAddingPassword ? 'Password Setup Complete!' : 'Password Reset Confirmed!'}
            </h1>
            <p className="text-gray-600 mb-4">
              Your password has been successfully {isAddingPassword ? 'created' : 'updated'}.
            </p>
            <p className="text-sm text-gray-500">Redirecting to login page...</p>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Confirmation Failed</h1>
            <p className="text-gray-600">The confirmation link is invalid or has expired.</p>
          </>
        )}
      </div>
    </div>
  );
}