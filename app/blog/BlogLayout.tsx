'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface BlogLayoutProps {
  children: ReactNode;
}

export default function BlogLayout({ children }: BlogLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-900 via-slate-950 to-black text-gray-100">
      {/* === HEADER === */}
      <header className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          {/* Blog Logo / Title */}
          <Link
            href="/"
            className="text-xl font-bold text-white hover:text-pink-400 transition"
          >
            Fanslio Blog
          </Link>

          <nav className="flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="hover:text-pink-400 transition-colors"
            >
              Home
            </Link>
            <Link
              href="/about"
              className="hover:text-pink-400 transition-colors"
            >
              About
            </Link>
            <Link
              href="https://fanslio.com"
              className="hover:text-pink-400 transition-colors"
            >
              Main Site
            </Link>
            <Button
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow hover:opacity-90 transition"
              asChild
            >
              <Link href="/subscribe">Subscribe</Link>
            </Button>
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
