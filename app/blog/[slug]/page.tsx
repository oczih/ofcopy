'use client'

import { notFound } from "next/navigation";
import { Share2, Facebook, Copy, ArrowRight } from "lucide-react";
import { useState, use, useEffect } from "react";

interface Article {
  title: string;
  emoji: string;
  author: string;
  date: string;
  content: string;
}

const articles: Record<string, Article> = {
  "lowest-creator-fees-comparison": {
    title: "Lowest Creator Fees: Platform Comparison 2025",
    emoji: "💎",
    author: "Fanslio Team",
    date: "September 30, 2025",
    content: `
      When it comes to monetizing your content, platform fees can make or break your earnings. Let's break down the real numbers.

      <h2>Fanslio leads the industry with just 10% fees</h2>

      The lowest rate among major creator platforms. Here's how we compare:

      • <strong>Fanslio: 10%</strong> — Keep 90% of what you earn
      • OnlyFans: 20% platform fee
      • Patreon: 5-12% + payment processing fees (effective rate: 15-18%)
      • Fanvue: 15-20% depending on tier
      • Most other platforms: 15-25%

      <h2>Why this matters:</h2>

      On a $5,000 monthly income, Fanslio creators keep $4,500 vs. $4,000 on OnlyFans. That's an extra $6,000 per year going directly into your pocket.

      <h2>No hidden fees.</h2>

      Unlike some platforms that add payment processing on top of platform fees, Fanslio's 10% is transparent and all-inclusive. What you see is what you pay.

      <h2>Built for creators who are serious about their income.</h2>

      We believe creators deserve to keep more of what they earn. That's why we've optimized our operations to offer the fairest pricing in the industry while maintaining premium features, excellent support, and fast payouts.

      <h2>The bottom line:</h2>

      Every percentage point matters when you're building a sustainable creator business. With Fanslio's industry-leading 10% fee structure, you're positioned to maximize your earnings from day one.

      Ready to keep more of what you earn? Join thousands of creators who've already made the switch to Fanslio.
    `,
  },
  "from-social-media-to-fanvue-proven-conversion-formula": {
    title: "From Social Media to Subscription Platforms: Proven Conversion Formula",
    emoji: "📈",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      Moving your followers from platforms like Instagram or TikTok to a subscription platform can feel tricky, but with the right strategy, you can achieve conversion rates of 2-5% or higher.

      <h2>Step 1: Create content that teases exclusivity</h2>

      Your free content should hint at the premium value waiting behind the subscription wall. Show snippets, behind-the-scenes glimpses, and teasers that make followers curious. Think of your social media as the movie trailer — exciting enough to want more, but leaving them wanting the full experience.

      <h2>Step 2: Offer a clear value proposition</h2>

      Be specific about what subscribers get: behind-the-scenes content, early access to new releases, direct messaging privileges, exclusive tutorials, or premium interactions. Vague promises don't convert — concrete benefits do.

      <h2>Step 3: Use strong call-to-actions everywhere</h2>

      Update your bio with a clear link. Use stories, posts, and videos to direct fans to your signup page. Create urgency with limited-time offers or founding member benefits. Make the path to subscription frictionless.

      <h2>Pro tip for Fanslio creators:</h2>

      With our 10% fee structure, you can afford to offer competitive launch pricing while still earning more than on higher-fee platforms. Use this to your advantage during your initial push.

      <h2>Consistency is key.</h2>

      Nurture trust with your audience through regular engagement, deliver on your promises, and conversion rates will follow. The creators who succeed are those who treat their subscription platform as a premium tier, not a replacement for free content.
    `,
  },
  "ai-content-guidelines": {
    title: "AI Content Guidelines for Creators",
    emoji: "🤖",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      Artificial intelligence opens incredible possibilities for creators, but responsible use matters more than ever in 2025.

      <h2>Transparency is non-negotiable</h2>

      Always disclose AI-generated or AI-enhanced content when appropriate. Your audience values honesty, and platforms (including Fanslio) are implementing clearer guidelines around AI disclosure. Get ahead of the curve by being upfront.

      <h2>Keep human oversight</h2>

      AI should enhance your workflow, not replace your judgment. Always edit and fact-check AI outputs. Your unique voice and perspective are what fans pay for — AI is a tool to amplify that, not replace it.

      <h2>Use AI to enhance creativity, not replace your voice</h2>

      Perfect use cases include: drafting scripts, brainstorming content ideas, editing and proofreading, generating variations of captions, creating content calendars, and handling repetitive tasks. Poor use cases: fully automated content creation, impersonating others, or generating content without your creative input.

      <h2>Quality over quantity</h2>

      The temptation to use AI to flood your feed with content is real, but fans connect to authenticity and quality. One thoughtful, original post beats ten AI-generated generic ones.

      <h2>Fanslio's position:</h2>

      We support creators using AI as a creative tool while maintaining authenticity. As long as your content provides genuine value and you're transparent about your process, we're here to help you succeed.

      Fans connect to authenticity. Let AI empower, not impersonate.
    `,
  },
  "monetization-strategies": {
    title: "Multi-Stream Monetization Strategies for 2025",
    emoji: "💰",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      Earning a steady income as a creator requires multiple revenue streams. The most successful creators diversify their income to create stability and maximize earning potential.

      <h2>1️⃣ Subscriptions: Your foundation</h2>

      Offer tiered memberships for loyal fans. Basic tier for casual supporters, premium tier for super fans. On Fanslio's 10% fee structure, even a modest subscriber base becomes profitable quickly. Aim for 100-500 core subscribers as your stable monthly income base.

      <h2>2️⃣ Pay-per-view content: Premium drops</h2>

      Charge for one-off special content drops — exclusive photoshoots, extended videos, tutorials, or special events. This layer adds 20-40% additional revenue on top of subscriptions for most creators.

      <h2>3️⃣ Tips and custom requests</h2>

      Enable tipping and offer custom content at premium rates. Personal interactions and customized content can command 2-5x your subscription price and deepen fan relationships.

      <h2>4️⃣ Brand partnerships</h2>

      Collaborate with sponsors aligned with your niche. With a solid subscriber base, you become attractive to brands looking for engaged audiences. Negotiate deals that allow you to maintain authenticity.

      <h2>5️⃣ Merchandise and products</h2>

      Your most engaged fans want physical connections to your brand. Digital products, physical merch, courses, or guides can add substantial revenue.

      <h2>The Fanslio advantage:</h2>

      Lower platform fees mean you keep more from each revenue stream. A creator earning $10K/month keeps $9K on Fanslio vs. $8K on 20% fee platforms — that extra $12K yearly compounds when reinvested in content quality.

      Diversify early so that one platform change doesn't break your business. Build multiple income streams, own your audience relationships, and create sustainable creator income.
    `,
  },
  "content-strategy-guide": {
    title: "Content Strategy Guide: Build Engaged Communities",
    emoji: "🎯",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      A strong strategy keeps your audience engaged and growing. Here's how to build a content system that works.

      <h2>Plan your content calendar</h2>

      Map out a weekly schedule with a strategic mix of free and premium posts. A proven ratio: 70% free value content, 30% premium exclusive content. This builds trust while maintaining subscription value.

      <h2>Create recurring formats</h2>

      Build habits with your audience through recurring content: Monday Q&As, Wednesday behind-the-scenes, Friday tutorials, etc. Predictability builds anticipation and keeps subscribers engaged long-term.

      <h2>The content pyramid approach</h2>

      • Base layer: High-volume social media content (daily)
      • Middle layer: Regular subscription platform posts (3-5x/week)
      • Top layer: Premium exclusive content (1-2x/week)

      Each layer supports the one above it. Your social media drives subscriptions, your regular posts maintain engagement, and your premium content justifies the price.

      <h2>Track analytics obsessively</h2>

      Monitor what resonates: engagement rates, subscription conversion, retention metrics, and revenue per subscriber. On Fanslio, use our analytics dashboard to identify your top-performing content types and double down on what works.

      <h2>The feedback loop</h2>

      Survey your subscribers quarterly. Ask what they want more of. Test new formats. Iterate based on data, not assumptions. The creators who grow fastest are those who listen and adapt.

      <h2>Quality benchmarks to maintain</h2>

      • Response time to DMs: Under 24 hours
      • New content frequency: Minimum 3x/week
      • Premium-to-regular content ratio: 1:3
      • Subscriber retention rate: Above 80%

      Consistency + feedback loops = sustainable growth. With Fanslio's low fees, you can reinvest more earnings into content quality, creating a virtuous cycle of improvement and growth.
    `,
  },
};
function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = `https://blog.fanslio.com/blog/${slug}`;
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-3 my-8 py-6 border-y border-gray-200">
      <span className="text-sm font-medium text-gray-600">Share:</span>
      <a
        href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-black text-white cursor-pointer rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium no-underline"
      >
        <Share2 size={16} />
        X (Twitter)
      </a>
      <a
        href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white cursor-pointer rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium no-underline"
      >
        <Facebook size={16} />
        Facebook
      </a>
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 cursor-pointer rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium border border-gray-300"
      >
        <Copy size={16} />
        {copied ? "Copied!" : "Copy Link"}
      </button>
    </div>
  );
}

