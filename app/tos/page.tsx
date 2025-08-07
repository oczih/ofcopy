"use client";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
export default function TermsOfServicePage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center px-4 py-12 relative">
      <button
        onClick={() => router.push("/")}
        className="absolute top-8 left-8 flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-full shadow-lg hover:from-pink-600 hover:to-purple-700 transition-all duration-300 hover:scale-105 z-20"
      >
        <ArrowLeft className="w-5 h-5" />
        Back
      </button>
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-2xl text-white mt-16 sm:mt-0">
        <h1 className="text-3xl font-extrabold mb-6 text-pink-400 text-center">Terms of Service</h1>
        <div className="space-y-4 text-left">
          <div>
            <span className="block font-bold text-lg mb-1">Effective Date:</span>
            <span className="text-gray-400">[Insert Date]</span>
          </div>
          <p>
            Welcome to Fanslio, operated by <span className="font-semibold">[Your Legal Entity Name]</span>, a company incorporated in Finland (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;). These Terms of Service govern your use of our platform and services. By accessing or using Fanslio, you agree to these terms.
          </p>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">1. Eligibility</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>You must be at least 18 years old to access and use Fanslio.</li>
              <li>By registering, you confirm that you meet this age requirement.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">2. User Accounts</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
              <li>All information provided during registration must be accurate.</li>
              <li>You must not share your account with others.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">3. Content Guidelines</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Fanslio allows the upload of user-generated and AI-generated content, including adult content.</li>
              <li>Content must comply with Finnish law and any applicable international laws.</li>
              <li>Prohibited content includes illegal material, child exploitation, hate speech, or any content violating intellectual property rights.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">4. AI-Generated Content Disclaimer</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Some influencers and content on Fanslio are AI-generated and represent fictional personas. These personas are not real individuals.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">5. Payments and Fees</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Stripe processes all payments securely.</li>
              <li>We may deduct platform fees from earnings as described in our fee policy.</li>
              <li>Refunds are handled on a case-by-case basis.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">6. Intellectual Property</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Users retain ownership of their uploaded content.</li>
              <li>By uploading, you grant us a worldwide, royalty-free license to host, display, and distribute your content on our platform.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">7. Termination</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We reserve the right to suspend or terminate accounts for violations of these terms or illegal activities.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">8. Disclaimers and Liability</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Fanslio is provided &quot;as is.&quot; We do not guarantee uninterrupted service.</li>
              <li>We are not liable for content uploaded by users.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">9. Governing Law</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>These terms are governed by the laws of Finland. Any disputes will be resolved in Finnish courts.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">10. Contact</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>For questions about these Terms of Service, contact us at: <span className="underline">[insert contact email]</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
