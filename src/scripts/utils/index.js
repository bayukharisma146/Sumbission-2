// Cek ketersediaan Service Worker
export function isServiceWorkerAvailable() {
  return 'serviceWorker' in navigator;
}

// Register Service Worker
export async function registerServiceWorker() {
  if (!isServiceWorkerAvailable()) {
    console.warn('Service Worker API tidak didukung');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.bundle.js');
    console.info('Service worker berhasil terpasang:', registration);
  } catch (error) {
    console.error('Gagal memasang service worker:', error);
  }
}

// Fungsi sleep (delay)
export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Format tanggal menjadi bentuk terbaca
export function showFormattedDate(date, locale = 'en-US', options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  });
}

// Inisialisasi carousel (Tiny Slider)
export async function createCarousel(containerElement, options = {}) {
  const { tns } = await import('tiny-slider');
  return tns({
    container: containerElement,
    mouseDrag: true,
    swipeAngle: false,
    speed: 600,
    nav: true,
    navPosition: 'bottom',
    autoplay: false,
    controls: false,
    ...options,
  });
}

// Konversi file Blob ke base64
export function convertBlobToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

// Konversi base64 ke Blob
export function convertBase64ToBlob(base64Data, contentType = '', sliceSize = 512) {
  const byteCharacters = atob(base64Data);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = Array.from(slice, (char) => char.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
}

// Konversi base64 ke Uint8Array (umum dipakai untuk push notification)
export function convertBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; i++) {
    outputArray[i] = rawData.charCodeAt(i);
  }

  return outputArray;
}

// Fitur "Lewati ke konten utama"
export function setupSkipToContent(triggerElement, mainContent) {
  triggerElement.addEventListener('click', () => mainContent.focus());
}

// View Transition Helper
export function transitionHelper({ skipTransition = false, updateDOM }) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(() => undefined);

    return {
      ready: Promise.reject(new Error('View transitions tidak didukung')),
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  return document.startViewTransition(updateDOM);
}
