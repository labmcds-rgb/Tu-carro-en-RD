import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import { CarsProvider } from './context/CarsContext';
import { FavoritesProvider } from './context/FavoritesContext';
import { AdminDataProvider } from './context/AdminDataContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <I18nProvider>
        <AuthProvider>
          <UIProvider>
            <CarsProvider>
              <FavoritesProvider>
                <AdminDataProvider>
                  <App />
                </AdminDataProvider>
              </FavoritesProvider>
            </CarsProvider>
          </UIProvider>
        </AuthProvider>
      </I18nProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
