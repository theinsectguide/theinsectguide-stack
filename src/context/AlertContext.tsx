import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert, WeatherRisk } from '../types';
import { useAuth } from './AuthContext';

interface AlertContextType {
  alerts: Alert[];
  unreadCount: number;
  weatherRisk: WeatherRisk | null;
  isLoading: boolean;
  markAsRead: (id: string) => Promise<void>;
  requestPushNotifications: () => Promise<boolean>;
  refreshAlerts: () => Promise<void>;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [weatherRisk, setWeatherRisk] = useState<WeatherRisk | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const region = user?.region || 'UK';

  const fetchAlertsAndWeather = async () => {
    setIsLoading(true);
    try {
      // Fetch alerts
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const alertsRes = await fetch(`/api/alerts?region=${region}`, { headers });
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }

      // Fetch Weather & Insect Activity Risk
      const weatherRes = await fetch(`/api/weather/risk?region=${region}`);
      if (weatherRes.ok) {
        const data = await weatherRes.json();
        setWeatherRisk(data.risk);
      }
    } catch (err) {
      console.warn('Alerts fetch warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAlertsAndWeather();
  }, [user?.region, token]);

  const markAsRead = async (id: string) => {
    if (!token) {
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
      return;
    }
    try {
      await fetch(`/api/alerts/${id}/read`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setAlerts((prev) => prev.map((a) => (a._id === id ? { ...a, read: true } : a)));
    } catch (err) {
      console.warn('Failed to mark alert as read:', err);
    }
  };

  const requestPushNotifications = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      return false;
    }
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      if (token && 'serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          const sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: 'BEl62iUYgUivxIkv69yViEuiBIa_mock_vapid_key_public',
          });
          await fetch('/api/alerts/push-subscribe', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ subscription: sub }),
          });
        } catch (e) {
          // ignore VAPID key mismatch in simulated environments
        }
      }
      return true;
    }
    return false;
  };

  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <AlertContext.Provider
      value={{
        alerts,
        unreadCount,
        weatherRisk,
        isLoading,
        markAsRead,
        requestPushNotifications,
        refreshAlerts: fetchAlertsAndWeather,
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

export const useAlerts = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlerts must be used within an AlertProvider');
  }
  return context;
};
