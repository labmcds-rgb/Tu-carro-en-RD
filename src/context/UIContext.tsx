import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react';

type UIContextValue = {
  toast: (msg: string) => void;
  openSheet: (node: ReactNode) => void;
  closeSheet: () => void;
  // estado que consume el AppShell para renderizar
  toastMsg: string;
  toastShow: boolean;
  sheetNode: ReactNode;
  sheetVisible: boolean;
};

const UIContext = createContext<UIContextValue | undefined>(undefined);

export function UIProvider({ children }: { children: ReactNode }) {
  const [toastMsg, setToastMsg] = useState('');
  const [toastShow, setToastShow] = useState(false);
  const [sheetNode, setSheetNode] = useState<ReactNode>(null);
  const [sheetVisible, setSheetVisible] = useState(false);
  const toastTimer = useRef<number>(0);
  const sheetTimer = useRef<number>(0);

  const toast = useCallback((msg: string) => {
    setToastMsg(msg);
    setToastShow(true);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToastShow(false), 2400);
  }, []);

  const openSheet = useCallback((node: ReactNode) => {
    window.clearTimeout(sheetTimer.current);
    setSheetNode(node);
    setSheetVisible(true);
  }, []);

  const closeSheet = useCallback(() => {
    setSheetVisible(false);
    sheetTimer.current = window.setTimeout(() => setSheetNode(null), 340);
  }, []);

  return (
    <UIContext.Provider
      value={{ toast, openSheet, closeSheet, toastMsg, toastShow, sheetNode, sheetVisible }}
    >
      {children}
    </UIContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) throw new Error('useUI debe usarse dentro de <UIProvider>');
  return ctx;
}
