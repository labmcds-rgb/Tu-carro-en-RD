import { Capacitor } from '@capacitor/core';
import { PushNotifications } from '@capacitor/push-notifications';
import { supabase } from './supabase';

/** ¿Estamos en la app nativa (Android/iOS)? Las push solo funcionan ahí. */
export const isNative = () => Capacitor.isNativePlatform();

async function saveToken(userId: string, token: string) {
  await supabase.from('device_tokens').upsert(
    { user_id: userId, token, platform: Capacitor.getPlatform(), updated_at: new Date().toISOString() },
    { onConflict: 'token' },
  );
}

/**
 * Registra el dispositivo para notificaciones push y guarda su token FCM en
 * Supabase. Solo en la app nativa (no hace nada en la web). `onOpen` se dispara
 * cuando el usuario toca una notificación, con su `data` (ej. `{ screen: '/reservas' }`).
 */
export async function registerPush(
  userId: string,
  onOpen?: (data: Record<string, unknown>) => void,
): Promise<() => void> {
  if (!isNative()) return () => {};

  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return () => {};
    await PushNotifications.register();
  } catch {
    return () => {};
  }

  const handles = await Promise.all([
    PushNotifications.addListener('registration', (token) => {
      saveToken(userId, token.value).catch(() => {});
    }),
    PushNotifications.addListener('registrationError', () => {}),
    PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
      onOpen?.((action.notification.data ?? {}) as Record<string, unknown>);
    }),
  ]);

  return () => {
    handles.forEach((h) => h.remove());
  };
}

/** Pide permiso y registra; devuelve si quedó activado. Usado por el interruptor de Ajustes. */
export async function enablePush(userId: string): Promise<boolean> {
  if (!isNative()) return false;
  try {
    const perm = await PushNotifications.requestPermissions();
    if (perm.receive !== 'granted') return false;
    await PushNotifications.addListener('registration', (token) => {
      saveToken(userId, token.value).catch(() => {});
    });
    await PushNotifications.register();
    return true;
  } catch {
    return false;
  }
}

/** Desactiva las push para este usuario (borra sus tokens guardados). */
export async function disablePush(userId: string): Promise<void> {
  try {
    await supabase.from('device_tokens').delete().eq('user_id', userId);
  } catch {
    /* ignore */
  }
}

/**
 * Pide al backend (Edge Function `send-push`) que envíe una notificación a un
 * usuario específico o a todos los de un rol. Fire-and-forget.
 */
export async function notifyPush(input: {
  userId?: string;
  role?: 'admin' | 'customer';
  title: string;
  body: string;
  data?: Record<string, string>;
}): Promise<void> {
  try {
    await supabase.functions.invoke('send-push', { body: input });
  } catch {
    /* la función puede no estar desplegada todavía — se ignora */
  }
}
