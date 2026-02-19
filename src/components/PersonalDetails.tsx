import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface ProfileFormState {
  fullName: string;
  username: string;
  age: string;
  email: string;
  phone: string;
  address: string;
}

const initialForm: ProfileFormState = {
  fullName: '',
  username: '',
  age: '',
  email: '',
  phone: '',
  address: '',
};

export const PersonalDetails: React.FC = () => {
  const [form, setForm] = useState<ProfileFormState>(initialForm);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      setError('');
      setSuccess('');

      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError || !userData.user) {
        setError('Unable to load user session. Please login again.');
        setLoading(false);
        return;
      }

      setUserId(userData.user.id);

      const { data: profileData, error: profileError } = await supabase
        .from('user_profiles')
        .select('full_name, username, age, email, phone, address')
        .eq('id', userData.user.id)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          setForm({
            ...initialForm,
            email: userData.user.email ?? '',
            phone: userData.user.phone ?? '',
          });
          setLoading(false);
          return;
        }
        setError(profileError.message);
        setLoading(false);
        return;
      }

      setForm({
        fullName: profileData.full_name ?? '',
        username: profileData.username ?? '',
        age: profileData.age ? String(profileData.age) : '',
        email: profileData.email ?? userData.user.email ?? '',
        phone: profileData.phone ?? userData.user.phone ?? '',
        address: profileData.address ?? '',
      });
      setLoading(false);
    };

    loadProfile();
  }, []);

  const updateField = (key: keyof ProfileFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!userId) {
      setError('User session missing. Please login again.');
      return;
    }

    if (!form.fullName.trim() || !form.username.trim() || !form.age.trim() || !form.email.trim() || !form.address.trim()) {
      setError('Please fill all required details.');
      return;
    }

    const numericAge = Number.parseInt(form.age, 10);
    if (Number.isNaN(numericAge) || numericAge < 1) {
      setError('Please enter a valid age.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }

    setSaving(true);
    const { error: updateError } = await supabase.from('user_profiles').upsert(
      {
        id: userId,
        full_name: form.fullName.trim(),
        username: form.username.trim(),
        age: numericAge,
        email: form.email.trim(),
        phone: form.phone.trim() || null,
        address: form.address.trim(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' }
    );

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    setSuccess('Personal details updated successfully.');
  };

  if (loading) {
    return <div className="text-gray-400">Loading personal details...</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 max-w-3xl">
      <form onSubmit={handleSave} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-white font-medium mb-2">Name *</label>
            <input
              type="text"
              value={form.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Username *</label>
            <input
              type="text"
              value={form.username}
              onChange={(e) => updateField('username', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Age *</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => updateField('age', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Mail *</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => updateField('email', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-white font-medium mb-2">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => updateField('phone', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-white font-medium mb-2">Address *</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => updateField('address', e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 focus:outline-none focus:border-pink-500"
          />
        </div>

        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-200 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-emerald-500 bg-opacity-20 border border-emerald-500 text-emerald-200 rounded-lg px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 disabled:opacity-70 text-white font-semibold py-3 px-6 rounded-lg transition-all"
        >
          {saving ? 'Saving...' : 'Edit Personal Details'}
        </button>
      </form>
    </div>
  );
};
