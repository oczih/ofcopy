'use client';

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = "arvo.matilainen@gmail.com";
const STATUSES = ["pending", "approved", "rejected", "all"];

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("pending");

  useEffect(() => {
    if (session && session.user.email === ADMIN_EMAIL) {
      fetchApplications(tab);
    }
    // eslint-disable-next-line
  }, [session, tab]);

  async function fetchApplications(status) {
    setLoading(true);
    setError("");
    try {
      let url = "/api/creators/apply";
      if (status && status !== "all") url += `?status=${status}`;
      const res = await fetch(url);
      const data = await res.json();
      setApplications(data.applications || []);
    } catch (err) {
      setError("Failed to load applications");
    } finally {
      setLoading(false);
    }
  }

  async function handleAction(id, action) {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/creators/apply/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error("Failed to update application");
      await fetchApplications(tab);
    } catch (err) {
      setError("Failed to update application");
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") return <div>Loading...</div>;

  if (!session) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Admin Login</h1>
        <button onClick={() => signIn()} className="bg-pink-500 text-white px-4 py-2 rounded">Login with your account</button>
      </div>
    );
  }

  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="max-w-md mx-auto py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You are not authorized to view this page.</p>
        <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 rounded">Sign out</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <button onClick={() => signOut()} className="bg-gray-500 text-white px-4 py-2 rounded mb-6">Sign out</button>
      <div className="flex gap-2 mb-6">
        {STATUSES.map(s => (
          <button
            key={s}
            onClick={() => setTab(s)}
            className={`px-4 py-2 rounded ${tab === s ? 'bg-pink-500 text-white' : 'bg-white/10 text-gray-200'}`}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>
      {loading && <div>Loading...</div>}
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <h2 className="text-xl font-semibold mb-2">
        {tab === "all" ? "All" : tab.charAt(0).toUpperCase() + tab.slice(1)} Creator Applications
      </h2>
      <div className="space-y-4">
  {applications.length === 0 && <div>No applications found.</div>}
  {applications.map(app => (
    <div
      key={app._id}
      className="bg-white/10 rounded-xl p-4 flex flex-col gap-4"
    >
      <div>
        <div className="font-bold text-lg">
          {app.country} (@{app.handle})
        </div>
        <div className="text-gray-300">{app.displayName}</div>
        <div className="text-gray-400">{app.bio}</div>
        <div className="text-gray-400 text-sm">Subscription: ${app.subscriptionPrice?.toFixed(2) || 'N/A'}</div>
        <div className="text-gray-400 text-sm">Full Legal Name: {app.fullLegalName || 'N/A'}</div>
        <div className="text-gray-400 text-sm">Birth Date: {app.birthDate ? new Date(app.birthDate).toLocaleDateString() : 'N/A'}</div>
        <div className="text-xs text-gray-400 mt-1">Status: {app.status}</div>
      </div>

      {/* Photos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-2">
        {app.profilePic && (
          <div>
            <div className="text-xs text-gray-300 mb-1">Profile Pic</div>
            <img src={app.profilePic} alt="Profile" className="rounded w-full object-cover h-32" />
          </div>
        )}
        {app.idFrontPhoto && (
          <div>
            <div className="text-xs text-gray-300 mb-1">ID Front</div>
            <img src={app.idFrontPhoto} alt="ID Front" className="rounded w-full object-cover h-32" />
          </div>
        )}
        {app.idBackPhoto && (
          <div>
            <div className="text-xs text-gray-300 mb-1">ID Back</div>
            <img src={app.idBackPhoto} alt="ID Back" className="rounded w-full object-cover h-32" />
          </div>
        )}
        {app.selfieWithId && (
          <div>
            <div className="text-xs text-gray-300 mb-1">Selfie with ID</div>
            <img src={app.selfieWithId} alt="Selfie with ID" className="rounded w-full object-cover h-32" />
          </div>
        )}
      </div>

      {tab === "pending" && (
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => handleAction(app._id, "accept")}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Accept
          </button>
          <button
            onClick={() => handleAction(app._id, "reject")}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  ))}
</div>

    </div>
  );
} 