function NextArticleButtons({ currentSlug }: { currentSlug: string }) {
  const allSlugs = Object.keys(articles);
  const otherSlugs = allSlugs.filter(s => s !== currentSlug);
  
  // Get two random articles
  const shuffled = [...otherSlugs].sort(() => Math.random() - 0.5);
  const randomArticles = shuffled.slice(0, 2).map(slug => ({
    slug,
    ...articles[slug]
  }));

  return (
    <div className="mt-12 pt-8 border-t border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-900">Read Next</h3>
      <div className="grid gap-4 md:grid-cols-2">
        {randomArticles.map((article) => (
          <a
            key={article.slug}
            href={`/blog/${article.slug}`}
            className="block p-5 bg-gradient-to-br from-gray-50 to-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-gray-300 transition-all group no-underline"
          >
            <div className="flex items-start gap-3">
              <span className="text-3xl">{article.emoji}</span>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors mb-1 line-clamp-2">
                  {article.title}
                </h4>
                <p className="text-sm text-gray-500">{article.date}</p>
              </div>
              <ArrowRight className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all flex-shrink-0" size={20} />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const article = articles[slug];
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-lg font-medium text-slate-700">Loading...</span>
        </div>
      </div>
    );
  }

  if (!article) return notFound();

  // Function to parse content into React elements
  const renderContent = (content: string) => {
    const lines = content.split("\n").map(line => line.trim()).filter(Boolean);
    const elements: React.ReactNode[] = [];
    let currentList: React.ReactNode[] = [];
    let isOrdered = false;

    lines.forEach((line, index) => {
      // H2 header
      if (line.startsWith("<h2>") && line.endsWith("</h2>")) {
        if (currentList.length) {
          elements.push(
            isOrdered ? <ol key={`list-${index}`}>{currentList}</ol> : <ul key={`list-${index}`}>{currentList}</ul>
          );
          currentList = [];
        }
        const headerText = line.replace(/<h2>/, "").replace(/<\/h2>/, "");
        elements.push(
          <h2 key={`h2-${index}`} className="text-2xl font-bold mt-8 mb-4 text-gray-900">
            {headerText}
          </h2>
        );
        return;
      }

      // Bullet point
      if (line.startsWith("•")) {
        currentList.push(<li key={`li-${index}`} className="ml-4 mb-1">{line.slice(1).trim()}</li>);
        isOrdered = false;
        return;
      }

      // Numbered step (like 1️⃣)
      if (line.match(/^\d️⃣/)) {
        currentList.push(<li key={`li-${index}`} className="ml-4 mb-1">{line}</li>);
        isOrdered = true;
        return;
      }

      // Plain paragraph
      if (currentList.length) {
        elements.push(
          isOrdered ? <ol key={`list-${index}`}>{currentList}</ol> : <ul key={`list-${index}`}>{currentList}</ul>
        );
        currentList = [];
      }

      elements.push(<p key={`p-${index}`} className="mb-4">{line}</p>);
    });

    // Flush any remaining list
    if (currentList.length) {
      elements.push(
        isOrdered ? <ol key={`list-end`}>{currentList}</ol> : <ul key={`list-end`}>{currentList}</ul>
      );
    }

    return elements;
  };

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <article className="prose prose-lg max-w-none">
        <div className="text-6xl mb-4">{article.emoji}</div>
        <h1 className="text-4xl font-bold mb-2 text-gray-900">{article.title}</h1>
        <p className="text-gray-500 text-sm mb-8">
          By {article.author} • {article.date}
        </p>

        <div className="text-gray-700 leading-relaxed">
          {renderContent(article.content)}
        </div>

        <ShareButtons title={article.title} slug={slug} />
        <NextArticleButtons currentSlug={slug} />
      </article>
    </main>
  );
}
