// File: src/scripts/templates.js

import { showFormattedDate } from './utils';

export function generateLoaderTemplate() {
  return `
    <div class="loader"></div>
  `;
}

export function generateLoaderAbsoluteTemplate() {
  return `
    <div class="loader loader-absolute"></div>
  `;
}

// --- Navigasi Utama (Sudah disesuaikan) ---
export function generateMainNavigationListTemplate() {
  return `
    <li><a id="story-list-button" class="story-list-button" href="#/">LIST YOUR STORY</a></li>
        <li><a id="bookmark-button" class="bookmark-button" href="#/bookmark">BOOKMARK</a></li>
  `;
}

export function generateUnauthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="login-button" href="#/login">Login</a></li>
    <li><a id="register-button" href="#/register">Register</a></li>
  `;
}

export function generateAuthenticatedNavigationListTemplate() {
  return `
    <li id="push-notification-tools" class="push-notification-tools"></li>
    <li><a id="new-story-button" class="btn new-story-button" href="#/new">Buat Cerita <i class="fas fa-plus"></i></a></li>
    <li><a id="logout-button" class="logout-button" href="#/logout"><i class="fas fa-sign-out-alt"></i> Logout</a></li>
  `;
}

// --- Template untuk Daftar Cerita (Sudah disesuaikan) ---
export function generateReportsListEmptyTemplate(message = 'Saat ini, tidak ada cerita yang dapat ditampilkan.') {
  return `
    <div id="stories-list-empty" class="stories-list__empty">
      <h2>Tidak ada cerita yang tersedia</h2>
      <p>${message}</p>
    </div>
  `;
}

export function generateReportsListErrorTemplate(message) {
  return `
    <div id="stories-list-error" class="stories-list__error">
      <h2>Terjadi kesalahan pengambilan daftar cerita</h2>
      <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

// Template untuk Item Cerita di Daftar
export function generateReportItemTemplate({
  id,
  name,
  description,
  photoUrl,
  createdAt,
  lat,
  lon,
  showRemoveButton = false, // default false
}) {
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return 'Tidak ada deskripsi.';
    if (text.length <= maxLength) return text;
    return `${text.substring(0, maxLength)}...`;
  };
  const locationText = (typeof lat === 'number' && typeof lon === 'number') ? 'Lokasi disertakan' : '';
  const placeholderImage = 'images/placeholder-image.jpg';

  return `
    <div tabindex="0" class="story-item" data-storyid="${id}">
      <img 
        class="story-item__image" 
        src="${photoUrl || placeholderImage}" 
        alt="Gambar cerita oleh ${name || 'Pengguna'}"
        onerror="this.onerror=null;this.src='${placeholderImage}';"
      >
      <div class="story-item__body">
        <div class="story-item__main">
          <h2 class="story-item__title">${name || 'Pengguna Anonim'}</h2>
          <div class="story-item__more-info">
            <div class="story-item__createdat">
              <i class="fas fa-calendar-alt"></i> ${showFormattedDate(createdAt, 'id-ID')}
            </div>
            ${locationText ? `
            <div class="story-item__location-info">
              <i class="fas fa-map-marker-alt"></i> ${locationText}
            </div>` : ''}
          </div>
        </div>
        <div class="story-item__description">
          ${truncateDescription(description)}
        </div>
        <div class="story-item__more-info">
          <div class="story-item__author">
            Dibuat oleh: ${name || 'Pengguna Anonim'}
          </div>
        </div>
        ${showRemoveButton
          ? `<button class="remove-bookmark-button" data-id="${id}">Hapus Bookmark</button>`
          : ''
        }
        <a class="btn story-item__read-more" href="#/stories/${id}">
          Selengkapnya <i class="fas fa-arrow-right"></i>
        </a>
      </div>
    </div>
  `;
}

// --- Template untuk Detail Cerita ---
export function generateStoryDetailTemplate(story) {
  if (!story) {
    return generateStoryDetailErrorTemplate();
  }

  const {
    id,
    name = 'Pengguna Anonim',
    description = 'Tidak ada deskripsi yang diberikan untuk cerita ini.',
    photoUrl = 'images/placeholder-image.jpg',
    createdAt,
    lat,
    lon,
    locationName
  } = story;

  return `
    <article class="story-detail">
      <header class="story-detail__header">
        <div class="story-detail__meta">
          <h1 class="story-detail__title">${name}</h1>
          <div class="story-detail__info">
            <span class="story-detail__date">
              <i class="fas fa-calendar-alt"></i> 
              ${showFormattedDate(createdAt, 'id-ID')}
            </span>
            ${generateLocationBadge(lat, lon, locationName)}
          </div>
        </div>
      </header>

      <div class="story-detail__content">
        <div class="story-detail__media">
          <figure class="story-detail__figure">
            <img 
              src="${photoUrl}" 
              alt="Foto utama cerita oleh ${name}" 
              class="story-detail__main-image"
              onerror="this.onerror=null;this.src='images/placeholder-image.jpg';" 
            />
          </figure>
        </div>

        <div class="story-detail__text">
          <section class="story-detail__description">
            <h2 class="story-detail__section-title">
              <i class="fas fa-file-alt"></i> Deskripsi Cerita
            </h2>
            <div class="story-detail__description-content">
              ${formatDescription(description)}
            </div>
            <button id="bookmarkButton" data-id="${id}" aria-label="Tambahkan ke bookmark" class="btn btn-action" style="margin-top:16px;">
              🔖 Tambah Bookmark
            </button>
          </section>
          ${generateLocationSection(lat, lon)}
        </div>
      </div>

      <footer class="story-detail__footer" style="position: relative; z-index: 99;">
        <div class="story-detail__actions" style="position: relative; z-index: 100;">
          <a href="#/" class="btn btn-back" style="position: relative; z-index: 100;">
            <i class="fas fa-arrow-left"></i> Kembali ke Daftar
          </a>
          <div id="story-actions" class="story-detail__action-buttons" style="position: relative; z-index: 100;">
            <!-- Action buttons will be injected here -->
          </div>
        </div>
      </footer>
    </article>
  `;
}

