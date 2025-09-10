'use client';

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Creator, CreatorApplicationType, User} from "../types";
import { Session } from "next-auth";
import ApplicationCard from "@/components/ApplicationCard";

const ADMIN_EMAIL = "arvo.matilainen@gmail.com";
const STATUSES = ["pending", "approved", "rejected", "all"];

interface AppProps {
  session: Session | null;
  applications: CreatorApplicationType[];
  users: User[]
  creators: Creator[]
}

export default function AdminDashboard({ session, applications: initialApplications }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [applications, setApplications] = useState<CreatorApplicationType[]>(initialApplications);
  const [photoUrls, setPhotoUrls] = useState<Record<string, Record<string, string>>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);
useEffect(() => {
  const fetchApplicationsWithMedia = async (apps: CreatorApplicationType[]) => {
    setLoading(true);
    try {
      const appsWithMedia = await Promise.all(
        apps.map(async (app) => {
          const mediaKeys = [
            { key: app.profilePic, label: "profilePic" },
            { key: app.idFrontPhoto, label: "idFrontPhoto" },
            { key: app.idBackPhoto, label: "idBackPhoto" },
            { key: app.selfieWithId, label: "selfieWithId" },
          ];

          const mediaUrls: Record<string, string> = {};
          await Promise.all(
            mediaKeys.map(async ({ key, label }) => {
              if (!key) return;
              try {
                const res = await fetch("/api/media/download-url", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ s3Key: key }),
                });
                const data = await res.json();
                if (res.ok && data.downloadUrl) mediaUrls[label] = data.downloadUrl;
              } catch (err) {
                console.error(`Error fetching ${label} for ${app._id}:`, err);
              }
            })
          );
          setPhotoUrls(prev => ({ ...prev, [app._id]: mediaUrls })); // store by app ID
          return { ...app, mediaUrls };
        })
      );

      setApplications(appsWithMedia);
    } catch (err) {
      console.error("Failed fetching media URLs:", err);
      setError("Failed to fetch application media");
    } finally {
      setLoading(false);
    }
  };

  if (applications.length > 0) {
    fetchApplicationsWithMedia(applications);
  }
}, [applications]);



  // Handle accept/reject actions
  async function handleAction(
    id: string,
    action: "accept" | "reject",
    reason?: string
  ): Promise<void> {
    setActionLoading(prev => ({ ...prev, [id]: true }));
  
    try {
      const body: { action: "accept" | "reject"; reason?: string } = { action };
  
      if (reason) body.reason = reason;
  
      const response = await fetch(`/api/creators/apply/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
  
      if (!response.ok) {
        throw new Error("Failed to perform action");
      }
  
      // handle success...
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  }


  if (!mounted) return <LoadingScreen />;

  if (!session) return <LoginScreen />;

  if (session.user.email !== ADMIN_EMAIL) return <AccessDenied />;

  return (
    <div className="max-w-3xl mx-auto py-12">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-gray-600">
          Sign out
        </button>
      </header>

      <TabBar tab={tab} setTab={setTab} />

      {loading && <div className="text-center mb-4">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="space-y-6">
          {applications
            .filter(app =>
              tab === "all" ? true : app.status === tab // filter by tab unless it's "all"
            )
            .map(app => (
              <ApplicationCard
                key={app._id}
                app={app}
                photoUrls={photoUrls[app._id] || {}}
                tab={tab}
                onAction={handleAction}
                actionLoading={!!actionLoading[app._id]}
              />
            ))}

          {applications.filter(app => tab === "all" ? true : app.status === tab).length === 0 && (
            <div className="text-center text-gray-400">No applications found.</div>
          )}
        </div>
    </div>
  );
}

// -------------------- Components --------------------

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="text-lg font-medium text-slate-700">Loading Fanslio...</span>
      </div>
    </div>
  );
}

function LoginScreen() {
  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
      <button onClick={() => signIn()} className="bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600">
        Login with your account
      </button>
    </div>
  );
}

function AccessDenied() {
  return (
    <div className="max-w-md mx-auto py-12 text-center">
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      <p className="mb-4">You are not authorized to view this page.</p>
      <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
        Sign out
      </button>
    </div>
  );
}

function TabBar({ tab, setTab }: { tab: string; setTab: (t: string) => void }) {
  return (
    <div className="flex gap-2 mb-6">
      {STATUSES.map(s => (
        <button
          key={s}
          onClick={() => { setTab(s) }}
          className={`px-4 py-2 rounded cursor-pointer font-medium ${
            tab === s ? "bg-pink-500 text-white" : "bg-white/10 text-gray-200 hover:bg-white/20"
          }`}
        >
          {s.charAt(0).toUpperCase() + s.slice(1)}
        </button>
      ))}
    </div>
  );
}

