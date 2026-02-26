import { useState, useEffect } from 'react';
import { api } from '../services/api';

export interface UserSettings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  jobAlerts: boolean;
  messageAlerts: boolean;
  weeklyDigest: boolean;
  profileVisibility: 'public' | 'connections' | 'private';
  showEmail: boolean;
  showActivity: boolean;
  allowMessages: boolean;
}

export const useSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.settings.get();
      setSettings(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    setSaving(true);
    setError(null);
    try {
      const data = await api.settings.update(updates);
      setSettings(data.settings);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  const resetSettings = async () => {
    setSaving(true);
    setError(null);
    try {
      const data = await api.settings.reset();
      setSettings(data.settings);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    loading,
    saving,
    error,
    updateSettings,
    resetSettings,
    refetch: fetchSettings
  };
};