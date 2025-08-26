'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Email/password login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (authError) {
      setErrorMsg(authError.message);
      return;
    }

    router.push('/'); // redirect after login
  };

  // Google OAuth login
  const handleGoogleLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`, // must be whitelisted in Supabase
      },
    });

    setIsLoading(false);
    if (authError) setErrorMsg(authError.message);
  };

  // GitHub OAuth login
  const handleGithubLogin = async () => {
    setErrorMsg('');
    setIsLoading(true);

    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/`, // must be whitelisted in Supabase
      },
    });

    setIsLoading(false);
    if (authError) setErrorMsg(authError.message);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="mb-6 text-3xl font-bold text-gray-900">Sign in to Tinpear</h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && <p className="text-red-600 text-sm">{errorMsg}</p>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="you@gmail.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="••••••••"
            />
          </div>

          <div className="flex items-center justify-between text-sm">
            <Link href="/reset-password" className="text-green-600 hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-green-600 py-2 text-white font-semibold hover:bg-green-700 transition disabled:opacity-60"
          >
            {isLoading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* OAuth buttons */}
        <div className="mt-4 grid gap-3">
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
          >
            <FcGoogle className="h-5 w-5" />
            Continue with Google
          </button>

          <button
            onClick={handleGithubLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-60"
          >
            <FaGithub className="h-5 w-5" />
            Continue with GitHub
          </button>
        </div>

        <p className="mt-6 text-center text-sm text-gray-600">
          Don’t have an account?{' '}
          <Link href="/signup" className="text-green-600 hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
