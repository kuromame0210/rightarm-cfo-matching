'use client';

import { useEffect, useState } from 'react';
import { Toast } from './ui/Toast';

export default function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showOfflineToast, setShowOfflineToast] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineToast(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineToast(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-red-500 text-white text-center py-2 text-sm animate-pulse">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
            ネットワークに接続されていません
          </div>
        </div>
      )}
      
      {isOnline && (
        <div className="fixed bottom-4 right-4 z-40">
          <div className="bg-green-500 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1">
            <div className="w-2 h-2 bg-white rounded-full"></div>
            オンライン
          </div>
        </div>
      )}
      
      {showOfflineToast && (
        <Toast
          message="インターネット接続が切断されました"
          type="error"
          isVisible={showOfflineToast}
          onClose={() => setShowOfflineToast(false)}
        />
      )}
    </>
  );
}