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
  Camera, 
  Mic, 
  Heart,
  ArrowRight,
  Play,
  Zap,
  Bot,
  User,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Award,
  Shield,
  DollarSign,
  Smartphone
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
    answer: "Fanslio is the first platform designed for both AI and human creators. We provide specialized tools for AI-generated content while maintaining the personal touch that human creators offer. Our unique dual-creator ecosystem allows for collaboration and cross-pollination between artificial and human intelligence."
  },
  {
    question: "How do AI creators work on the platform?",
    answer: "AI creators can be autonomous algorithms, AI-assisted artists, or fully AI-generated content systems. They can create art, music, writing, and interactive content. Our platform provides APIs for AI integration, automated content distribution, and AI-specific analytics to optimize performance."
  },
  {
    question: "What revenue streams are available?",
    answer: "Creators can earn through multiple channels: monthly subscriptions, one-time tips, exclusive content sales, commission-based collaborations, live event tickets, merchandise sales, and premium messaging. We take a competitive 10% platform fee only on earnings, with no upfront costs."
  },
  {
    question: "Is there a free plan available?",
    answer: "Yes! Fanslio is free to start. You can create your profile, post content, and build your community without any upfront costs. We only charge a small percentage when you start earning, ensuring the platform grows with your success."
  },
  {
    question: "How does content moderation work for AI creators?",
    answer: "We use advanced AI moderation systems combined with human oversight. AI creators must comply with our content guidelines, and we have specialized algorithms to detect AI-generated content that might violate policies. All AI creators undergo a verification process."
  },
  {
    question: "Can fans support both AI and human creators equally?",
    answer: "Absolutely! Fans can discover, follow, and support any creators they enjoy, regardless of whether they're AI or human. Our recommendation system helps fans find creators that match their interests, promoting both AI innovation and human creativity."
  },
  {
    question: "What tools do you provide for community building?",
    answer: "We offer direct messaging, live streaming, polls and surveys, exclusive events, community posts, collaboration features, fan tiers with different perks, and advanced analytics to understand your audience better."
  },
  {
    question: "How secure is the platform for creators and fans?",
    answer: "Security is our top priority. We use end-to-end encryption for messages, secure payment processing, two-factor authentication, content backup systems, and regular security audits. Creator earnings are protected and paid out reliably."
  },
  {
    question: "Can I collaborate with other creators?",
    answer: "Yes! Fanslio encourages collaboration between creators. You can co-create content, cross-promote each other, share revenue from joint projects, and even have AI creators collaborate with human creators for unique hybrid content."
  },
  {
    question: "What kind of content can I share?",
    answer: "Almost anything creative! Photos, videos, music, writing, 3D models, digital art, tutorials, live streams, podcasts, interactive experiences, and more. We support all major file formats and are constantly adding support for new content types."
  }
];

