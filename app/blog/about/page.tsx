'use client'

import Link from "next/link";

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 py-24 px-6">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <div className="inline-block mb-6 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-medium">
            💡 About Fanslio
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Empowering <span className="italic font-light">Creators</span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-200 to-pink-200">
              Around the World
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Our mission is to give creators the tools to succeed and thrive.
          </p>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
      </section>

      {/* Mission Section */}
      <section className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="text-4xl font-bold text-gray-900 mb-6">
            Our Mission
          </h2>
          <p className="text-gray-600 mb-4 text-lg">
            At Fanslio, we believe creators should focus on their passion while
            we provide the tools, strategies, and support to grow their
            audience and income.
          </p>
          <p className="text-gray-600 text-lg">
            Whether you’re just starting or already established, our platform
            gives you the power to build meaningful connections and unlock new
            opportunities.
          </p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl p-12 flex items-center justify-center shadow-2xl text-8xl text-white">
          🚀
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Our Core Values
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            The principles that guide us in building a platform for creators.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="text-6xl mb-4">✨</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Innovation</h3>
            <p className="text-gray-600">
              We constantly innovate to give creators cutting-edge tools and
              opportunities.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="text-6xl mb-4">🤝</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Community</h3>
            <p className="text-gray-600">
              We foster strong connections between creators and their fans,
              building lasting communities.
            </p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="text-6xl mb-4">🌍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Global Impact</h3>
            <p className="text-gray-600">
              Our vision is to empower creators worldwide, regardless of where
              they come from.
            </p>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Meet the Team
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            A group of passionate creators, strategists, and technologists
            behind Fanslio.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl text-white mx-auto mb-4">
              👩‍💻
            </div>
            <h3 className="text-xl font-bold text-gray-900">Alex</h3>
            <p className="text-gray-600 text-sm">Founder & CEO</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl text-white mx-auto mb-4">
              🎨
            </div>
            <h3 className="text-xl font-bold text-gray-900">Jamie</h3>
            <p className="text-gray-600 text-sm">Head of Design</p>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-2xl transition-all">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl text-white mx-auto mb-4">
              🚀
            </div>
            <h3 className="text-xl font-bold text-gray-900">Taylor</h3>
            <p className="text-gray-600 text-sm">Growth Strategist</p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="bg-white py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h4 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join the Movement?
          </h4>
          <p className="text-gray-600 mb-8">
            Be part of a platform built for creators, by creators.
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
