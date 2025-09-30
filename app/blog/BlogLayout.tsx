'use client';

import { ScrollProgress } from '@/components/ui/scroll-progress';
import Link from 'next/link';
import { ReactNode } from 'react';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-white to-black text-gray-100">
      {/* === SCROLLBAR === */}
      <ScrollProgress />

      {/* === HEADER === */}
      <header className="border-b border-white/10 bg-white backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Blog Logo / Title */}
          <Link
            href="/blog"
            className="text-xl font-bold text-black hover:text-pink-400 transition"
          >
            Fanslio Blog
          </Link>

          <nav className="flex items-center text-black gap-6 text-sm font-medium">
            <Link
              href="/blog"
              className="hover:text-pink-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/blog/about"
              className="hover:text-pink-400 text-black transition-colors"
            >
              About
            </Link>
            <Link
              href="https://fanslio.com"
              className="hover:text-pink-400 text-black transition-colors"
            >
              Main Site
            </Link>
          </nav>
        </div>
      </header>

      {/* === MAIN CONTENT === */}
      <main className="flex-1 max-w-screen w-full mx-auto space-y-12">
        {children}
      </main>

      {/* === FOOTER === */}
      <footer className="border-t border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-8 text-center text-gray-400 text-sm">
          © {new Date().getFullYear()} Fanslio Blog. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
