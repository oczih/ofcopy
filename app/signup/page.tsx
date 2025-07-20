"use client";
import { useState } from "react";
import { Crown } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast';

function Modal({ open, onClose, title, children }: { open: boolean, onClose: () => void, title: string, children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-lg relative animate-scale-in">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-pink-400"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-2xl font-bold text-white mb-4 text-center">{title}</h2>
        <div className="text-gray-300 text-sm max-h-[60vh] overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}

export default function SignupPage() {
  const [showTerms, setShowTerms] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);

  const handleOAuthSignIn = async (provider: string) => {
    try {
      await signIn(provider, { callbackUrl: '/discover' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Error signing in with ${provider}: ${message}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden flex items-center justify-center">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-30 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-3xl animate-pulse delay-500"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-yellow-500/15 rounded-full blur-3xl animate-pulse delay-1500"></div>
      </div>
      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        <h1 className="text-4xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Sign Up for CreatorHub</h1>
        <p className="text-lg text-gray-300 mb-8 max-w-md text-center">
          Create your free account to become a fan and unlock exclusive content from your favorite creators.
        </p>
        <div className="bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-8 w-full max-w-md flex flex-col items-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Crown className="w-6 h-6 text-purple-500" />
            <span className="text-xl font-bold text-white">Welcome to CreatorHub</span>
          </div>
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => handleOAuthSignIn('google')}
              className="btn btn-outline text-white border-white hover:bg-sky-500/50 flex items-center gap-2 w-full justify-center py-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Sign up with Google
            </button>
            <button
              onClick={() => handleOAuthSignIn('twitter')}
              className="btn btn-outline text-white border-white hover:bg-sky-500/50 flex items-center gap-2 w-full justify-center py-2 rounded-lg transition"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              Sign up with Twitter
            </button>
          </div>
          <div className="text-center text-sm text-gray-400 mt-6">
            By continuing, you agree to our
            <button
              type="button"
              className="underline text-pink-400 hover:text-pink-300 mx-1"
              onClick={() => setShowTerms(true)}
            >
              Terms of Service
            </button>
            and
            <button
              type="button"
              className="underline text-pink-400 hover:text-pink-300 mx-1"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </button>
          </div>
        </div>
      </div>
      <Modal open={showTerms} onClose={() => setShowTerms(false)} title="Terms of Service">
        <div className="space-y-4 text-left">
          <div>
            <span className="block font-bold text-lg mb-1">Effective Date:</span>
            <span className="text-gray-400">[Insert Date]</span>
          </div>
          <p>
            Welcome to CreatorHub, operated by <span className="font-semibold">[Your Legal Entity Name]</span>, a company incorporated in Finland ("we," "us," or "our"). These Terms of Service govern your use of our platform and services. By accessing or using CreatorHub, you agree to these terms.
          </p>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">1. Eligibility</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>You must be at least 18 years old to access and use CreatorHub.</li>
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
              <li>CreatorHub allows the upload of user-generated and AI-generated content, including adult content.</li>
              <li>Content must comply with Finnish law and any applicable international laws.</li>
              <li>Prohibited content includes illegal material, child exploitation, hate speech, or any content violating intellectual property rights.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">4. AI-Generated Content Disclaimer</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Some influencers and content on CreatorHub are AI-generated and represent fictional personas. These personas are not real individuals.</li>
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
              <li>CreatorHub is provided "as is." We do not guarantee uninterrupted service.</li>
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
      </Modal>
      <Modal open={showPrivacy} onClose={() => setShowPrivacy(false)} title="Privacy Policy">
        <div className="space-y-4 text-left">
          <div>
            <span className="block font-bold text-lg mb-1">Effective Date:</span>
            <span className="text-gray-400">[Insert Date]</span>
          </div>
          <p>
            This Privacy Policy explains how CreatorHub collects, uses, and protects your personal data in compliance with the EU General Data Protection Regulation (GDPR).
          </p>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">1. Information We Collect</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li><span className="font-semibold">Account Data:</span> Name, email address, payment details.</li>
              <li><span className="font-semibold">Usage Data:</span> IP address, device info, browser type.</li>
              <li><span className="font-semibold">Content Data:</span> Files you upload.</li>
              <li><span className="font-semibold">Payment Data:</span> Processed securely by Stripe.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">2. How We Use Your Information</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>To provide and maintain the platform.</li>
              <li>For user authentication and account security.</li>
              <li>For payment processing via Stripe.</li>
              <li>To improve our services.</li>
              <li>To comply with legal obligations.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">3. Cookies and Tracking</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We use cookies for session management, analytics, and improving user experience.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">4. Data Sharing</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>With Stripe for payment processing.</li>
              <li>With AWS for data storage (S3 buckets).</li>
              <li>With analytics providers.</li>
              <li>We do not sell personal data.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">5. Data Retention</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We retain data as long as necessary to provide services, comply with legal obligations, and resolve disputes.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">6. Your Rights</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Under GDPR, you have the right to:</li>
              <ul className="list-disc list-inside ml-8 text-gray-300">
                <li>Access your data.</li>
                <li>Request correction or deletion.</li>
                <li>Object to processing.</li>
                <li>Request data portability.</li>
              </ul>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">7. International Data Transfers</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>Data may be transferred outside the EU but will be protected under appropriate safeguards.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">8. Security</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>We implement industry-standard security measures to protect your data.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-bold text-pink-400 mb-1">9. Contact</h3>
            <ul className="list-disc list-inside ml-4 text-gray-300">
              <li>For privacy concerns or data requests, contact: <span className="underline">[insert contact email]</span></li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
} 