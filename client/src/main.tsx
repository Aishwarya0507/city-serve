import { createRoot } from "react-dom/client";
import { ThemeProvider } from './app/context/ThemeContext';
import App from "./app/App.tsx";
import "./styles/index.css";
import "./app/lib/i18n";
import { registerSW } from 'virtual:pwa-register';

// Register service worker
registerSW({
  onNeedRefresh() {
    if (confirm('New content available. Reload?')) {
      window.location.reload();
    }
  },
  onOfflineReady() {
    console.log('App ready to work offline');
  },
});

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <App />
  </ThemeProvider>
);