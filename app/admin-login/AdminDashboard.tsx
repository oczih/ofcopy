'use client';

import { signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { Creator, CreatorApplicationType, ReportType, User } from "../types";
import { Session } from "next-auth";
import ApplicationCard from "@/components/ApplicationCard";
import Link from "next/link";
const ADMIN_EMAIL = "arvo.matilainen@gmail.com";
const STATUSES = ["pending", "approved", "rejected", "all"];

interface AppProps {
  session: Session | null;
  applications: CreatorApplicationType[];
  users: User[];
  creators: Creator[];
  reports: ReportType[]; // Add reports
}

export default function AdminDashboard({ session, users,creators, applications: initialApplications, reports: initialReports }: AppProps) {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");
  const [applications, setApplications] = useState<CreatorApplicationType[]>(initialApplications);
  const [reports, setReports] = useState<ReportType[]>(initialReports);
  const [photoUrls, setPhotoUrls] = useState<Record<string, Record<string, string>>>({});
  const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch media URLs only once on mount
  useEffect(() => {
    const fetchApplicationsWithMedia = async (apps: CreatorApplicationType[]) => {
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

            setPhotoUrls(prev => ({ ...prev, [app._id]: mediaUrls }));
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

    if (applications.length > 0) fetchApplicationsWithMedia(applications);
    else setLoading(false);
  }, []); // <-- empty dependency to run only once
  console.log(reports)
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

      if (!response.ok) throw new Error("Failed to perform action");

      // Optionally update local state
      setApplications(prev => prev.map(app => app._id === id ? { ...app, status: action === "accept" ? "approved" : "rejected" } : app));
    } catch (err) {
      console.error(err);
      setError("Action failed");
    } finally {
      setActionLoading(prev => ({ ...prev, [id]: false }));
    }
  }

  if (!mounted) return <LoadingScreen />;
  if (!session) return <LoginScreen />;
  if (session.user.email !== ADMIN_EMAIL) return <AccessDenied />;
  async function handleReportAction(
    reportId: string,
    action: "dismissed" | "reviewed" | "action_taken"
  ) {
    try {
      const res = await fetch(`/api/reports/${reportId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: action }),
      });
  
      if (!res.ok) throw new Error("Failed to update report status");
  
      // ✅ Update local state immediately
      setReports(prev =>
        prev.map(r =>
          r._id === reportId
            ? ({ ...r, status: action, updatedAt: new Date().toISOString() } as ReportType)
            : r
        )
      );
    } catch (err) {
      console.error("Report action failed:", err);
      setError("Failed to update report");
    }
  }
  async function handleDeleteReport(reportId: string) {
    try {
      const res = await fetch(`/api/reports/${reportId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete report");
  
      // Remove report from state
      setReports(prev => prev.filter(r => r._id !== reportId));
    } catch (err) {
      console.error(err);
      setError("Failed to delete report");
    }
  }
  async function handleDeleteAllReports() {
    if (!confirm("Are you sure you want to delete ALL reports?")) return;
  
    try {
      const res = await fetch("/api/reports", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete all reports");
  
      setReports([]); // ✅ Clear local state
    } catch (err) {
      console.error(err);
      setError("Failed to delete all reports");
    }
  }
  return (
    <div className="max-w-4xl mx-auto py-12">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
          Sign out
        </button>
      </header>

      <TabBar tab={tab} setTab={setTab} />

      {loading && <div className="text-center mb-4">Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Creator Applications</h2>
        {applications
          .filter(app => tab === "all" ? true : app.status === tab)
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

<h2 className="text-xl font-semibold mt-8">Reports</h2>
{reports.length > 0 ? (
  <div className="space-y-4">

    <button
      onClick={handleDeleteAllReports}
      className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
    >
      Delete All
    </button>
  
    {reports.map(r => (
      <div
        key={r._id}
        className="p-4 rounded-xl border border-white/10 bg-white/5 flex flex-col gap-2"
      >
        <p>
          <strong>Reporter:</strong>{" "}
          {users?.find(u => u._id.toString() === r.reporter.toString())?.username || "Unknown"}
        </p>
        <p>
          <strong>Reported Creator:</strong>{" "}
          {creators?.find(c => c._id.toString() === r.creator?.toString())?.username || "Unknown"}
        </p>

        {/* ✅ Post Link */}
        {r.post && (
          <p>
            <strong>Post:</strong>{" "}
            <Link
              href={`${process.env.NEXT_PUBLIC_API_URL}/post/${r.post.toString()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-pink-500 hover:underline"
            >
              View Post
            </Link>
          </p>
        )}

        <p><strong>Reason:</strong> {r.reason}</p>
        {r.details && <p><strong>Details:</strong> {r.details}</p>}
        <p className="text-gray-400 text-xs">
          {new Date(r.createdAt).toLocaleString()}
        </p>

        {/* ✅ Action Buttons */}
        <div className="flex gap-3 mt-2">
          <button
            onClick={() => handleReportAction(r._id, "dismissed")}
            className="bg-gray-600 cursor-pointer transition-colors duration-200 text-white px-3 py-1 rounded hover:bg-gray-700"
          >
            Dismiss
          </button>
          <button
            onClick={() => handleReportAction(r._id, "reviewed")}
            className="bg-blue-600 cursor-pointer transition-colors duration-200 text-white px-3 py-1 rounded hover:bg-blue-700"
          >
            Mark Reviewed
          </button>
          <button
            onClick={() => handleReportAction(r._id, "action_taken")}
            className="bg-red-600 cursor-pointer transition-colors duration-200 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Take Action
          </button>
          <button
  onClick={() => handleDeleteReport(r._id)}
  className="bg-red-700 cursor-pointer transition-colors duration-200 text-white px-3 py-1 rounded hover:bg-red-800"
>
  Delete Report
</button>
        </div>

        {/* ✅ Current Status */}
        <p className="text-sm mt-1">
          <strong>Status:</strong> {r.status}
        </p>
      </div>
    ))}
  </div>
) : (
  <div className="text-center text-gray-400">No reports found.</div>
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
          onClick={() => setTab(s)}
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
