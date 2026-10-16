import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { registerPush } from '../lib/push';

/** Registra al usuario logueado para push y enruta los toques de notificación. */
export default function PushRegistrar() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    let cleanup = () => {};
    registerPush(user.id, (data) => {
      if (typeof data.screen === 'string') navigate(data.screen);
    }).then((c) => {
      cleanup = c;
    });
    return () => cleanup();
  }, [user, navigate]);

  return null;
}
