"use client";
import { useState, useEffect, Suspense } from "react";
import { Eye, EyeOff, AlertCircle } from "lucide-react";
import { signIn, getSession, useSession, signOut } from "next-auth/react";
import { toast, Toaster } from 'react-hot-toast';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={<div className="text-white text-center">Loading...</div>}>
      <LoginPage />
    </Suspense>
  );
}

  function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (status !== 'loading') {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    if (session?.user) {
      if (typeof window !== "undefined") router.replace("/home");
    }
  }, [session, router]);

  useEffect(() => {
    const verified = searchParams.get('verified');
    const error = searchParams.get('error');

    if (verified === 'true') {
      toast.success('Email verified successfully!');
    }

    if (error) {
      switch (error) {
        case 'invalid-verification-link':
          toast.error('Invalid verification link. Please try again.');
          break;
        case 'invalid-or-expired-token':
          toast.error('Verification link has expired. Please request a new one.');
          break;
        case 'user-not-found':
          toast.error('User not found. Please check your email or sign up.');
          break;
        case 'verification-failed':
          toast.error('Email verification failed. Please try again.');
          break;
        case 'OAuthSignin':
          toast.error('Error signing in with OAuth provider.');
          break;
        case 'OAuthCallback':
          toast.error('OAuth authentication failed.');
          break;
        case 'OAuthCreateAccount':
          toast.error('Could not create OAuth account.');
          break;
        case 'EmailCreateAccount':
          toast.error('Could not create account.');
          break;
        case 'Callback':
          toast.error('Authentication callback error.');
          break;
        case 'OAuthAccountNotLinked':
          toast.error('Account already exists with different provider.');
          break;
        case 'EmailSignin':
          toast.error('Email sign-in error.');
          break;
        case 'CredentialsSignin':
          toast.error('Invalid email or password.');
          break;
        case 'SessionRequired':
          toast.error('Please sign in to access this page.');
          break;
        default:
          toast.error('Authentication error occurred.');
      }
    }
  }, [searchParams]);

  const handleOAuthSignIn = async (provider: string) => {
    try {
      setLoading(true);
      const result = await signIn(provider, { 
        callbackUrl: '/discover',
        redirect: false 
      });
      
      if (result?.error) {
        toast.error(`Error signing in with ${provider}: ${result.error}`);
      } else if (result?.url) {
        router.push(result.url);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      toast.error(`Error signing in with ${provider}: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEmailSignIn = async () => {
    
    if (!validateForm()) return;

    setLoading(true);
    
    try {
      await signOut({ redirect: false });
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        // Parse the error message from NextAuth
        let errorMessage = 'Sign in failed';
        
        if (result.error === 'CredentialsSignin') {
          errorMessage = 'Invalid email or password';
        } else if (result.error.includes('verify your email')) {
          errorMessage = 'Please verify your email before signing in. Check your inbox for the verification link.';
        } else {
          errorMessage = result.error;
        }
        
        toast.error(errorMessage);
      } else if (result?.ok) {
        toast.success('Signed in successfully!');
        // Refresh session and redirect
        const session = await getSession();
        if (session) {
          router.push('/discover');
        }
      }
      
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Sign in failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password")
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#13072c]">
      <Toaster
          position="top-center"
          reverseOrder={false}
        />
       <h1 className="text-3xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Fanslio</h1>
       <h1 className="text-5xl font-extrabold text-white mb-4 text-center drop-shadow-lg">Log In</h1>
      <div className="w-full max-w-md bg-white/10 rounded-2xl shadow-xl p-8 flex flex-col items-center">
        {/* Login Method Toggle */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={loading}
              className="flex items-center gap-2 w-full justify-center py-2 rounded-full bg-white/10 text-white hover:border-white hover:border duration-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            <button
              onClick={() => handleOAuthSignIn('twitter')}
              disabled={loading}
              className="flex items-center gap-2 w-full justify-center py-2 rounded-full bg-white/10 text-white hover:border-white hover:border duration-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {loading ? 'Signing in...' : 'Sign in with Twitter'}
            </button>
          </div>
          <div className="flex items-center my-8 w-full">
            <Separator className="flex-1 h-px bg-white/10" />
            <span className="mx-4 bg-white/10 px-3 text-white/10 text-xs font-semibold tracking-widest rounded-full shadow-sm">OR</span>
            <Separator className="flex-1 h-px bg-white/10" />
          </div>
          <div className="space-y-4 w-full">
            {/* Email Field */}
            <div>
              <div className="relative">
                <input
                  type="email"
                  placeholder="Email Address*"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-4 pr-4 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400 hover:outline hover:outline-white transition-all duration-200 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.email}
                </p>
              )}
            </div>
            {/* Password Field */}
            <div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password*"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-full pl-4 pr-12 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400 hover:outline hover:outline-white  transition-all duration-200 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.password}
                </p>
              )}
            </div>
            {/* Forgot Password Link */}
            <div className="text-right">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs text-purple-600 hover:text-purple-500 underline"
              >
                Forgot password?
              </button>
            </div>
            <button
              type="button"
              onClick={handleEmailSignIn}
              disabled={loading}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </button>
          </div>
        <div className="text-center mt-6 w-full">
          <p className="text-white text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-purple-600 hover:text-purple-500 underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
