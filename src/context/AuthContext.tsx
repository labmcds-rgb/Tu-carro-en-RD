import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { useI18n } from '../i18n/I18nContext';
import { OTP_LENGTH } from '../data/constants';
import type { Profile } from '../types/db';

type TFn = (key: string, vars?: Record<string, string | number>) => string;

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  profileLoaded: boolean;
  signInWithPassword: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string,
  ) => Promise<{ error: string | null; needsConfirmation: boolean; alreadyRegistered: boolean }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  verifySignupOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  resendSignup: (email: string) => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  verifyRecoveryOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  updatePassword: (password: string) => Promise<{ error: string | null }>;
  deleteAccount: () => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Traduce los errores de Supabase a mensajes claros en el idioma activo. */
function translateError(message: string, t: TFn): string {
  const m = message.toLowerCase();
  if (m.includes('invalid login credentials')) return t('authErr.invalidLogin');
  if (m.includes('email not confirmed')) return t('authErr.notConfirmed');
  if (m.includes('user already registered') || m.includes('already registered'))
    return t('authErr.alreadyRegistered');
  if (m.includes('password should be at least')) return t('authErr.pwShort');
  if (m.includes('should be different') || m.includes('different from the old')) return t('authErr.pwSame');
  if (m.includes('unable to validate email') || m.includes('invalid email')) return t('authErr.invalidEmail');
  return message;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { t } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    setProfile((data as Profile) ?? null);
    setProfileLoaded(true);
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) void loadProfile(data.session.user.id);
      else setProfileLoaded(true);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (newSession?.user) void loadProfile(newSession.user.id);
      else {
        setProfile(null);
        setProfileLoaded(true);
      }
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin',
    loading,
    profileLoaded,
    async signInWithPassword(email, password) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error ? translateError(error.message, t) : null };
    },
    async signUp(email, password, fullName, phone) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone } },
      });
      if (error)
        return { error: translateError(error.message, t), needsConfirmation: false, alreadyRegistered: false };
      // Supabase devuelve identities:[] cuando el correo ya está registrado y confirmado.
      const identities = data.user?.identities;
      const alreadyRegistered =
        !!data.user && Array.isArray(identities) && identities.length === 0 && !data.session;
      // Si no hay sesión (y no es cuenta existente), el proyecto exige confirmación por correo.
      return { error: null, needsConfirmation: !data.session && !alreadyRegistered, alreadyRegistered };
    },
    async signInWithGoogle() {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin },
      });
      return { error: error ? translateError(error.message, t) : null };
    },
    async verifySignupOtp(email, token) {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'signup' });
      if (!error) return { error: null };
      const m = error.message.toLowerCase();
      if (m.includes('expired')) return { error: t('authErr.codeExpired') };
      if (m.includes('invalid') || m.includes('token'))
        return { error: t('authErr.codeInvalid', { n: OTP_LENGTH }) };
      return { error: translateError(error.message, t) };
    },
    async resendSignup(email) {
      const { error } = await supabase.auth.resend({ type: 'signup', email });
      return { error: error ? translateError(error.message, t) : null };
    },
    async sendPasswordReset(email) {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      return { error: error ? translateError(error.message, t) : null };
    },
    async verifyRecoveryOtp(email, token) {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: 'recovery' });
      if (!error) return { error: null };
      const m = error.message.toLowerCase();
      if (m.includes('expired')) return { error: t('authErr.codeExpired') };
      if (m.includes('invalid') || m.includes('token'))
        return { error: t('authErr.codeInvalid', { n: OTP_LENGTH }) };
      return { error: translateError(error.message, t) };
    },
    async updatePassword(password) {
      const { error } = await supabase.auth.updateUser({ password });
      return { error: error ? translateError(error.message, t) : null };
    },
    async deleteAccount() {
      const { error } = await supabase.functions.invoke('delete-account');
      if (error) return { error: t('authErr.deleteFailed') + error.message };
      await supabase.auth.signOut();
      setProfile(null);
      return { error: null };
    },
    async signOut() {
      await supabase.auth.signOut();
      setProfile(null);
    },
    async refreshProfile() {
      if (session?.user) await loadProfile(session.user.id);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
