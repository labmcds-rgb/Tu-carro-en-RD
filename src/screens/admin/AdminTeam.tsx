import { useCallback, useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { useUI } from '../../context/UIContext';
import { useI18n } from '../../i18n/I18nContext';
import Splash from '../../components/Splash';
import { IcChevronLeft, IcSearch, IcX } from '../../components/icons';

type UserRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  avatar_initials: string | null;
};

export default function AdminTeam() {
  const nav = useNavigate();
  const { user, isAdmin, profileLoaded, session } = useAuth();
  const { toast } = useUI();
  const { t } = useI18n();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone, role, avatar_initials')
      .order('role', { ascending: true })
      .order('full_name', { ascending: true });
    setUsers((data as UserRow[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (isAdmin) void load();
  }, [isAdmin, load]);

  if (session && !profileLoaded) return <Splash />;
  if (!isAdmin) return <Navigate to="/" replace />;

  async function toggle(u: UserRow) {
    if (!u.email || busy) return;
    const makeAdmin = u.role !== 'admin';
    setBusy(u.id);
    const { error } = await supabase.rpc('set_admin_role', {
      target_email: u.email,
      make_admin: makeAdmin,
    });
    setBusy(null);
    if (error) {
      toast(t('adminTeam.roleError') + error.message);
      return;
    }
    toast(
      makeAdmin
        ? t('adminTeam.nowAdmin', { name: u.full_name ?? u.email ?? '' })
        : t('adminTeam.removedAdmin', { name: u.full_name ?? u.email ?? '' }),
    );
    void load();
  }

  const term = q.trim().toLowerCase();
  const filtered = users.filter(
    (u) =>
      !term ||
      (u.full_name ?? '').toLowerCase().includes(term) ||
      (u.email ?? '').toLowerCase().includes(term),
  );

  return (
    <section className="screen stack active">
      <div className="stackhead">
        <button className="back" onClick={() => nav('/perfil')} aria-label={t('common.back')}>
          <IcChevronLeft />
        </button>
        <div className="t">{t('profile.admins')}</div>
      </div>

      <div className="sh-sub" style={{ padding: '0 20px 10px', margin: 0 }}>
        {t('adminTeam.sub')}
      </div>

      <div className="searchbox">
        <IcSearch />
        <input
          type="text"
          placeholder={t('adminTeam.searchPh')}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoComplete="off"
        />
        {q && (
          <button className="search-clear" onClick={() => setQ('')} aria-label={t('common.clear')}>
            <IcX style={{ width: 12, height: 12 }} />
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px', fontWeight: 600 }}>
          {t('adminTeam.loadingUsers')}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--muted)', padding: '40px 20px', fontWeight: 600 }}>
          {t('adminTeam.noUsers')}
        </div>
      ) : (
        <div style={{ padding: '6px 20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((u) => {
            const isSelf = u.id === user?.id;
            const admin = u.role === 'admin';
            const initials = u.avatar_initials ?? (u.full_name ?? u.email ?? 'U').slice(0, 2).toUpperCase();
            return (
              <div className="team-row" key={u.id}>
                <div className="team-av">{initials}</div>
                <div className="team-info">
                  <div className="team-name">
                    {u.full_name ?? t('adminTeam.noName')}
                    {isSelf && <span className="you">{t('adminTeam.you')}</span>}
                  </div>
                  <div className="team-email">{u.email}</div>
                </div>
                {isSelf ? (
                  <span className={'role-badge admin'}>{t('common.adminBadge')}</span>
                ) : (
                  <div className="team-ctrl">
                    <span className={'role-badge' + (admin ? ' admin' : '')}>
                      {admin ? t('common.adminBadge') : t('common.client')}
                    </span>
                    <div
                      className={'switch' + (admin ? ' on' : '') + (busy === u.id ? ' busy' : '')}
                      onClick={() => toggle(u)}
                      role="switch"
                      aria-checked={admin}
                    >
                      <span className="knob" />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