// Helper functions
function formatDescription(description) {
  return description
    .split('\n')
    .map(paragraph => `<p>${paragraph}</p>`)
    .join('');
}

function generateLocationBadge(lat, lon, locationName = '') {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '';
  return `
    <span class="story-detail__location-badge">
      <i class="fas fa-map-marker-alt"></i> 
      ${locationName || 'Lokasi: ' + lat.toFixed(5) + ', ' + lon.toFixed(5)}
    </span>
  `;
}

function generateLocationSection(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') return '';
  return `
    <section class="story-detail__location">
      <h2 class="story-detail__section-title">
        <i class="fas fa-map-marked-alt"></i> Lokasi Cerita
      </h2>
      <div class="story-detail__map-container">
        <div id="story-map-detail" class="story-detail__map">
          Memuat peta...
        </div>
        <div class="story-detail__coordinates">
          <span class="coordinates-label">Koordinat:</span>
          <span class="coordinates-value">
            ${lat.toFixed(5)}, ${lon.toFixed(5)}
          </span>
        </div>
      </div>
    </section>
  `;
}

export function generateStoryDetailErrorTemplate(message) {
  return `
    <div id="story-detail-error" class="story-detail__error">
      <h2>Terjadi kesalahan pengambilan detail cerita</h2>
      <p>${message || 'Gunakan jaringan lain atau laporkan error ini.'}</p>
    </div>
  `;
}

export function generateCommentsListEmptyTemplate() {
  return ''; 
}

export function generateCommentsListErrorTemplate(message) {
  return '';
}

export function generateReportCommentItemTemplate({ photoUrlCommenter, nameCommenter, body }) {
  return ''; 
}

export function generateDamageLevelMinorTemplate() { return ''; }
export function generateDamageLevelModerateTemplate() { return ''; }
export function generateDamageLevelSevereTemplate() { return ''; }
export function generateDamageLevelBadge(damageLevel) { return ''; }

export function generateReportDetailImageTemplate(imageUrl = null, alt = '') {
  const defaultImage = 'images/placeholder-image.jpg';
  return `
    <img class="story-additional-image" src="${imageUrl || defaultImage}" alt="${alt || 'Gambar Tambahan'}" onerror="this.onerror=null;this.src='${defaultImage}';">
  `;
}

export function generateSubscribeButtonTemplate() {
  return `
    <button id="subscribe-button" class="btn subscribe-button">
      Subscribe <i class="fas fa-bell"></i>
    </button>
  `;
}

export function generateUnsubscribeButtonTemplate() {
  return `
    <button id="unsubscribe-button" class="btn unsubscribe-button">
      Unsubscribe <i class="fas fa-bell-slash"></i>
    </button>
  `;
}

export function generateSaveReportButtonTemplate() { 
  return `
    <button 
      id="story-detail-save" 
      class="btn btn-action"
      style="position: relative; z-index: 100;"
    >
      <i class="fas fa-bookmark"></i> Simpan Cerita
    </button>
  `;
}

export function generateRemoveReportButtonTemplate() { 
  return `
    <button 
      id="story-detail-remove" 
      class="btn btn-action btn-danger"
      style="position: relative; z-index: 100;
    >
      <i class="fas fa-trash"></i> Hapus Cerita
    </button>
  `;
}

const STORAGE_KEY = 'BOOKMARKED_STORIES';

const BookmarkStorage = {
  getAllBookmarks() {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  },

  saveBookmark(story) {
    const bookmarks = this.getAllBookmarks();
    if (!this.isBookmarked(story.id)) {
      bookmarks.push(story);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
    }
  },

  removeBookmark(storyId) {
    const bookmarks = this.getAllBookmarks();
    const filteredBookmarks = bookmarks.filter((story) => story.id !== storyId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredBookmarks));
  },

  isBookmarked(storyId) {
    const bookmarks = this.getAllBookmarks();
    return bookmarks.some((story) => story.id === storyId);
  },
};