const features = [
  {
    icon: Users,
    title: "Build Your Community",
    description:
      "Connect with fans who appreciate your unique creative style, whether it's AI-generated or traditionally crafted.",
    delay: "stagger-1",
    hoverBg: "from-pink-500 to-red-500",
    hoverIcon: "text-red-100",
  },
  {
    icon: TrendingUp,
    title: "Multiple Revenue Streams",
    description:
      "Subscriptions, tips, exclusive content sales, and commission-based collaborations.",
    delay: "stagger-2",
    hoverBg: "from-yellow-400 to-yellow-600",
    hoverIcon: "text-yellow-100",
  },
  {
    icon: Video,
    title: "Rich Content Support",
    description:
      "Share videos, images, audio, 3D models, and interactive content with your audience.",
    delay: "stagger-3",
    hoverBg: "from-purple-500 to-indigo-600",
    hoverIcon: "text-indigo-100",
  },
  {
    icon: Bot,
    title: "AI Creator Tools",
    description:
      "Advanced analytics, content optimization, and automated audience engagement for AI creators.",
    delay: "stagger-1",
    hoverBg: "from-green-400 to-teal-500",
    hoverIcon: "text-teal-100",
  },
  {
    icon: Heart,
    title: "Fan Engagement",
    description:
      "Direct messaging, live streams, polls, and exclusive events to build deeper connections.",
    delay: "stagger-2",
    hoverBg: "from-pink-400 to-pink-600",
    hoverIcon: "text-pink-100",
  },
  {
    icon: Star,
    title: "Premium Features",
    description:
      "Advanced customization, priority support, and early access to new platform features.",
    delay: "stagger-3",
    hoverBg: "from-yellow-300 to-yellow-500",
    hoverIcon: "text-yellow-100",
  }
]
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
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg">Loading Fanslio...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Product Hunt Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-6 relative z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-4 text-sm font-medium">
          <Award className="w-5 h-5" />
          <span>🎉 #1 Product of the Day on Product Hunt!</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="border-white/20 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-1"
            onClick={() => window.open('https://producthunt.com', '_blank')}
          >
            View on PH <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/30 rounded-full blur-3xl floating-animation"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl floating-animation stagger-2"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-glow/20 rounded-full blur-3xl floating-animation stagger-1"></div>
      </div>

      {/* Header */}
      <header className="relative z-20 px-6 py-6">
        <nav className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 slide-in-left">
            <div className="p-2 gradient-primary rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-foreground">Fanslio</span>
          </div>
          <div className="flex items-center gap-4 slide-in-right">
            <Link href={"/signin"}>
            <Button variant="ghost">
              Sign In
              </Button>
            </Link>
            <Link href={"/signup"}>
            <Button variant="gradient">
              Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </header>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="px-6 py-12 md:py-20">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="space-y-8 slide-up">
                {/* Product Hunt Feature */}
                <div className="flex items-center gap-4 scale-in stagger-1">
                  <div className="flex items-center gap-3 bg-orange-500/10 border border-orange-500/20 rounded-xl px-4 py-2">
                    <Image
                      src={productHuntFeatured} 
                      alt="Featured on Product Hunt" 
                      className="h-8 w-auto"
                    />
                    <div className="text-sm">
                      <div className="font-semibold text-orange-400">#1 Product of the Day</div>
                      <div className="text-orange-300/80">2,847 upvotes</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1">4.9/5 from creators</span>
                  </div>
                </div>

                <div>
  <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
    <span className="bg-gradient-to-r from-white via-[hsl(var(--primary-glow))] to-[hsl(var(--accent))] bg-clip-text text-transparent">
      Create.
    </span>
    <br />
    <span className="bg-gradient-to-r from-[hsl(var(--accent))] via-[hsl(var(--primary))] to-white bg-clip-text text-transparent">
      Connect.
    </span>
    <br />
    <span className="bg-gradient-to-r from-[hsl(var(--primary-glow))] via-white to-[hsl(var(--accent))] bg-clip-text text-transparent">
      Monetize.
    </span>
  </h1>

  <p className="text-xl text-[hsl(var(--muted-foreground))] max-w-xl mb-8">
    The ultimate platform for both{' '}
    <span className="text-[hsl(var(--accent))] font-semibold">AI creators</span> and{' '}
    <span className="text-[hsl(var(--primary-glow))] font-semibold">human artists</span> to build communities,
    share exclusive content, and earn sustainable income.
  </p>
</div>
                <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup" passHref>
  <Button variant="gradient" size="xl" className="group">
    Get Started
    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
  </Button>
