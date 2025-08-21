/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { CreatorApplicationType } from "@/app/types";

export default function ApplicationCard({
  app,
  tab,
  onAction,
  actionLoading,
  photoUrls
}: {
  app: CreatorApplicationType;
  tab: string;
  onAction: (id: string, action: "accept" | "reject", rejectionReason?: string) => void;
  actionLoading: boolean;
  photoUrls: Record<string,string>
}) {
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [reasonModal, setReasonModal] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("");
  const photos = [
    { label: "Profile Pic", key: photoUrls?.profilePic || app.profilePic },
    { label: "ID Front", key: photoUrls?.idFrontPhoto || app.idFrontPhoto },
    { label: "ID Back", key: photoUrls?.idBackPhoto || app.idBackPhoto },
    { label: "Selfie with ID", key: photoUrls?.selfieWithId || app.selfieWithId },
  ]
    .map(p => ({ ...p, key: typeof p.key === "string" ? p.key : p.key }))
    .filter(p => p.key);

  return (
    <>
      <div className="bg-white/10 rounded-2xl p-6 shadow-lg hover:shadow-xl transition duration-300 flex flex-col gap-4 border border-gray-200">
        {/* User Info */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="font-bold text-xl text-white">{app.displayName}</div>
            <div className="text-white">@{app.handle}</div>
            <div className="text-white text-sm mt-1">{app.bio}</div>
          </div>
          <div className="text-right text-white text-sm space-y-1">
            <div>Country: {app.country}</div>
            <div>Subscription: ${app.subscriptionPrice || "N/A"}</div>
            <div>Full Name: {app.fullLegalName || "N/A"}</div>
            <div>
              Birth Date: {app.birthDate ? new Date(app.birthDate).toLocaleDateString() : "N/A"}
            </div>
          </div>
        </div>

        {/* Photos */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
             {photos.map(p => (
        <div key={p.label} className="flex flex-col cursor-pointer items-center" onClick={() => {
          if (typeof p.key === "string") {
            setActiveImage(p.key);
          } else if (p.key && "key" in p.key) {
            // if p.key is FileMetaType
            setActiveImage(p.key.s3Key);
          } else {
            setActiveImage(null); // fallback
          }
        }}>
          <span className="text-sm text-white mb-1">{p.label}</span>
          <img
              src={typeof p.key === "string" ? p.key : p.key?.s3Key ?? ""}
              alt={p.label}
              className="rounded-lg object-cover border border-gray-300 w-32 h-32"
            />
            </div>
          ))}
          </div>
        )}
        {activeImage &&
        createPortal(
          <div
            className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center"
            onClick={() => setActiveImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/30 hover:bg-white/60 transition cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                setActiveImage(null);
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={activeImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
        {/* Actions */}
        {tab === "pending" && (
          <div className="flex gap-3 mt-4">
            <button
              onClick={() => onAction(app._id, "accept")}
              disabled={actionLoading}
              className="flex-1 bg-green-500 text-white cursor-pointer px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 transition"
            >
              Accept
            </button>
            <button
              onClick={() => setReasonModal(true)}
              disabled={actionLoading}
              className="flex-1 bg-red-500 text-white px-4 py-2 cursor-pointer rounded-lg hover:bg-red-600 disabled:opacity-50 transition"
            >
              Reject
            </button>
          </div>
        )}
      </div>
       {/* Rejection Reason Modal */}
       {reasonModal &&
  createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70">
      <div className="bg-[#3b0364] rounded-lg p-6 w-96 max-w-full flex flex-col gap-4 relative">
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 cursor-pointer"
          onClick={() => setReasonModal(false)}
        >
          <X className="w-5 h-5 text-white" />
        </button>

        <h2 className="text-lg font-bold">Rejection Reason</h2>

        {/* General Reasons */}
        <div className="flex flex-col gap-2">
          <span className="text-sm font-semibold">Select a general reason:</span>
          {[
            "ID is too blurry",
            "Selfie with Fanslio sign is unclear",
            "Sign missing or date missing",
            "Wrong country on document",
            "Photo does not match user",
          ].map(reason => (
            <button
              key={reason}
              className={`text-left px-3 py-2 border border-gray-300 rounded-md hover:bg-white/30 transition cursor-pointer
                ${rejectionReason === reason ? "bg-gray-200 font-semibold" : ""}`}
              onClick={() => setRejectionReason(reason)}
            >
              {reason}
            </button>
          ))}
        </div>

        {/* Custom Reason */}
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold">Custom reason (optional):</span>
          <textarea
            className="border border-gray-300 rounded-md p-2 w-full h-24 resize-none"
            placeholder="Add extra details here..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-900 transition cursor-pointer"
            onClick={() => setReasonModal(false)}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition cursor-pointer"
            onClick={() => {
              onAction(app._id, "reject", rejectionReason);
              setReasonModal(false);
              setRejectionReason("");
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}

      {/* Fullscreen Image Modal */}
      {activeImage &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90"
            onClick={() => setActiveImage(null)}
          >
            <button
              className="absolute top-4 right-4 p-2 rounded-full bg-white/30 hover:bg-white/60 transition cursor-pointer"
              onClick={e => {
                e.stopPropagation();
                setActiveImage(null);
              }}
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={activeImage}
              alt="Full size"
              className="max-w-full max-h-full object-contain"
              onClick={e => e.stopPropagation()}
            />
          </div>,
          document.body
        )}
    </>
  );
}
