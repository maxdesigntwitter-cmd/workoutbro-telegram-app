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
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      console.log('useTelegram: Telegram WebApp found');
      setWebApp(tg);
      
      // Initialize WebApp
      tg.ready();
      tg.expand();
      
      // Get user data
      const userData = tg.initDataUnsafe.user;
      if (userData) {
        console.log('useTelegram: User data found:', userData);
        setUser(userData);
      }
      
      setIsReady(true);
      console.log('useTelegram: Ready with Telegram WebApp');
      
      // Configure theme
      document.body.style.backgroundColor = tg.backgroundColor || '#0E0E10';
      
      // Configure header color
      if (tg.headerColor) {
        document.documentElement.style.setProperty('--tg-header-color', tg.headerColor);
      }
    } else {
      // Fallback for development/testing outside Telegram
      console.log('useTelegram: Telegram WebApp not available, using fallback');
      setUser({
        id: 12345,
        first_name: 'Test User',
        last_name: 'Development',
        username: 'testuser'
      });
      setIsReady(true);
      console.log('useTelegram: Ready with fallback');
    }
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
