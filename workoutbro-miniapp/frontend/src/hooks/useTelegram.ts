import { useEffect, useState } from 'react';
import { TelegramWebApp, TelegramUser } from '../types';

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

export const useTelegram = () => {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [user, setUser] = useState<TelegramUser | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    console.log('useTelegram: Initializing...');
    
    // Always use fallback for now to test
    console.log('useTelegram: Using fallback mode');
    setUser({
      id: 12345,
      first_name: 'Test User',
      last_name: 'Development',
      username: 'testuser'
    });
    setIsReady(true);
    console.log('useTelegram: Ready with fallback');
  }, []);

  const sendData = (data: any) => {
    if (webApp) {
      webApp.sendData(JSON.stringify(data));
    }
  };

  const showMainButton = (text: string, onClick: () => void) => {
    if (webApp) {
      webApp.MainButton.setText(text);
      webApp.MainButton.onClick(onClick);
      webApp.MainButton.show();
    }
  };

  const hideMainButton = () => {
    if (webApp) {
      webApp.MainButton.hide();
    }
  };

  const showBackButton = (onClick: () => void) => {
    if (webApp) {
      webApp.BackButton.onClick(onClick);
      webApp.BackButton.show();
    }
  };

  const hideBackButton = () => {
    if (webApp) {
      webApp.BackButton.hide();
    }
  };

  const close = () => {
    if (webApp) {
      webApp.close();
    }
  };

  return {
    webApp,
    user,
    isReady,
    sendData,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    close
  };
};
