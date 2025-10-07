"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { signIn } from "next-auth/react";
import { toast } from 'react-hot-toast';
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
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
          ✕
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
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  
  // Fun username generator
  function generateUsername() {
    const adjectives = [
      'starry', 'brave', 'lucky', 'fuzzy', 'cosmic', 'silly', 'swift', 'sunny', 'fancy', 'mighty',
      'frosty', 'jazzy', 'witty', 'zesty', 'breezy', 'quirky', 'snazzy', 'peachy', 'spicy', 'dreamy'
    ];
    const animals = [
      'lion', 'otter', 'panda', 'fox', 'tiger', 'koala', 'eagle', 'wolf', 'bunny', 'owl',
      'dolphin', 'bear', 'cat', 'dog', 'falcon', 'shark', 'whale', 'moose', 'lynx', 'gecko'
    ];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const animal = animals[Math.floor(Math.random() * animals.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}${animal}${num}`;
  }

  // Auto-generate username when email is filled and username is empty
  function handleEmailChange(value: string) {
    setFormData(prev => {
      let newUsername = prev.username;
      if (!prev.username) {
        newUsername = generateUsername();
      }
      return { ...prev, email: value, username: newUsername };
    });
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: '' }));
    }
  }

  // Generate a username on mount if empty
  useEffect(() => {
    setFormData(prev => {
      if (!prev.username) {
        return { ...prev, username: generateUsername() };
      }
      return prev;
    });
  }, []);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      await signIn(provider, { callbackUrl: '/discover' });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Error signing in with ${provider}: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.username) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      newErrors.username = 'Username can only contain letters, numbers, and underscores';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
  
    if (!validateForm()) return;
    setIsLoading(true);
  
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.username
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
  
      // Automatically log in the user
      const loginResult = await signIn('credentials', {
        redirect: false,  // important
        email: formData.email,
        password: formData.password,
      });
  
      if (loginResult?.error) {
        toast.error(`Login failed: ${loginResult.error}`);
      } else {
        toast.success('Registration successful!');
        router.push('/home');
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Registration failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#13072c] ">
      <h1 className="text-3xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Fanslio</h1>
       <h1 className="text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Sign Up</h1>
       <div className="w-[90%] sm:w-[80%] md:w-full max-w-md bg-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center">
       
        <p className="text-sm text-white font-bold mb-6 text-center">
          Create your free account to become a fan and unlock exclusive content from your favorite creators.
        </p>
            <div className="flex flex-col gap-3 w-full">
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={isLoading}
                className="
                flex items-center gap-2 w-full justify-center py-2 
                rounded-full bg-white/10 text-white 
                bg-brightness-75 hover:brightness-100 
                hover:drop-shadow-xl hover:outline-white hover:outline 
                transition-all duration-500 
                disabled:opacity-50 cursor-pointer
              "
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {isLoading ? 'Signing up...' : 'Sign up with Google'}
              </button>
              <button
                onClick={() => handleOAuthSignIn('twitter')}
                disabled={isLoading}
                className="
                flex items-center gap-2 w-full justify-center py-2 
                rounded-full bg-white/10 text-white 
                bg-brightness-75 hover:brightness-100 
                hover:drop-shadow-xl hover:outline-white hover:outline 
                transition-all duration-500 
                disabled:opacity-50 cursor-pointer
              "
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                {isLoading ? 'Signing up...' : 'Sign up with Twitter'}
              </button>
            </div>
            <div className="flex items-center my-8 w-full">
            <Separator className="flex-1 h-px bg-white/10" />
            <span className="mx-4 bg-white/10 px-3 text-white/30 text-xs font-semibold tracking-widest rounded-full shadow-sm">OR</span>
            <Separator className="flex-1 h-px bg-white/10" />
          </div>
          <form onSubmit={handleEmailSignup} className="flex flex-col space-y-5 w-full max-w-sm mx-auto px-4 sm:px-0">
  {/* Email Field */}
  <div className="w-full">
    <input
      type="email"
      placeholder="Email Address"
      value={formData.email}
      onChange={(e) => handleEmailChange(e.target.value)}
      className={`w-full pl-4 pr-4 py-3 sm:py-3.5 bg-white/10 rounded-xl text-base shadow-sm text-white 
      placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200
      ${errors.email ? 'border border-red-500 focus:ring-red-500' : 'border border-transparent focus:ring-purple-400'}`}
    />
    {errors.email && (
      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {errors.email}
      </p>
    )}
  </div>

  {/* Password Field */}
  <div className="w-full relative">
    <input
      type={showPassword ? "text" : "password"}
      placeholder="Password"
      value={formData.password}
      onChange={(e) => handleInputChange('password', e.target.value)}
      className={`w-full pl-4 pr-12 py-3 sm:py-3.5 bg-white/10 rounded-xl text-base shadow-sm text-white 
      placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200
      ${errors.password ? 'border border-red-500 focus:ring-red-500' : 'border border-transparent focus:ring-purple-400'}`}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-gray-400 hover:text-purple-400 transition-colors touch-manipulation"
    >
      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
    </button>
    {errors.password && (
      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {errors.password}
      </p>
    )}
  </div>

  {/* Confirm Password Field */}
  <div className="w-full">
    <input
      type="password"
      placeholder="Confirm Password"
      value={formData.confirmPassword}
      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
      className={`w-full pl-4 pr-4 py-3 sm:py-3.5 bg-white/10 rounded-xl text-base shadow-sm text-white 
      placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200
      ${errors.confirmPassword ? 'border border-red-500 focus:ring-red-500' : 'border border-transparent focus:ring-purple-400'}`}
    />
    {errors.confirmPassword && (
      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
        <AlertCircle className="w-4 h-4 shrink-0" />
        {errors.confirmPassword}
      </p>
    )}
  </div>

  <button
    type="submit"
    disabled={isLoading}
    className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 
    text-white py-3 sm:py-3.5 px-4 rounded-xl font-semibold text-base tracking-wide
    transition-all duration-200 shadow-md active:scale-[0.98] 
    disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {isLoading ? 'Creating Account...' : 'Create Account'}
  </button>
</form>


          <div className="text-center text-sm text-gray-400 mt-6">
            By continuing, you agree to our
            <button
              type="button"
              className="underline cursor-pointer text-pink-400 hover:text-pink-300 mx-1"
              onClick={() => setShowTerms(true)}
            >
              Terms of Service
            </button>
            and
            <button
              type="button"
              className="underline cursor-pointer text-pink-400 hover:text-pink-300 mx-1"
              onClick={() => setShowPrivacy(true)}
            >
              Privacy Policy
            </button>
            , and that you are atleast 18 years old.
          </div>

          <div className="text-center mt-4">
            <p className="text-gray-400 text-sm">
              Already have an account?&nbsp;
              <Link href="/login" className="text-purple-400 hover:text-purple-300 underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      <Modal open={showTerms} onClose={() => setShowTerms(false)} title={"Terms of Service"}>
        <div className="space-y-4 text-left">
          <div>
            <span className="block font-bold text-lg mb-1">Effective Date:</span>
            <span className="text-gray-400">[Insert Date]</span>
          </div>
          <p>
            Welcome to Fanslio, operated by <span className="font-semibold">[Your Legal Entity Name]</span>, a company incorporated in Finland (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). These Terms of Service govern your use of our platform and services. By accessing or using Fanslio, you agree to these terms.
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
              <li>Epoch and Segpay processes all payments securely.</li>
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
      </Modal>
      <Modal open={showPrivacy} onClose={() => setShowPrivacy(false)} title={"Privacy Policy"}>
        <div className="space-y-4 text-left">
          <div>
            <span className="block font-bold text-lg mb-1">Effective Date:</span>
            <span className="text-gray-400">[Insert Date]</span>
          </div>
          <p>
            This Privacy Policy explains how Fanslio collects, uses, and protects your personal data in compliance with the EU General Data Protection Regulation (GDPR).
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
      <motion.footer 
  initial={{ opacity: 0, y: 30 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.8 }}
  className="px-6 py-12"
>
  <div className="max-w-7xl mx-auto text-center">




    {/* Footer Links */}
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5 }}
      className="flex flex-wrap justify-center gap-4 text-sm text-white mb-4"
    >
      <Link href="/tos" className="hover:text-gray-200 transition">Terms of Service</Link>
      <Link href="/privacy" className="hover:text-gray-200 transition">Privacy Policy</Link>
      <Link href="/child-protection" className="hover:text-gray-200 transition">Child Protection</Link>
      <Link href="/anti-slavery" className="hover:text-gray-200 transition">Anti-Slavery</Link>
      <Link href="/guidelines" className="hover:text-gray-200 transition">Community Guidelines</Link>
      <Link href="/dmca" className="hover:text-gray-200 transition">DMCA Policy</Link>
      <Link href="/cookiepolicy" className="hover:text-gray-200 transition">Cookie Policy</Link>
    </motion.div>

    {/* Support Email */}
    <motion.p 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6 }}
      className="text-white text-sm"
    >
      Need help? Contact us at{" "}
      <a href="mailto:support@fanslio.com" className="text-yellow-500 hover:underline">
        support@fanslio.com
      </a>
    </motion.p>
  </div>
</motion.footer>
    </div>
  );
} 