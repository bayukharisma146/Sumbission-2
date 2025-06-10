// File: src/scripts/data/api.js

import { getAccessToken } from '../utils/auth';
import { BASE_URL } from '../config';

const ENDPOINTS = {
  // Auth
  REGISTER: `${BASE_URL}/register`,
  LOGIN: `${BASE_URL}/login`,

  // Stories
  STORIES: `${BASE_URL}/stories`,
  STORIES_GUEST: `${BASE_URL}/stories/guest`,
  STORY_DETAIL: (id) => `${BASE_URL}/stories/${id}`,

  // Notifications
  SUBSCRIBE_NOTIFICATIONS: `${BASE_URL}/notifications/subscribe`,
};

/**
 * Registers a new user.
 */
export async function registerUser({ name, email, password }) {
  const data = JSON.stringify({ name, email, password });

  const fetchResponse = await fetch(ENDPOINTS.REGISTER, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Logs in an existing user.
 */
export async function loginUser({ email, password }) {
  const data = JSON.stringify({ email, password });

  const fetchResponse = await fetch(ENDPOINTS.LOGIN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Fetches all stories.
 */
export async function getAllStories({ page, size, location } = {}) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const queryParams = new URLSearchParams();
  if (page !== undefined) queryParams.append('page', page);
  if (size !== undefined) queryParams.append('size', size);
  if (location !== undefined) queryParams.append('location', location);

  const url = `${ENDPOINTS.STORIES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const fetchResponse = await fetch(url, {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Fetches a single story by its ID.
 */
export async function getStoryById(id) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const fetchResponse = await fetch(ENDPOINTS.STORY_DETAIL(id), {
    method: 'GET',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Adds a new story with authentication.
 * Uses XHR for FormData uploads to debug file issues.
 */
export async function addNewStory(formData) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  console.log('--- MENGIRIM FormData KE addNewStory ---');
  for (let pair of formData.entries()) {
    console.log(`FormData Entry: ${pair[0]} =`, pair[1]);
    if (pair[1] instanceof File || pair[1] instanceof Blob) {
      console.log(
        `  (File Detail: name=${pair[1].name}, size=${pair[1].size}, type=${pair[1].type})`,
      );
    }
  }

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', ENDPOINTS.STORIES, true);
    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);

    xhr.onload = function () {
      let jsonResponse = {};
      try {
        jsonResponse = JSON.parse(xhr.responseText);
      } catch (e) {
        resolve({
          error: true,
          message: `Error: Invalid or non-JSON server response. Status: ${xhr.status}`,
          ok: false,
          status: xhr.status,
        });
        return;
      }

      resolve({
        ...jsonResponse,
        ok: xhr.status >= 200 && xhr.status < 300,
        status: xhr.status,
      });
    };

    xhr.onerror = function () {
      resolve({
        error: true,
        message: 'Network error or XHR failed.',
        ok: false,
        status: xhr.status,
      });
    };

    xhr.send(formData);
  });
}

/**
 * Adds a new story as a guest.
 */
export async function addNewStoryGuest(formData) {
  console.log('--- MENGIRIM FormData KE addNewStoryGuest ---');
  for (let pair of formData.entries()) {
    console.log(`FormData Entry: ${pair[0]} =`, pair[1]);
    if (pair[1] instanceof File || pair[1] instanceof Blob) {
      console.log(
        `  (File Detail: name=${pair[1].name}, size=${pair[1].size}, type=${pair[1].type})`,
      );
    }
  }

  const fetchResponse = await fetch(ENDPOINTS.STORIES_GUEST, {
    method: 'POST',
    body: formData,
  });

  let json;
  try {
    json = await fetchResponse.json();
  } catch (error) {
    const textResponse = await fetchResponse.text();
    return {
      error: true,
      message: `Unexpected response format. Status: ${fetchResponse.status}. Response: ${textResponse.substring(0, 200)}`,
      ok: false,
      status: fetchResponse.status,
    };
  }

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Subscribes to push notifications.
 */
export async function subscribePushNotification({ endpoint, keys }) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const data = JSON.stringify({
    endpoint,
    keys: {
      p256dh: keys.p256dh,
      auth: keys.auth,
    },
  });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}

/**
 * Unsubscribes from push notifications.
 */
export async function unsubscribePushNotification({ endpoint }) {
  const accessToken = getAccessToken();
  if (!accessToken) {
    return { error: true, message: 'Access token not found', ok: false, status: 401 };
  }

  const data = JSON.stringify({ endpoint });

  const fetchResponse = await fetch(ENDPOINTS.SUBSCRIBE_NOTIFICATIONS, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: data,
  });
  const json = await fetchResponse.json();

  return {
    ...json,
    ok: fetchResponse.ok,
    status: fetchResponse.status,
  };
}
