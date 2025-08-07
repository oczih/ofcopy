'use client';
import { SessionProvider} from "next-auth/react";

export default function SubscriptionsPage() {
  return (
    <SessionProvider>
      <Subscriptions />
    </SessionProvider>
  );
}

function Subscriptions() {


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
    </div>
  );
}
