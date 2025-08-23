'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Save, LogOut, User, MapPin, Mail } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    email: '',
    username: '',
    full_name: '',
    location: '',
    avatar_url: ''
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState<{type: string, message: string} | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username, full_name, location, avatar_url')
        .eq('id', user.id)
        .single();

      if (!error) {
        setProfile({
          email: user.email ?? '',
          username: data?.username ?? '',
          full_name: data?.full_name ?? '',
          location: data?.location ?? '',
          avatar_url: data?.avatar_url ?? ''
        });
      } else {
        setProfile({
          email: user.email ?? '',
          username: '',
          full_name: '',
          location: '',
          avatar_url: ''
        });
      }

      setLoading(false);
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) return;

    try {
      const updates = {
        id: user.id,
        username: profile.username,
        full_name: profile.full_name,
        location: profile.location,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(updates);

      if (error) throw error;

      setStatus({ type: 'success', message: 'Profile updated successfully!' });
      setEditing(false);
    } catch (error) {
      setStatus({ type: 'error', message: 'Failed to update profile' });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/learn" className="flex items-center text-gray-900">
                <ArrowLeft className="h-5 w-5 mr-2" />
                To Learning
              </Link>
            </div>
            <div className="flex items-center">
              <Link 
                href="/" 
                className="text-gray-900 hover:text-green-600 px-3 py-2 rounded-md text-sm font-medium"
              >
                Home
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 text-center">
            <div className="relative mx-auto w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden">
              {profile.avatar_url ? (
                <Image
                  src={profile.avatar_url}
                  alt="Profile"
                  width={96}
                  height={96}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="w-full h-full bg-green-100 flex items-center justify-center">
                  <User className="h-12 w-12 text-green-600" />
                </div>
              )}
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              {profile.full_name || profile.username || 'Your Profile'}
            </h1>
            {profile.location && (
              <p className="flex items-center justify-center text-gray-600 mt-1">
                <MapPin className="h-4 w-4 mr-1" /> {profile.location}
              </p>
            )}
          </div>

          {/* Profile Form */}
          <div className="p-8">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600"></div>
              </div>
            ) : (
              <div className="space-y-6">
                {status && (
                  <div className={`p-3 rounded-md ${
                    status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {status.message}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                      <Mail className="h-4 w-4 mr-2 text-gray-500" /> Email
                    </label>
                    <input
                      type="text"
                      value={profile.email}
                      disabled
                      className="w-full bg-gray-50 text-gray-700 rounded-lg px-4 py-2 border border-gray-200"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                    <input
                      type="text"
                      value={profile.username}
                      disabled={!editing}
                      onChange={(e) => setProfile({ ...profile, username: e.target.value })}
                      className="w-full rounded-lg px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profile.full_name}
                      disabled={!editing}
                      onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
                      className="w-full rounded-lg px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                    <input
                      type="text"
                      value={profile.location}
                      disabled={!editing}
                      onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                      className="w-full rounded-lg px-4 py-2 border border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-50"
                      placeholder="City, Country"
                    />
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  {editing ? (
                    <>
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                      >
                        <Save className="h-5 w-5 mr-2" />
                        {loading ? 'Saving...' : 'Save Changes'}
                      </button>
                      <button
                        onClick={() => {
                          setEditing(false);
                          setStatus(null);
                        }}
                        className="px-5 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setEditing(true)}
                        className="flex items-center px-5 py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-lg transition-colors"
                      >
                        <Edit className="h-5 w-5 mr-2" />
                        Edit Profile
                      </button>
                      <button
                        onClick={handleLogout}
                        className="flex items-center px-5 py-2.5 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        <LogOut className="h-5 w-5 mr-2" />
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}