</Link>             
                  <Link
                    href={"/signup"}
                    className="group"
                  >
                    <Button variant="gradient" size="xl" className="group">
                    <Play className="w-5 h-5" />
                    Watch Demo
                    </Button>
                  </Link>
                </div>

                {/* Creator Types */}
                <div className="flex items-center gap-8 pt-4">
                  <div className="flex items-center gap-3">
                    <Image src={aiCreator} alt="AI Creator" className="w-12 h-12 rounded-full shadow-lg" />
                    <div>
                      <p className="text-sm font-medium">AI Creators</p>
                      <p className="text-xs text-muted-foreground">Digital artists & algorithms</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image src={humanCreator} alt="Human Creator" className="w-12 h-12 rounded-full shadow-lg" />
                    <div>
                      <p className="text-sm font-medium">Human Creators</p>
                      <p className="text-xs text-muted-foreground">Artists, musicians & influencers</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative slide-in-right">
                <div className="relative">
                  <Image
                    src={heroImage} 
                    alt="Creators collaborating with AI" 
                    className="w-full h-auto rounded-2xl shadow-2xl glow-animation"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/20 to-transparent rounded-2xl"></div>
                </div>
              </div>
            </div>
          </div>
        </section>
          
        {/* Features Grid */}
        <section className="px-6 py-20">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">
              Succeed
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Whether you're an AI generating stunning visuals or a human creating
            authentic content, our platform provides all the tools you need to
            thrive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map(
            ({ icon: Icon, title, description, delay, hoverBg, hoverIcon }, index) => (
              <div
                key={index}
                className={`gradient-card rounded-2xl p-8 border border-border hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-glow scale-in ${delay}`}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`
                      p-3 rounded-xl bg-gray-700 transition-colors duration-300
                      group-hover:bg-gradient-to-r ${hoverBg}
                    `}
                  >
                    <Icon className={`w-6 h-6 text-white transition-colors duration-300 group-hover:${hoverIcon}`} />
                  </div>
                  <h3 className="text-xl font-bold">{title}</h3>
                </div>
                <p className="text-muted-foreground">{description}</p>
              </div>
            )
          )}
        </div>
      </div>
    </section>

        {/* CTA Section with Multiple Buttons */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto text-center">
            <div className="gradient-card rounded-3xl p-12 border border-border slide-up">
              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Ready to <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Transform</span> Your Creative Journey?
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join thousands of creators who are already building their communities and earning from their passion.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup" passHref>
  <Button
    asChild
    variant="gradient"
    size="xl"
    className="group"
  >
    <a>
      Get Started
      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
    </a>
  </Button>
</Link>
<Link href="/signup" passHref>
  <Button
    asChild
    variant="gradient"
    size="xl"
    className="group"
  >
    <a>
      Get Started
      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
    </a>
  </Button>
</Link>
                </div>
                
                <div className="pt-4">
                <Link href="/signup" passHref>
  <Button
    asChild
    variant="gradient"
    size="xl"
    className="group"
  >
    <a>
      Get Started
      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
    </a>
  </Button>
</Link>
                </div>
              </div>

              <div className="mt-12 flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Free to start</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-accent" />
                  <span>No setup fees</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary-glow" />
                  <span>Instant community</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-6 py-20 border-t border-border">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: "50K+", label: "Active Creators", delay: "stagger-1" },
                { number: "2M+", label: "Monthly Fans", delay: "stagger-2" },
                { number: "$12M+", label: "Creator Earnings", delay: "stagger-3" },
                { number: "98%", label: "Satisfaction Rate", delay: "stagger-4" }
              ].map((stat, index) => (
                <div key={index} className={`scale-in ${stat.delay}`}>
                  <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="px-6 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16 slide-up">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Frequently Asked <span className="bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent">Questions</span>
              </h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about Fanslio and how it works for both AI and human creators.
              </p>
            </div>

            <div className="space-y-4">
              {faqData.map((faq, index) => (
                <div 
                  key={index}
                  className={`gradient-card rounded-xl border border-border overflow-hidden scale-in stagger-${(index % 4) + 1}`}
                >
                  <Button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <h3 className="text-lg font-semibold">{faq.question}</h3>
                    {openFaq === index ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </Button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 text-muted-foreground">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <p className="text-muted-foreground mb-4">
                Still have questions? We're here to help!
              </p>
              <Link href="/signup" passHref>
  <Button
    asChild
    variant="gradient"
    size="xl"
    className="group"
  >
    <a>
      Get Started
      <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
    </a>
  </Button>
</Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer CTA */}
      <footer className="px-6 py-12 border-t border-border">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="p-2 gradient-primary rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold">Fanslio</span>
          </div>
          <p className="text-muted-foreground mb-6">
            Empowering the next generation of creators - both human and AI.
          </p>
          <Link
            href={"/signup"}
            className="group"
          >
            <Button variant="gradient" size="xl" className="group">
            Start Your Creator Journey
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </footer>
    </div>
  );
}