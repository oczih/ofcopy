import { Creator } from "@/app/types"
import { Session } from "next-auth"

type ProfileProps = {
  session: Session
  creator: Creator
}

export default function CreatorProfile({ creator }: ProfileProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Profile Settings</h3>
      <p className="text-gray-400">Update your display name, bio, and creator-specific preferences.</p>

      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-6">

        {/* Creator-specific toggles */}
        <div className="space-y-4">
          {/* Discoverability */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Discoverability</span>
              <input
                type="checkbox"
                className="scale-125 accent-emerald-500"
                defaultChecked={creator.isDiscoverable}
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Choose if you want to make yourself discoverable to other users.
            </p>
          </div>

          {/* Follow for free */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Follow for Free</span>
              <input
                type="checkbox"
                className="scale-125 accent-emerald-500"
                defaultChecked={creator.followForFree}
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Choose if you want other users to follow you for free.
            </p>
          </div>

          {/* Allow followers messaging */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Allow Followers Messaging</span>
              <input
                type="checkbox"
                className="scale-125 accent-emerald-500"
                defaultChecked={creator.allowFollowerMessages}
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Choose if you want followers to be able to message you freely. (No tip required)
            </p>
          </div>

          {/* Blur preview images */}
          <div className="flex flex-col">
            <div className="flex justify-between items-center">
              <span className="text-white font-medium">Blur Preview Images</span>
              <input
                type="checkbox"
                className="scale-125 accent-emerald-500"
                defaultChecked={creator.blurPreviewImages}
              />
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Show your paid content with a blurred preview. Hint: this increases sales!
            </p>
          </div>
        </div>

        <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-medium mt-4">
          Save Profile
        </button>
      </div>
    </div>
  )
}
