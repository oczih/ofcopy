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
import FeaturesSection from "@/components/FeaturesSection";

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
    description: "Share videos, images, audio with your audience."
  },
  {
    icon: Bot,
    title: "AI Creator Tools",
    description: "Advanced analytics, content optimization, and automated audience engagement for AI creators."
  },
  {
    icon: Heart,
    title: "Fan Engagement",
    description: "Direct messaging, polls, and exclusive events to build deeper connections."
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
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white">
      {/* Product Hunt Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm font-medium">
          <span>🎉 Now featured on Product Hunt!</span>
          <Button 
            
            size="sm" 
            className="border-white/30 bg-white/20 hover:bg-white/30 transition duration-100 text-white text-xs px-3 py-1 transition-colors cursor-pointer"
            onClick={() => window.open('https://producthunt.com', '_blank')}
          >
            View on PH <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Header */}
      <header className="px-6 py-6 bg-white backdrop-blur border-b border-white/10">

        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#12251a]">Fanslio</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-[#12251a] hover:text-pink-400 hover:bg-white/10 cursor-pointer">

                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer">
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 bg-white to-purple-950">

          <div className="max-w-7xl mx-auto pb-100">
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
                      <div className="font-semibold text-orange-700">Featured on Product Hunt!</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    <span className="ml-1 font-medium">4.9/5 from our creators</span>
                  </div>
                </div>

                <div>
                <h1 className="text-5xl md:text-6xl font-bold leading-tight mb-6 text-[#12251a]">

                    Platform where All Creators{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Earn More
                    </span>{' '}
                    & Get Paid Fast
                  </h1>

                  <p className="text-xl text-[#12251a] max-w-xl mb-8 leading-relaxed">

                    The ultimate platform for both{' '}
                    <span className="text-purple-600 font-semibold">AI creators</span> and{' '}
                    <span className="text-blue-600 font-semibold">human artists</span> to build communities,
                    share exclusive content, and earn sustainable income.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/signup">
                    <Button size="lg" variant={"outline"} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                      Join As User
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button size="lg" variant={"outline"} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg">
                      Become Creator
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                </div>

                {/* Creator Types */}

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
        <FeaturesSection features={features}/>

        {/* CTA Section */}
        <section className="px-6 py-24 bg-white">
          <div className="max-w-4xl mx-auto text-center text-[#12251a]">
            <h2 className="text-4xl md:text-5xl font-bold text-[#12251a] mb-6">
              Ready to Transform Your Creative Journey?
            </h2>
            <p className="text-xl mb-8 opacity-90 leading-relaxed">
              Join thousands of creators already building their communities and earning from their passion.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold cursor-pointer">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
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
        <section className="px-6 pt-30 pb-100 bg-[#151515]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-white leading-relaxed">
                Everything you need to know about Fanslio and how it works for both AI and human creators.
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div 
                  key={index}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-md rounded-xl transition-all duration-200 text-white"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between transition-colors duration-200 cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                    <div className="flex-shrink-0">
                      {openFaq === index ? (
                        <ChevronUp className="w-5 h-5 text-white transition-transform duration-200" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-white transition-transform duration-200" />
                      )}
                    </div>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-5 text-white  leading-relaxed pt-4">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-white mb-6 text-lg">
                Still have questions? We're here to help!
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg cursor-pointer">
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 bg-white border-t border-white/10 text-white">
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