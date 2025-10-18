import { Creator } from "@/app/types"
import { Session } from "next-auth"

type CommentingProps = {
  session: Session
  creator: Creator
}

export default function Commenting({ creator }: CommentingProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Commenting Controls</h3>
      <p className="text-gray-400">
        Manage how your audience can comment on your posts and content.
      </p>

      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-5">
        <div className="flex justify-between items-center">
          <span className="text-white font-medium">Enable Comments</span>
          <input
            type="checkbox"
            className="scale-125 accent-emerald-500"
            defaultChecked={creator.commentingEnabled}
          />
        </div>
      </div>

      <button className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-green-600 rounded-xl text-white font-medium">
        Save Comment Settings
      </button>
    </div>
  )
}
