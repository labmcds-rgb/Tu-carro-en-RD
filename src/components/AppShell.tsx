import { Outlet, useLocation } from 'react-router-dom';
import { useUI } from '../context/UIContext';
import { useAuth } from '../context/AuthContext';
import { useI18n } from '../i18n/I18nContext';
import TabBar from './TabBar';
import { IcWhatsApp } from './icons';
import { WHATSAPP, openWhatsApp } from '../data/constants';

export default function AppShell() {
  const { toastMsg, toastShow, sheetNode, sheetVisible, closeSheet, toast } = useUI();
  const { isAdmin } = useAuth();
  const { t } = useI18n();
  const { pathname } = useLocation();
  const stacked =
    /^\/(carro|reservar|reserva-exitosa|login|terminos|privacidad|perfil\/editar|favoritos|admin\/(equipo|extras|pago)|ajustes)/.test(
      pathname,
    );

  return (
    <div className="stage">
      <div className="phone">
        <div className={'app' + (stacked ? ' stacked' : '')}>
          <div className="viewport">
            <Outlet />
          </div>

          {!stacked && <TabBar />}
          {!stacked && <div className="homebar" />}
          {!stacked && !isAdmin && (
            <button
              className="fab"
              aria-label="WhatsApp"
              onClick={() => {
                openWhatsApp();
                toast(t('common.openingWhatsApp') + WHATSAPP);
              }}
            >
              <IcWhatsApp />
            </button>
          )}

          <div className={'scrim' + (sheetVisible ? ' show' : '')} onClick={closeSheet} />
          <div className={'sheet' + (sheetVisible ? ' show' : '')}>{sheetNode}</div>
          <div className={'toast' + (toastShow ? ' show' : '')}>{toastMsg}</div>
        </div>
      </div>
    </div>
  );
}
