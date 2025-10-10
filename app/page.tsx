/* eslint-disable @next/next/no-img-element */
'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion, Variants } from "framer-motion";
import { 
  TrendingUp, 
  Users, 
  Star, 
  Video, 
  Heart,
  ArrowRight,
  Zap,
  Bot,
  ChevronDown,
  ExternalLink,
  Sparkles,
  DollarSign,
} from "lucide-react";
import Link from "next/link";
import heroImage from "@/assets/hero-image.jpg";
import productHuntFeatured from "@/assets/product-hunt-featured.png";
import { SessionProvider, useSession} from "next-auth/react";
import FeaturesSection from "@/components/FeaturesSection";
import { faqData } from "./data/faqData";
import { useRouter } from "next/navigation";


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
    description: "Advanced analytics, content optimization, and automated audience engagement for creators."
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

const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    },
  },
} as const satisfies Variants;


const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { 
    scale: 0.95, 
    opacity: 0,
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }
} as const satisfies Variants;

export default function LandingPage() {
  return (
    <SessionProvider>
      <Landing />
    </SessionProvider>
  );
}

function Landing() {
  const { data: session } = useSession();
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const router = useRouter()
  
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (session) {
      router.push("/home");
    }
  }, [session, router]);
  
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700">Loading Fanslio...</span>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      {/* Floating background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Product Hunt Banner */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-gradient-to-r from-orange-500 via-orange-600 to-red-500 text-white py-2.5 px-6 overflow-hidden"
      >
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAgTSAwIDIwIEwgNDAgMjAgTSAyMCAwIEwgMjAgNDAgTSAwIDMwIEwgNDAgMzAgTSAzMCAwIEwgMzAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm font-medium relative z-10">
          <Sparkles className="w-4 h-4" />
          <span>Featured on Product Hunt – Join the creator revolution!</span>
          <Button 
            size="sm" 
            className="bg-white/20 hover:bg-white/30 border border-white/30 transition-all text-white text-xs px-3 py-1 h-7"
            onClick={() => window.open('https://producthunt.com', '_blank')}
          >
            Check it out <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </motion.div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="sticky top-0 z-50 px-6 py-4 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-2.5"
          >
            <img
              src="/fanslioIconSVG.svg"
              alt="Fanslio Icon"
              className="w-9 h-9"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">Fanslio</span>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <Link href="/login">
              <Button variant="ghost" className="text-gray-700 hover:text-gray-900 hover:bg-gray-100">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gray-900 hover:bg-gray-800 text-white shadow-sm">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </nav>
      </motion.header>

      <main className="relative">
        {/* Hero Section */}
        <section className="px-6 pt-12 pb-24 md:pt-20 md:pb-32 relative overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8 relative z-10"
              >
                {/* Social Proof Badge */}
                <motion.div variants={fadeInUp} className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-full px-5 py-2.5 shadow-sm">
                  <Image
                    src={productHuntFeatured} 
                    alt="Featured on Product Hunt" 
                    className="h-6 w-auto"
                  />
                  <div className="flex items-center gap-2 text-sm text-orange-900">
                    <span className="font-semibold">Featured</span>
                    <span className="text-orange-600">•</span>
                    <div className="flex items-center gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                      ))}
                    </div>
                    <span>4.9/5</span>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp} className="space-y-6">
                  <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] text-gray-900">
                    Your content.
                    <br />
                    <span className="relative inline-block">
                      <span className="relative z-10">Your income.</span>
                      <span className="absolute bottom-2 left-0 w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 -rotate-1"></span>
                    </span>
                    <br />
                    <span className="text-gray-500">Your way.</span>
                  </h1>
                  <p className="text-xl text-gray-600 max-w-xl leading-relaxed">
                    Stop fighting algorithms. Build real connections with fans who actually want to support your work. No middlemen, no BS.
                  </p>
                </motion.div>

                <motion.div variants={staggerContainer} className="flex flex-col sm:flex-row gap-4 pt-4">
                  <motion.div variants={scaleIn}>
                    <Link href="/signup">
                      <Button 
                        size="lg" 
                        className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-6 text-lg font-medium shadow-lg hover:shadow-xl transition-all group"
                      >
                        Start earning today
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div variants={scaleIn}>
                    <Link href="/signup">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-6 text-lg font-medium group"
                      >
                        Explore as a fan
                        <Heart className="w-5 h-5 ml-2 text-red-500 group-hover:scale-110 transition-transform" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>

                {/* Quick Stats */}
                <motion.div 
                  variants={fadeInUp}
                  className="flex items-center gap-8 pt-8 border-t border-gray-200"
                >
                  <div>
                    <div className="text-3xl font-bold text-gray-900">Free</div>
                    <div className="text-sm text-gray-600">to start</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">90%</div>
                    <div className="text-sm text-gray-600">you keep</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold text-gray-900">24h</div>
                    <div className="text-sm text-gray-600">payouts</div>
                  </div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 rounded-3xl blur-2xl opacity-50"></div>
                <Image
                  src={heroImage}
                  alt="Creators collaborating"
                  className="relative w-full h-auto rounded-2xl shadow-2xl ring-1 ring-gray-200"
                />
                
                {/* Floating cards */}
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.8, duration: 0.6 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">+$2,847</div>
                      <div className="text-xs text-gray-600">This week</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 0.6 }}
                  className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 border border-gray-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">1,234</div>
                      <div className="text-xs text-gray-600">New fans</div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
          
        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
        >
          <FeaturesSection features={features}/>
        </motion.div>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="px-6 py-24 md:py-32 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMTAgNjAgTSAwIDEwIEwgNjAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <motion.div
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                Ready to own your creative future?
              </h2>
              <p className="text-xl text-gray-300 mb-12 leading-relaxed max-w-2xl mx-auto">
                Thousands of creators are already earning more and building stronger communities. What are you waiting for?
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link href="/signup">
                  <Button 
                    size="lg" 
                    className="bg-white text-gray-900 hover:bg-gray-100 px-8 py-6 text-lg font-medium shadow-xl group"
                  >
                    Get started free
                    <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              <div className="flex flex-wrap justify-center gap-8 text-gray-400">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-400" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span>Cancel anytime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-yellow-400" />
                  <span>Join 10k+ creators</span>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="px-6 py-24 md:py-32 bg-gray-50"
        >
          <div className="max-w-3xl mx-auto">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
                Questions? We&apos;ve got answers.
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-gray-600">
                Everything you need to know about how Fanslio works.
              </motion.p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-3"
            >
              {faqData.map((faq, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    <motion.div 
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    </motion.div>
                  </button>
                  <motion.div 
                    initial={false}
                    animate={{ 
                      height: openFaq === index ? "auto" : 0,
                      opacity: openFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-5 text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
                      {faq.answer}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center mt-12 p-8 bg-white rounded-2xl shadow-sm border border-gray-200"
            >
              <p className="text-gray-900 mb-4 text-lg font-medium">
                Still have questions?
              </p>
              <p className="text-gray-600 mb-6">
                Our support team is here to help you get started.
              </p>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>
      </main>

      {/* Footer */}
      <motion.footer 
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="px-6 py-16 bg-white border-t border-gray-200"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <img
                  src="/fanslioIconSVG.svg"
                  alt="Fanslio Icon"
                  className="w-9 h-9"
                />
                <span className="text-2xl font-bold text-gray-900">Fanslio</span>
              </div>
              <p className="text-gray-600 mb-6 max-w-md">
                The creator platform that actually puts creators first. Build your community, share your work, earn your worth.
              </p>
              <Link href="/signup">
                <Button 
                  className="bg-gray-900 hover:bg-gray-800 text-white group"
                >
                  Start creating
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Legal</h4>
              <div className="space-y-2.5 text-sm">
                <Link href="/tos" className="block text-gray-600 hover:text-gray-900 transition">Terms of Service</Link>
                <Link href="/privacy" className="block text-gray-600 hover:text-gray-900 transition">Privacy Policy</Link>
                <Link href="/dmca" className="block text-gray-600 hover:text-gray-900 transition">DMCA Policy</Link>
                <Link href="/cookiepolicy" className="block text-gray-600 hover:text-gray-900 transition">Cookie Policy</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Policies</h4>
              <div className="space-y-2.5 text-sm">
                <Link href="/child-protection" className="block text-gray-600 hover:text-gray-900 transition">Child Protection</Link>
                <Link href="/anti-slavery" className="block text-gray-600 hover:text-gray-900 transition">Anti-Slavery</Link>
                <Link href="/guidelines" className="block text-gray-600 hover:text-gray-900 transition">Community Guidelines</Link>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-600">
              <div>
                <p>© 2024 Fanslio. Made with ❤️ for creators.</p>
                <p className="mt-1">Monara Club 3497877-9 • Miestentie 2 B 51, 02150 Espoo</p>
              </div>
              <div>
                <a href="mailto:support@fanslio.com" className="hover:text-gray-900 transition">
                  support@fanslio.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </motion.footer>

      <style jsx global>{`
        @keyframes blob {
          0% {
            transform: translate(0px, 0px) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          100% {
            transform: translate(0px, 0px) scale(1);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
}