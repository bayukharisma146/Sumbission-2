// Import CSS
import '../styles/styles.css';
import '../styles/responsives.css';
import 'tiny-slider/dist/tiny-slider.css';
import 'leaflet/dist/leaflet.css';

// Import komponen dan utilitas
import App from './pages/app';
import Camera from './utils/camera';
import { registerServiceWorker } from './utils';

// API Class
class RuangKisahAPI {
  static async login(credentials) {
    try {
      const response = await fetch('YOUR_API_ENDPOINT/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Login Error:', error);
      throw error;
    }
  }
}

export default RuangKisahAPI;

// Inisialisasi aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.getElementById('main-content'),
    drawerButton: document.getElementById('drawer-button'),
    drawerNavigation: document.getElementById('navigation-drawer'),
    skipLinkButton: document.getElementById('skip-link'),
  });

  // Daftarkan Service Worker
  try {
    await registerServiceWorker();
    console.log('Berhasil mendaftarkan service worker.');
  } catch (error) {
    console.error('Gagal mendaftarkan Service Worker:', error);
  }

  // Render halaman awal
  try {
    await app.renderPage();
  } catch (error) {
    console.error('Gagal merender halaman:', error);
  }

  // Tangani perubahan hash (navigasi SPA)
  window.addEventListener('hashchange', async () => {
    try {
      await app.renderPage();
      Camera.stopAllStreams(); // Pastikan kamera dihentikan saat pindah halaman
    } catch (error) {
      console.error('Gagal merender saat hashchange:', error);
    }
  });
});
