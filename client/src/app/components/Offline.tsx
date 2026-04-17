import React from 'react';
import { WifiOff, Home, RefreshCw } from 'lucide-react';

export const Offline: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-slate-900 px-4">
      <div className="max-w-md w-full text-center space-y-8 p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-700 animate-in fade-in zoom-in duration-500">
        <div className="flex justify-center">
          <div className="p-6 bg-indigo-50 dark:bg-indigo-900/30 rounded-full">
            <WifiOff className="w-16 h-16 text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>
        
        <div className="space-y-3">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">You're Offline</h1>
          <p className="text-gray-600 dark:text-slate-400">
            It looks like you've lost your internet connection. Don't worry, CityServe will be back once you're reconnected.
          </p>
        </div>

        <div className="pt-6 space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-semibold transition-all shadow-lg shadow-indigo-200 dark:shadow-none active:scale-95"
          >
            <RefreshCw className="w-5 h-5" />
            Try Again
          </button>
          
          <a 
            href="/"
            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 text-gray-900 dark:text-white rounded-2xl font-semibold transition-all active:scale-95"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </a>
        </div>

        <p className="text-xs text-gray-400 dark:text-slate-500 pt-4">
          Cached pages may still be available. Check your connection status.
        </p>
      </div>
    </div>
  );
};
