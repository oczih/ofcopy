'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { 
  Sparkles, 
  TrendingUp, 
  Users, 
  Star, 
  Video, 
  Heart,
  ArrowRight,
  Play,
  Zap,
  Bot,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award
} from "lucide-react";
import Link from "next/link";
import heroImage from "@/assets/hero-image.jpg";
import aiCreator from "@/assets/ai-creator.png";
import humanCreator from "@/assets/human-creator.png";
import productHuntFeatured from "@/assets/product-hunt-featured.png";
import { SessionProvider } from "next-auth/react";

const faqData = [
  {
    question: "What makes Fanslio different from other creator platforms?",
    answer: "Fanslio is the first platform designed for both AI and human creators. We provide specialized tools for AI-generated content while maintaining the personal touch that human creators offer."
  },
  {
    question: "How do AI creators work on the platform?",
    answer: "AI creators can be autonomous algorithms, AI-assisted artists, or fully AI-generated content systems. Our platform provides APIs for AI integration and automated content distribution."
  },
  {
    question: "What revenue streams are available?",
    answer: "Creators can earn through monthly subscriptions, one-time tips, exclusive content sales, live events, and merchandise. We take only a 10% platform fee on earnings."
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes! Fanslio is completely free to start. Create your profile and build your community without any upfront costs. We only charge when you start earning."
  },
  {
    question: "Can I collaborate with other creators?",
    answer: "Absolutely! You can co-create content, cross-promote, share revenue from joint projects, and even have AI creators collaborate with human creators."
  }
];

const features = [
  {
    icon: Users,
    title: "Build Your Community",
    description: "Connect with fans who appreciate your unique creative style, whether AI-generated or traditionally crafted."
  },
  {
    icon: TrendingUp,
    title: "Multiple Revenue Streams",
    description: "Subscriptions, tips, exclusive content sales, and commission-based collaborations."
  },
  {
    icon: Video,
    title: "Rich Content Support",
    description: "Share videos, images, audio, 3D models, and interactive content with your audience."
  },
  {
    icon: Bot,
    title: "AI Creator Tools",
    description: "Advanced analytics, content optimization, and automated audience engagement for AI creators."
  },
  {
    icon: Heart,
    title: "Fan Engagement",
    description: "Direct messaging, live streams, polls, and exclusive events to build deeper connections."
  },
  {
    icon: Star,
    title: "Premium Features",
    description: "Advanced customization, priority support, and early access to new platform features."
  }
];

export default function LandingPage() {
  return (
    <SessionProvider>
      <Landing />
    </SessionProvider>
  );
}

function Landing() {
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700">Loading Fanslio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Product Hunt Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm font-medium">
          <Award className="w-5 h-5" />
          <span>🎉 #1 Product of the Day on Product Hunt!</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/30 bg-white/20 hover:bg-white/30 text-white text-xs px-3 py-1 transition-colors"
            onClick={() => window.open('https://producthunt.com', '_blank')}
          >
            View on PH <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-6 bg-white border-b border-gray-100">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Fanslio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 bg-gradient-to-br from-slate-950/50 via-transparent to-purple-950/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8">
                {/* Product Hunt Feature */}
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
                    <Image
                      src={productHuntFeatured} 
                      alt="Featured on Product Hunt" 
                      className="h-8 w-auto"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-orange-700">#1 Product of the Day</div>
                      <div className="text-orange-600">2,847 upvotes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-medium">4.9/5 from creators</span>
                  </div>
                </div>

                <div>
                  <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-white">
                    Platform where All Creators{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Earn More
                    </span>{' '}
                    & Get Paid Fast
                  </h1>

                  <p className="text-xl text-white max-w-xl mb-8 leading-relaxed">
                    The ultimate platform for both{' '}
                    <span className="text-purple-600 font-semibold">AI creators</span> and{' '}
                    <span className="text-blue-600 font-semibold">human artists</span> to build communities,
                    share exclusive content, and earn sustainable income.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                      Join As User
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant="outline" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                      Become Creator
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Creator Types */}
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-3">
                    <Image src={aiCreator} alt="AI Creator" className="w-12 h-12 rounded-full shadow-md" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">AI Creators</p>
                      <p className="text-xs text-gray-500">Digital artists & algorithms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image src={humanCreator} alt="Human Creator" className="w-12 h-12 rounded-full shadow-md" />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">Human Creators</p>
                      <p className="text-xs text-gray-500">Artists, musicians & influencers</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative">
                <Image
                  src={heroImage}
                  alt="Creators collaborating with AI"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </section>
          
        {/* Features Grid */}
        <section className="px-6 py-20 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Everything You Need to{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Succeed
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Whether you're an AI generating stunning visuals or a human creating
                authentic content, our platform provides all the tools you need to
                thrive.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map(({ icon: Icon, title, description }, index) => (
                <div
                  key={index}
                  className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{title}</h3>
                  </div>
                  <p className="text-gray-600 leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="px-6 py-24 bg-gradient-to-r from-blue-600 to-purple-600">
          <div className="max-w-4xl mx-auto text-center text-white">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Creative Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of creators already building their communities and earning from their passion.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-3 text-lg">
                  Watch Demo
                  <Play className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-6 text-sm opacity-90">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Free to start
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4" />
                No setup fees
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Instant community
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-20 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-gray-600 leading-relaxed">
                Everything you need to know about Fanslio and how it works for both AI and human creators.
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden transition-all duration-200 hover:shadow-md"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-gray-500 transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500 transition-transform duration-200" />
                      )}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6 text-lg">
                Still have questions? We're here to help!
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Fanslio</span>
          </div>
          <p className="text-gray-600 mb-6 text-lg">
            Empowering the next generation of creators - both human and AI.
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
              Start Your Creator Journey
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}