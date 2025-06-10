import { convertBase64ToUint8Array } from './index';
import { VAPID_PUBLIC_KEY } from '../config';
import { subscribePushNotification, unsubscribePushNotification } from '../data/api';

export function isNotificationGranted() {
  return Notification.permission === 'granted';
}

export function isNotificationAvailable() {
  return 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window;
}

export async function requestNotificationPermission() {
  if (!isNotificationAvailable()) {
    console.error('Notification API unsupported.');
    return false;
  }

  if (isNotificationGranted()) {
    return true;
  }

  const status = await Notification.requestPermission();

  switch (status) {
    case 'granted':
      return true;
    case 'denied':
      alert('Izin notifikasi ditolak.');
      break;
    case 'default':
    default:
      alert('Izin notifikasi ditutup atau diabaikan.');
  }

  return false;
}

export async function getPushSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return await registration?.pushManager.getSubscription();
}

export async function isCurrentPushSubscriptionAvailable() {
  return !!(await getPushSubscription());
}

export function generateSubscribeOptions() {
  return {
    userVisibleOnly: true,
    applicationServerKey: convertBase64ToUint8Array(VAPID_PUBLIC_KEY),
  };
}

export async function subscribe() {
  const failureMessage = 'Langganan push notification gagal diaktifkan.';
  const successMessage = 'Langganan push notification berhasil diaktifkan.';

  if (!(await requestNotificationPermission())) return;

  if (await isCurrentPushSubscriptionAvailable()) {
    alert('Sudah berlangganan push notification.');
    return;
  }

  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) throw new Error('Service Worker belum terdaftar.');

    const pushSubscription = await registration.pushManager.subscribe(generateSubscribeOptions());

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await subscribePushNotification({ endpoint, keys });

    if (!response.ok) {
      console.error('subscribe: response:', response);
      await pushSubscription.unsubscribe(); // Rollback
      alert(failureMessage);
      return;
    }

    alert(successMessage);
  } catch (error) {
    console.error('subscribe: error:', error);
    alert(failureMessage);
  }
}

export async function unsubscribe() {
  const failureMessage = 'Langganan push notification gagal dinonaktifkan.';
  const successMessage = 'Langganan push notification berhasil dinonaktifkan.';

  try {
    const pushSubscription = await getPushSubscription();

    if (!pushSubscription) {
      alert('Tidak ada langganan push notification yang aktif.');
      return;
    }

    const { endpoint, keys } = pushSubscription.toJSON();
    const response = await unsubscribePushNotification({ endpoint });

    if (!response.ok) {
      console.error('unsubscribe: gagal unregister dari server:', response);
      alert(failureMessage);
      return;
    }

    const unsubscribed = await pushSubscription.unsubscribe();
    if (!unsubscribed) {
      alert(failureMessage);
      // Optional: rollback ke subscribe lagi
      await subscribePushNotification({ endpoint, keys });
      return;
    }

    alert(successMessage);
  } catch (error) {
    console.error('unsubscribe: error:', error);
    alert(failureMessage);
  }
}
