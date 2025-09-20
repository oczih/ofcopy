/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { Creator, Post } from "@/app/types";
import { Session } from "next-auth";
import { X } from "lucide-react";
import { Radio } from "@mui/material";

interface ReportFormProps {
  open: boolean;
  onClose: () => void;
  creator: Creator | null;
  avatarUrl?: string | null;
  session: Session | null;
  post?: Post | null;
}

const REASONS = [
  { value: "offensive", label: "This content is offensive and/or violates 'Fanslio' Terms of Service" },
  { value: "spam", label: "This content is spam" },
  { value: "stolen", label: "This content contains stolen material (DMCA)" },
  { value: "illegal", label: "This content is illegal" },
  { value: "abuse", label: "Report Abuse" },
];

export default function ReportForm({
  open,
  onClose,
  creator,
  avatarUrl,
  session,
  post,
}: ReportFormProps) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!open) return null;
  const handleSubmit = async () => {
    if (!reason) return toast.error("Please select a reason.");
    
    setSubmitting(true);
    try {
      const res = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reporter: session?.user?._id,
          creator,
          post,
          reason,
          details,
        }),
      });
      if (res.ok) {
        toast.success("Report submitted successfully.", { duration: 4000 });
        onClose();
      } else {
        toast.error("Failed to submit report. Please try again.");
      }
    } catch (err) {
      console.error(err);
      toast.error("An unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="relative w-full max-w-md bg-gradient-to-br from-[#3c0d6c] to-[#1a0133] border border-white/10 rounded-2xl shadow-2xl overflow-y-auto max-h-[90vh] p-6 text-white backdrop-blur-xl space-y-6">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-300 hover:text-white transition-colors"
        >
          <X size={22} />
        </button>

        {/* Creator Info */}
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl || "/default-avatar.png"}
            alt={creator?.name ?? "Creator"}
            className="w-12 h-12 rounded-full border border-white/20 object-cover"
          />
          <div>
            <p className="font-semibold text-lg">{creator?.name}</p>
            <p className="text-xs text-gray-300">
              Reporting {post ? "a post" : "this profile"}
            </p>
          </div>
        </div>

        {/* Reason Buttons */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Reason for report
          </label>
          <div className="flex flex-col gap-2 w-full">
  {REASONS.map((r) => (
    <label
      key={r.value}
      className={`w-full flex items-center gap-3 cursor-pointer rounded-full px-4 py-2 text-sm font-semibold transition-colors duration-200

            "bg-white/10 text-gray-200 hover:bg-white/20"
        `}
    >
      <Radio
        checked={reason === r.value}
        onChange={() => setReason(r.value)}
        value={r.value}
        name="report-reason"
        sx={{
          color: "white",
          "&.Mui-checked": {
            color: "white",
          },
        }}
      />
      {r.label}
    </label>
  ))}
</div>
        </div>

        {/* Additional Details */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-200">
            Additional details (optional)
          </label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Provide any extra context..."
            className="resize-none w-full border border-white/20 bg-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-pink-400 min-h-[100px]"
          />
        </div>

        {/* Terms */}

        {/* Submit */}
        <button
          disabled={ submitting}
          onClick={handleSubmit}
          className="w-full py-3 cursor-pointer rounded-full font-bold transition-colors duration-200
             bg-[#3c0d6c] hover:bg-[#4d138a]"

        >
          {submitting ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </div>
  );
}
