'use client'

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
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
import { SessionProvider, useSession } from "next-auth/react";
import FeaturesSection from "@/components/FeaturesSection";
import { useRouter } from "next/navigation";

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

// Consistent animation variants
const fadeInUp = {
  hidden: { 
    opacity: 0, 
    y: 30,
    filter: "blur(10px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 1
    }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
};

const scaleIn = {
  hidden: { 
    scale: 0.8, 
    opacity: 0,
    filter: "blur(5px)"
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 120,
      damping: 20
    }
  }
};

export default function LandingPage() {
  return (
    <SessionProvider>
      <Landing />
    </SessionProvider>
  );
}

function Landing() {
  const router = useRouter()
  const {data: session} = useSession();
  const [mounted, setMounted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      router.push("/home");
    }
  }, []);
  useEffect(() => {
    setMounted(true);
  }, []);
  if (session?.user) {
  
  
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
  if (typeof window !== "undefined"){
    router.push("/home")};
 }
  return (
    <motion.div 
      initial={{ filter: "blur(5px)" }}
      animate={{ filter: "blur(0px)" }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-white"
    >
      {/* Product Hunt Banner */}
      <motion.div 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm font-medium">
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          >
            🎉 Now featured on Product Hunt!
          </motion.span>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <Button 
              size="sm" 
              className="border-white/30 bg-white/20 hover:bg-white/30 transition duration-100 text-white text-xs px-3 py-1 transition-colors cursor-pointer hover:scale-105 transform"
              onClick={() => window.open('https://producthunt.com', '_blank')}
            >
              View on PH <ExternalLink className="w-3 h-3 ml-1" />
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Header */}
      <motion.header 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="px-6 py-6 bg-white backdrop-blur border-b border-white/10"
      >
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl transform hover:scale-110 transition-transform duration-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-[#12251a]">Fanslio</span>
          </motion.div>
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-4"
          >
            <Link href="/login">
              <Button variant="ghost" className="text-[#12251a] hover:text-pink-400 hover:bg-white/10 cursor-pointer transition-all duration-200 hover:scale-105">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg">
                Get Started
              </Button>
            </Link>
          </motion.div>
        </nav>
      </motion.header>

      <main>
        {/* Hero Section */}
        <section className="px-6 py-16 md:py-24 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <motion.div 
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
                className="space-y-8"
              >
                {/* Product Hunt Feature */}
                <motion.div variants={fadeInUp} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2 hover:shadow-lg transition-shadow duration-200">
                    <Image
                      src={productHuntFeatured} 
                      alt="Featured on Product Hunt" 
                      className="h-8 w-auto"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-orange-700">Featured on Product Hunt!</div>
                    </div>
                  </div>
                  <motion.div 
                    variants={fadeInUp}
                    className="flex items-center gap-1 text-sm text-gray-600"
                  >
                    {[...Array(5)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ delay: 0.5 + i * 0.1, type: "spring", stiffness: 200 }}
                      >
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </motion.div>
                    ))}
                    <span className="ml-1 font-medium">4.9/5 from our creators</span>
                  </motion.div>
                </motion.div>

                <motion.div variants={fadeInUp}>
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
                </motion.div>

                <motion.div variants={staggerContainer} className="flex flex-col sm:flex-row gap-4">
                  <motion.div variants={scaleIn}>
                    <Link href="/signup">
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg hover:scale-105 hover:shadow-xl transition-all duration-200 group"
                      >
                        Join As User
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </Link>
                  </motion.div>
                  <motion.div variants={scaleIn}>
                    <Link href="/signup">
                      <Button 
                        size="lg" 
                        variant="outline" 
                        className="border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 py-3 text-lg hover:scale-105 hover:shadow-xl transition-all duration-200 group"
                      >
                        Become Creator
                        <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                      </Button>
                    </Link>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div 
                initial={{ scale: 0.8, opacity: 0, rotateY: 20 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 100 }}
                className="relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-3xl transform scale-110"></div>
                <Image
                  src={heroImage}
                  alt="Creators collaborating with AI"
                  className="relative w-full h-auto rounded-2xl shadow-2xl hover:scale-105 transition-transform duration-500"
                />
              </motion.div>
            </div>
          </div>
        </section>
          
        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
        >
          <FeaturesSection features={features}/>
        </motion.div>

        {/* CTA Section */}
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="px-6 py-24 bg-white"
        >
          <div className="max-w-4xl mx-auto text-center text-[#12251a]">
            <motion.h2 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-4xl md:text-5xl font-bold text-[#12251a] mb-6"
            >
              Ready to Transform Your Creative Journey?
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-xl mb-8 opacity-90 leading-relaxed"
            >
              Join thousands of creators already building their communities and earning from their passion.
            </motion.p>

            <motion.div 
              variants={fadeInUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-8"
            >
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Button>
              </Link>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="flex flex-wrap justify-center gap-6 text-sm opacity-90"
            >
              {[
                { icon: Zap, text: "Free to start" },
                { icon: Star, text: "No setup fees" },
                { icon: Users, text: "Instant community" }
              ].map((item, index) => (
                <motion.div key={index} variants={fadeInUp} className="flex items-center gap-2 hover:scale-110 transition-transform duration-200">
                  <item.icon className="w-4 h-4" />
                  {item.text}
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          className="px-6 py-24 bg-[#151515]"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Frequently Asked{' '}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Questions
                </span>
              </motion.h2>
              <motion.p variants={fadeInUp} className="text-xl text-white leading-relaxed">
                Everything you need to know about Fanslio and how it works for both AI and human creators.
              </motion.p>
            </motion.div>

            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="space-y-4"
            >
              {faqData.map((faq, index) => (
                <motion.div 
                  key={index}
                  variants={fadeInUp}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 backdrop-blur-md rounded-xl transition-all duration-200 text-white hover:shadow-2xl hover:scale-[1.02]"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between transition-colors duration-200 cursor-pointer"
                  >
                    <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                    <motion.div 
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex-shrink-0"
                    >
                      <ChevronDown className="w-5 h-5 text-white" />
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
                    <div className="px-6 pb-5 text-white leading-relaxed">
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
              className="text-center mt-12"
            >
              <p className="text-white mb-6 text-lg">
                Still have questions? We're here to help!
              </p>
              <Link href="/signup">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg cursor-pointer hover:scale-105 hover:shadow-xl transition-all duration-200 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
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
        className="px-6 py-12 bg-white border-t border-white/10"
      >
        <div className="max-w-7xl mx-auto text-center">
          <motion.div 
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
            className="flex items-center justify-center gap-3 mb-4"
          >
            <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:scale-110 transition-transform duration-200">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">Fanslio</span>
          </motion.div>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-gray-600 mb-6 text-lg"
          >
            Empowering the next generation of creators - both human and AI.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <Link href="/signup">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg hover:scale-105 hover:shadow-xl transition-all duration-200 group"
              >
                Start Your Creator Journey
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </motion.footer>
    </motion.div>
  );
}