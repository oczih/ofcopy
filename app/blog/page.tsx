'use client'

import Link from "next/link";

export default function BlogPage() {


  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 py-24 px-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            ✨ Creator Insights & Tips
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            The <span className="italic font-light">Creator&apos;s</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
              Platform
            </span>{" "}
            of the Future
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Your Blueprint for Fanslio Success
          </p>
          <Link
              href={`${process.env.NEXT_PUBLIC_API_URL}/signup`}
            className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-50 transition-all transform hover:scale-105 shadow-2xl"
          >
            Become a Creator →
          </Link>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Featured Article */}
      <section className="max-w-7xl mx-auto px-6 mt-12">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden hover:shadow-3xl transition-shadow duration-300">
          <Link href="/blog/from-social-media-to-fanvue-proven-conversion-formula/">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-12 flex items-center justify-center">
                <div className="text-9xl transform hover:scale-110 transition-transform duration-300">
                  📈
                </div>
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <span className="inline-block px-3 py-1 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full mb-4 w-fit">
                  FEATURED
                </span>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 hover:text-purple-600 transition-colors">
                  From Social Media to Fanslio: Proven Conversion Formula
                </h2>
                <div className="flex items-center text-gray-600 text-sm">
                  <span className="text-2xl mr-2">👤</span>
                  <span className="font-medium">Fanslio Team</span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Latest Posts Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
          <div>
            <h3 className="text-4xl md:text-5xl font-bold text-gray-900 mb-2">
              Latest <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">Insights</span>
            </h3>
            <p className="text-gray-600">Fresh strategies and tips for creators</p>
          </div>
          <div className="flex items-center gap-3 mt-6 md:mt-0">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl shadow-lg">
              👤
            </div>
            <div className="text-sm">
              <div className="font-semibold text-gray-900">Meet our authors</div>
              <div className="text-gray-600">Expert creators & strategists</div>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* AI Content Post */}
          <article className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <Link href="/blog/ai-content-guidelines/">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 p-8 flex items-center justify-center h-48">
                <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                  🤖
                </div>
              </div>
              <div className="p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                  AI Content Guidelines
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Navigate the future of AI-generated content with confidence
                </p>
                <div className="flex items-center text-gray-500 text-sm">
                  <span className="text-lg mr-2">👤</span>
                  <span>Fanslio Team</span>
                </div>
              </div>
            </Link>
          </article>

          {/* Placeholder cards for design */}
          <article className="group bg-white rounded-2xl shadow-lg cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <Link
            href="/blog/monetization-strategies"
            >
            <div className="bg-gradient-to-br from-pink-500 to-orange-500 p-8 flex items-center justify-center h-48">
              <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                💰
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Monetization Strategies
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Maximize your earnings with proven tactics
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="text-lg mr-2">👤</span>
                <span>Fanslio Team</span>
              </div>
            </div>
            </Link>
          </article>

          <article className="group bg-white rounded-2xl shadow-lg cursor-pointer overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
            <Link
              href="/blog/content-strategy-guide/"
           
            >
            <div className="bg-gradient-to-br from-green-500 to-teal-500 p-8 flex items-center justify-center h-48">
              <div className="text-7xl group-hover:scale-110 transition-transform duration-300">
                🎯
              </div>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-purple-600 transition-colors">
                Content Strategy Guide
              </h2>
              <p className="text-gray-600 text-sm mb-4">
                Build a loyal fanbase with engaging content
              </p>
              <div className="flex items-center text-gray-500 text-sm">
                <span className="text-lg mr-2">👤</span>
                <span>Fanslio Team</span>
              </div>
            </div>
            </Link>
          </article>
        
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h4 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Creator Journey?
          </h4>
          <p className="text-gray-600 mb-8">
            Join thousands of successful creators on Fanslio
          </p>
          <Link
  href={`${process.env.NEXT_PUBLIC_API_URL}/signup`}
            className="inline-block px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full hover:shadow-2xl transition-all transform hover:scale-105"
          >
            Get Started Today →
          </Link>
        </div>
      </section>
    </main>
  );
}