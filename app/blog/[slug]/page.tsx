

import { notFound } from "next/navigation";



interface Article {
  title: string;
  emoji: string;
  author: string;
  date: string;
  content: string;
}

const articles: Record<string, Article> = {
  "from-social-media-to-fanvue-proven-conversion-formula": {
    title: "From Social Media to Fanvue: Proven Conversion Formula",
    emoji: "📈",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      Moving your followers from platforms like Instagram or TikTok
      to a subscription platform can feel tricky.
      
      ✅ **Step 1:** Create content that teases exclusivity.  
      ✅ **Step 2:** Offer a clear value proposition—behind-the-scenes,
      early access, or premium interactions.  
      ✅ **Step 3:** Use strong call-to-actions in your bio and stories
      directing fans to your signup page.

      Consistency is key. Nurture trust with your audience,
      and conversion rates will follow.
    `,
  },
  "ai-content-guidelines": {
    title: "AI Content Guidelines",
    emoji: "🤖",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      Artificial intelligence opens incredible possibilities for creators,
      but responsible use matters.

      • Always disclose AI-generated content when appropriate.  
      • Keep human oversight—edit and fact-check outputs.  
      • Use AI to enhance creativity, not replace your voice.

      Fans connect to authenticity. Let AI empower, not impersonate.
    `,
  },
  "monetization-strategies": {
    title: "Monetization Strategies",
    emoji: "💰",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      Earning a steady income as a creator requires multiple revenue streams.

      1️⃣ **Subscriptions:** Offer premium memberships for loyal fans.  
      2️⃣ **Pay-per-view:** Charge for one-off content drops.  
      3️⃣ **Brand Partnerships:** Collaborate with sponsors aligned
      with your niche.

      Diversify early so that one platform change doesn’t break your business.
    `,
  },
  "content-strategy-guide": {
    title: "Content Strategy Guide",
    emoji: "🎯",
    author: "Fanslio Team",
    date: "September 29, 2025",
    content: `
      A strong strategy keeps your audience engaged and growing.

      • Map out a weekly schedule with a mix of free and premium posts.  
      • Create recurring formats (Q&A, behind-the-scenes, tutorials)
      to build habits.  
      • Track analytics and adjust based on what resonates.

      Consistency + feedback loops = sustainable growth.
    `,
  },
};

export default async function ArticlePage(context: unknown) {
  const { params } = context as { params: { slug: string } };
  const article = articles[params.slug];

  if (!article) return notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16 prose prose-lg">
      <div className="text-6xl mb-4">{article.emoji}</div>
      <h1 className="text-4xl font-bold mb-2">{article.title}</h1>
      <p className="text-gray-500 text-sm mb-8">
        By {article.author} • {article.date}
      </p>
      {article.content.split("\n").map((para, i) =>
        para.trim() ? <p key={i}>{para}</p> : <br key={i} />
      )}
    </main>
  );
}