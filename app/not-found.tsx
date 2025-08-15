import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen text-center">
      <h1 className="text-6xl font-bold mb-4">404</h1>
      <p className="text-xl mb-6">Oops! The page you’re looking for doesn’t exist.</p>
      <Link
  href="/discover"
  className="px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors duration-500"
>
  Go to Discover
</Link>
    </div>
  );
}