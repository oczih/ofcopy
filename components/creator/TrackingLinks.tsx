


/* export default function TrackingLinks({ session, creator }: TrackingLinksProps) {
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-bold text-white">Tracking Links</h3>
      <p className="text-gray-400">
        Generate and manage your tracking links for campaigns or affiliates.
      </p>

      <div className="bg-white/10 border border-white/20 rounded-2xl p-6 space-y-5">
        {creator?.trackingLinks && creator.trackingLinks.length > 0 ? (
          <ul className="space-y-3">
            {creator.trackingLinks.map((link, idx) => (
              <li
                key={idx}
                className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/10"
              >
                <span className="text-white truncate">{link.name}</span>
                <a
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:underline"
                >
                  {link.url}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-gray-400">No tracking links yet.</div>
        )}

        <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white font-medium">
          + Create New Link
        </button>
      </div>
    </div>
  )
} */
