import React, { useState } from 'react';
import { Music, Eye, EyeOff } from 'lucide-react';
import { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { postJson } from '../lib/api';

interface LoginProps {
  onAuthenticated: () => void;
}

type AuthStep = 'contact' | 'otp' | 'password' | 'profile';
type AuthMode = 'email' | 'phone';

export const Login: React.FC<LoginProps> = ({ onAuthenticated }) => {
  const [step, setStep] = useState<AuthStep>('contact');
  const [mode, setMode] = useState<AuthMode>('email');
  const [contact, setContact] = useState('');
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [age, setAge] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [address, setAddress] = useState('');

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  interface OtpVerifyResponse {
    access_token?: string;
    refresh_token?: string;
    user?: User;
  }

  const resetNotice = () => {
    setError('');
    setMessage('');
  };

  const isNetworkFetchError = (value: unknown) => {
    return value instanceof TypeError && value.message.toLowerCase().includes('fetch');
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();

    const normalizedContact = contact.trim();
    if (!normalizedContact) {
      setError(mode === 'email' ? 'Email is required' : 'Phone number is required');
      return;
    }

    if (mode === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(normalizedContact)) {
        setError('Please enter a valid email address');
        return;
      }
    } else {
      const phoneRegex = /^\+?[1-9]\d{9,14}$/;
      if (!phoneRegex.test(normalizedContact)) {
        setError('Please enter a valid phone number with country code (example: +919876543210)');
        return;
      }
    }

    setLoading(true);

    try {
      try {
        await postJson<{ success: boolean; message: string }>('/auth/otp/request', {
          mode,
          contact: normalizedContact,
        });
      } catch (requestError) {
        if (!isSupabaseConfigured) {
          throw requestError;
        }

        if (isNetworkFetchError(requestError)) {
          if (mode === 'email') {
            const { error: signInError } = await supabase.auth.signInWithOtp({
              email: normalizedContact,
              options: { shouldCreateUser: true },
            });
            if (signInError) {
              throw signInError;
            }
          } else {
            const { error: signInError } = await supabase.auth.signInWithOtp({
              phone: normalizedContact,
            });
            if (signInError) {
              throw signInError;
            }
          }
        } else {
          throw requestError;
        }
      }

      setMessage(`OTP sent to your ${mode === 'email' ? 'email' : 'phone number'}`);
      setStep('otp');
    } catch (requestError) {
      const messageText = requestError instanceof Error ? requestError.message : 'Failed to send OTP';
      setError(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();

    const normalizedOtp = otp.trim();
    if (!normalizedOtp || normalizedOtp.length < 4) {
      setError('Enter the OTP you received');
      return;
    }

    if (!isSupabaseConfigured) {
      setError('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env');
      return;
    }

    setLoading(true);
    try {
      let resolvedUser: User | null = null;

      try {
        const data = await postJson<OtpVerifyResponse>('/auth/otp/verify', {
          mode,
          contact: contact.trim(),
          token: normalizedOtp,
        });

        if (!data.access_token || !data.refresh_token) {
          setError('OTP verified but session was not created. Please try again.');
          return;
        }

        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: data.access_token,
          refresh_token: data.refresh_token,
        });

        if (sessionError || !sessionData.user) {
          setError(sessionError?.message ?? 'Failed to establish authenticated session.');
          return;
        }

        resolvedUser = data.user ?? sessionData.user;
      } catch (verifyError) {
        if (!isSupabaseConfigured || !isNetworkFetchError(verifyError)) {
          throw verifyError;
        }

        const verifyPayload =
          mode === 'email'
            ? { email: contact.trim(), token: normalizedOtp, type: 'email' as const }
            : { phone: contact.trim(), token: normalizedOtp, type: 'sms' as const };

        const { data: directVerifyData, error: directVerifyError } = await supabase.auth.verifyOtp(verifyPayload);
        if (directVerifyError || !directVerifyData.user) {
          throw directVerifyError ?? new Error('OTP verification failed');
        }

        resolvedUser = directVerifyData.user;
      }

      if (!resolvedUser) {
        setError('Failed to verify OTP. Try again.');
        return;
      }

      setCurrentUser(resolvedUser);
      setProfileEmail(resolvedUser.email ?? (mode === 'email' ? contact.trim() : ''));
      setMessage('OTP verified successfully. Set your password.');
      setStep('password');
    } catch (verifyError) {
      const messageText = verifyError instanceof Error ? verifyError.message : 'Failed to verify OTP';
      setError(messageText);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const { data, error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) {
        setError(updateError.message);
        return;
      }

      if (data.user) {
        setCurrentUser(data.user);
      }

      setMessage('Password saved. Complete your profile.');
      setStep('profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    resetNotice();

    if (!currentUser) {
      setError('Session expired. Please login again.');
      setStep('contact');
      return;
    }

    if (!fullName.trim() || !username.trim() || !age.trim() || !profileEmail.trim() || !address.trim()) {
      setError('Please fill all profile details');
      return;
    }

    const numericAge = Number.parseInt(age, 10);
    if (Number.isNaN(numericAge) || numericAge < 1) {
      setError('Please enter a valid age');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileEmail.trim())) {
      setError('Please enter a valid mail address');
      return;
    }

    setLoading(true);
    try {
      const { error: profileError } = await supabase.from('user_profiles').upsert(
        {
          id: currentUser.id,
          full_name: fullName.trim(),
          username: username.trim(),
          age: numericAge,
          email: profileEmail.trim(),
          phone: mode === 'phone' ? contact.trim() : currentUser.phone,
          address: address.trim(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (profileError) {
        setError(profileError.message);
        return;
      }

      onAuthenticated();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      </div>

      {/* Login Card */}
      <div className="relative w-full max-w-md z-10">
        <div className="bg-gray-900 backdrop-blur-xl border border-gray-800 rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-pink-500 to-red-500 p-4 rounded-xl mb-4">
              <Music className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
              MIRCHI
            </h1>
            <p className="text-gray-400 text-sm mt-2">Your Music, Your Vibes</p>
          </div>

          {/* Form */}
          {step === 'contact' && (
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setMode('email')}
                  className={`rounded-lg px-3 py-2 border transition-all ${
                    mode === 'email'
                      ? 'border-pink-500 bg-pink-500/10 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-300'
                  }`}
                >
                  Gmail
                </button>
                <button
                  type="button"
                  onClick={() => setMode('phone')}
                  className={`rounded-lg px-3 py-2 border transition-all ${
                    mode === 'phone'
                      ? 'border-pink-500 bg-pink-500/10 text-white'
                      : 'border-gray-700 bg-gray-800 text-gray-300'
                  }`}
                >
                  Phone
                </button>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">
                  {mode === 'email' ? 'Gmail Address' : 'Phone Number'}
                </label>
                <input
                  type={mode === 'email' ? 'email' : 'tel'}
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder={mode === 'email' ? 'you@gmail.com' : '+919876543210'}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-70 text-white font-semibold py-3 rounded-lg transition-all transform hover:scale-105 active:scale-95 shadow-lg"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit OTP"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setStep('contact')}
                  className="w-full bg-gray-800 border border-gray-700 text-white font-semibold py-3 rounded-lg"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-70 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </button>
              </div>
            </form>
          )}

          {step === 'password' && (
            <form onSubmit={handleSetPassword} className="space-y-6">
              <div>
                <label className="block text-white font-medium mb-2">Create Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimum 6 characters"
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Confirm Password</label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter password"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-opacity-20 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-70 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {loading ? 'Saving...' : 'Set Password'}
              </button>
            </form>
          )}

          {step === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-white font-medium mb-2">Age</label>
                  <input
                    type="number"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
                <div>
                  <label className="block text-white font-medium mb-2">Mail</label>
                  <input
                    type="email"
                    value={profileEmail}
                    onChange={(e) => setProfileEmail(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white font-medium mb-2">Address</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-70 text-white font-semibold py-3 rounded-lg transition-all"
              >
                {loading ? 'Saving Profile...' : 'Complete Registration'}
              </button>
            </form>
          )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 rounded-lg px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {message && (
              <div className="bg-emerald-500 bg-opacity-20 border border-emerald-500 text-emerald-200 rounded-lg px-4 py-3 text-sm">
                {message}
              </div>
            )}

          {/* Footer */}
          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm text-center">
              Login flow: OTP verification → password setup → profile details
            </p>
          </div>

          {/* Features */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Stream unlimited music</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Create and share playlists</span>
            </div>
            <div className="flex items-center gap-3 text-gray-400 text-sm">
              <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
              <span>Discover new artists</span>
            </div>
          </div>
        </div>

        {/* Terms */}
        <p className="text-gray-500 text-xs text-center mt-6">
          By signing in, you agree to our Terms & Conditions
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
      `}</style>
    </div>
  );
};
