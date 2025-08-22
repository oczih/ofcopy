import { Separator } from '@radix-ui/react-separator';
import { AlertCircle, Eye, EyeOff, Verified } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
import { Creator } from '@/app/types';
import { signIn } from "next-auth/react";

export default function SignUpModal({ open, onClose, creator, avatarUrl }: { open: boolean, onClose: () => void, creator: Creator, avatarUrl: string }) {
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordField, setPasswordField] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: ''
  });
  const [showPassword, setShowPassword] = useState(false);
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
  const router = useRouter();
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
  useEffect(() => {
    if (open) {
      // Lock scroll
      document.body.style.overflow = 'hidden';
    } else {
      // Unlock scroll
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to ensure scroll is unlocked when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);
  if (!open) return null;
  
  const handleClose = () => {
      setShowExitConfirm(true);
  };

  const handleLeave = () => {
    setShowExitConfirm(false);
    onClose();
  };

  const handleStay = () => {
    setShowExitConfirm(false);
  };
  const handleOAuthSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
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
      setIsLoading(false);
    }
  };
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
        <div className="bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl p-8 w-full max-w-lg relative animate-scale-in overflow-hidden">
          {/* Gradient overlay for visual appeal */}
          <div className="absolute inset-0 bg-gradient-to-br from-pink-500/5 to-purple-500/5 pointer-events-none" />
          
          <button
            className="absolute cursor-pointer top-4 right-4 text-gray-400 transition-colors duration-200 z-10 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-800/70"
            onClick={handleClose}
            aria-label="Close"
          >
            ✕
          </button>

          <div className="relative z-10">
            <h2 className="text-3xl font-bold text-white mb-6 text-center bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              Sign Up Today
            </h2>

            <div className="text-gray-300 text-sm">
                <div className="text-center">
                  {/* Creator Image */}
                  <div className="mb-6 flex justify-center">
                    <div className="relative w-32 h-32">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 p-1">
                        <div className="w-full h-full rounded-full overflow-hidden bg-slate-800">
                          <Image
                            src={avatarUrl || '/api/placeholder/128/128'}
                            alt={creator.name || creator.username}
                            className="w-full h-full object-cover"
                            style={{ imageRendering: 'auto' }}
                            height={200}
                            width={200}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                
                  <div className="mb-8 space-y-2 flex flex-col items-center">
  <div className="flex flex-row items-center justify-center gap-2">
    <h3 className="text-xl font-semibold text-white">{creator.name}</h3>
    <Verified />
  </div>
  <h3 className="text-md font-semibold text-white/50">@{creator.username}</h3>
</div>

                  
                  <div className="flex flex-col gap-3 w-full items-center">
            <button
              onClick={() => handleOAuthSignIn('google')}
              disabled={isLoading}
              className="flex items-center gap-2 w-sm justify-center py-2 rounded-full bg-white/10 text-white hover:border-white hover:border duration-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Sign in with Google'}
            </button>
            <button
              onClick={() => handleOAuthSignIn('twitter')}
              disabled={isLoading}
              className="flex items-center gap-2 w-sm justify-center py-2 rounded-full bg-white/10 text-white hover:border-white hover:border duration-300 transition-all disabled:opacity-50 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
              {isLoading ? 'Signing in...' : 'Sign in with Twitter'}
            </button>
          </div>
          <div className="flex items-center my-8 w-full">
            <Separator className="flex-1 h-px bg-white/10" />
            <span className="mx-4 bg-white/10 px-3 text-white/10 text-xs font-semibold tracking-widest rounded-full shadow-sm">OR</span>
            <Separator className="flex-1 h-px bg-white/10" />
          </div>
          <form onSubmit={handleEmailSignup} className="space-y-4">
              {/* Email Field */}
              <div className="w-full">
                <input
                  type="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  onInput={() => setPasswordField(true)}
                  className={`w-sm pl-4 pr-4 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400 hover:outline hover:outline-white transition-all duration-200 ${
                    errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'
                  }`}
                />
                {errors.email && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field */}
              {passwordField && (<div className="w-full relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className={`w-sm pl-4 pr-4 py-3 bg-white/10 rounded-xl shadow-sm text-white placeholder-gray-400 hover:outline hover:outline-white transition-all duration-200 ${
                    errors.password ? 'border-red-500 focus:ring-red-500' : 'border-gray-200 focus:ring-purple-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-10 top-3 text-gray-400 hover:text-purple-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
                {errors.password && (
                  <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.password}
                  </p>
                )}
              </div>
              )}
              <button
                type="submit"
                disabled={isLoading} 
                className="w-sm bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? 'Unlocking...' : 'Unlock content'}
              </button>
            </form>
            <div className="text-center text-sm text-gray-400 mt-6">
            By continuing, you agree to our
            <button
              type="button"
              className="underline text-pink-400 hover:text-pink-300 mx-1"
              onClick={() => window.open("/tos", "_blank")}
            >
              Terms of Service
            </button>
            and
            <button
              type="button"
              className="underline text-pink-400 hover:text-pink-300 mx-1"
              onClick={() => window.open("/privacy", "_blank")}
            >
              Privacy Policy
            </button>
            , and that you are atleast 18 years old.
          </div>
            </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl shadow-2xl p-6 w-full max-w-md relative">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              Leave sign up?
            </h3>
            <p className="text-gray-300 text-center mb-6">
              Your sign up information will be lost if you leave now.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                className="px-6 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-slate-700 transition-colors"
                onClick={handleLeave}
              >
                Leave
              </button>
              <button
                className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-2 rounded-xl font-semibold transition-colors"
                onClick={handleStay}
              >
                Stay
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
