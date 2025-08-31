"use client";

import { ArrowLeft } from "lucide-react";

export default function ChildProtectionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-12 relative">
       <button
        onClick={() => window.history.back()}
        className="absolute top-8 cursor-pointer left-8 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white mt-16 sm:mt-0">
        <h1 className="text-3xl font-extrabold mb-6 text-pink-400 text-center">
          18 USC 2257 Declaration
        </h1>
        <div className="space-y-4 text-left text-gray-300">
          <p>
            Fanslio does not produce (in any way) the content available on the
            fanslio.com website. With regards to the American law 18 USC 2257,
            for all content available on this site, please send your request to
            the creator who posted the content.
          </p>
          <p>
            Fanslio is a social network that enables the sharing and viewing of
            different types of content (videos and photos). Even though Fanslio
            does its best to verify the compliance of all hosted content, it is
            possible that its checks are not always 100% effective.
          </p>
          <div>
            <h3 className="font-bold text-pink-400 mb-2">
              Fanslio respects the following procedures to ensure conformity:
            </h3>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>
                Demand that all “creator” users are 18 years old or over to sign
                up and add videos and photos.
              </li>
              <li>
                To get help and/or information about identifying the creator of
                certain content, please contact our customer relations service
                at{" "}
                <span className="underline">support@fanslio.com</span>.
              </li>
            </ul>
          </div>
          <p>
            Fanslio enables its users to report content as inappropriate. If
            certain content is reported as being illegal, harassing, harmful,
            offensive, or for any other reason, Fanslio will delete it
            immediately from its platform.
          </p>
          <p>
            Fanslio users who find this sort of content are asked to report it
            as inappropriate by clicking on the{" "}
            <span className="italic">&quot;Report this content&quot;</span> link located
            under each video and photo.
          </p>
        </div>
      </div>
    </div>
  );
}
