// File: src/scripts/pages/story-detail/story-detail-page.js

import { parseActivePathname } from '../../routes/url-parser';
import StoryDetailPresenter from './story-detail-presenter';
import * as StoryAPI from '../../data/api';

import {
  generateLoaderAbsoluteTemplate,
  generateStoryDetailTemplate,
  generateStoryDetailErrorTemplate,
} from '../../templates';

import Map from '../../utils/map';

export default class StoryDetailPage {
  #presenter;
  #storyId;
  #storyDetailContentElement;
  #loadingContainerElement;
  #mapInstance = null;

  async render() {
    return `
      <section class="container story-detail-page-container" aria-live="polite">
        <div id="story-detail-loading-container" class="loading-container-absolute"></div>
        <article id="story-detail-content" class="story-detail-content">
          <h2>Memuat Detail Cerita...</h2>
        </article>
      </section>
    `;
  }

  async afterRender() {
    this.#storyDetailContentElement = document.getElementById('story-detail-content');
    this.#loadingContainerElement = document.getElementById('story-detail-loading-container');

    if (!this.#storyDetailContentElement || !this.#loadingContainerElement) {
      console.error('Elemen DOM krusial (#story-detail-content atau #story-detail-loading-container) tidak ditemukan.');
      document.body.innerHTML = '<p>Error: Struktur halaman tidak lengkap.</p>';
      return;
    }

    const urlParts = parseActivePathname();
    this.#storyId = urlParts.id;

    if (!this.#storyId) {
      console.error('ID Cerita tidak ditemukan di URL untuk halaman detail.');
      this.displayError('Halaman tidak valid atau ID Cerita tidak ditemukan.');
      return;
    }

    console.log('StoryDetailPage afterRender - Mengambil detail untuk storyId:', this.#storyId);

    this.#presenter = new StoryDetailPresenter({
      view: this,
      model: StoryAPI,
      storyId: this.#storyId,
    });

    await this.#presenter.fetchStoryDetail();
  }

  displayStoryDetail(story) {
    if (!this.#storyDetailContentElement) return;

    this.#storyDetailContentElement.innerHTML = generateStoryDetailTemplate(story);

    // Tambahkan event listener bookmark setelah template dirender
    const bookmarkButton = document.getElementById('bookmarkButton');
    if (bookmarkButton) {
      bookmarkButton.addEventListener('click', async () => {
        try {
          const bookmarkData = {
            id: story.id,
            name: story.name,
            description: story.description,
            photoUrl: story.photoUrl,
            lat: story.lat,
            lon: story.lon,
          };
          const { default: BookmarkStorage } = await import('../../utils/bookmark');
          BookmarkStorage.addBookmark(bookmarkData);
          alert('✅ Cerita berhasil ditambahkan ke bookmark!');
        } catch (error) {
          console.error('Gagal menambahkan bookmark:', error);
          alert('❌ Gagal menambahkan bookmark.');
        }
      });
    }

    // Inisialisasi peta jika ada lat/lon
    if (
      typeof story.lat === 'number' &&
      typeof story.lon === 'number' &&
      typeof this._initializeMapForDetail === 'function'
    ) {
      if (this.#mapInstance && typeof this.#mapInstance.remove === 'function') {
        this.#mapInstance.remove();
      }
      this.#mapInstance = null;
      this._initializeMapForDetail(story.lat, story.lon, story.name);
    } else {
      const mapContainer = document.getElementById('story-map-detail');
      if (mapContainer) {
        mapContainer.innerHTML = '<p style="text-align:center; padding:10px;">Lokasi tidak tersedia untuk cerita ini.</p>';
      }
    }

    this.hideLoading();
  }

  displayError(message) {
    if (!this.#storyDetailContentElement) return;
    this.#storyDetailContentElement.innerHTML = generateStoryDetailErrorTemplate(
      message || 'Gagal memuat detail cerita. Silakan coba lagi nanti.'
    );
    this.hideLoading();
  }

  showLoading() {
    if (!this.#loadingContainerElement || !this.#storyDetailContentElement) return;
    this.#loadingContainerElement.innerHTML = generateLoaderAbsoluteTemplate();
    this.#loadingContainerElement.style.display = 'block';
    this.#storyDetailContentElement.innerHTML = '';
  }

  hideLoading() {
    if (!this.#loadingContainerElement) return;
    this.#loadingContainerElement.innerHTML = '';
    this.#loadingContainerElement.style.display = 'none';
  }

  async _initializeMapForDetail(lat, lon, storyCreatorName = 'Lokasi Cerita') {
    const mapContainer = document.getElementById('story-map-detail');

    if (mapContainer) {
      mapContainer.innerHTML = '';
      try {
        this.#mapInstance = await Map.build('#story-map-detail', {
          center: [lat, lon],
          zoom: 16,
        });

        if (this.#mapInstance) {
          const markerOptions = { title: storyCreatorName };
          const popupOptions = { content: `<strong>${storyCreatorName}</strong><br>Lokasi cerita.` };
          this.#mapInstance.addMarker([lat, lon], markerOptions, popupOptions);
        } else {
          throw new Error('Map.build tidak mengembalikan instance peta.');
        }
      } catch (error) {
        console.error('Gagal menginisialisasi peta di halaman detail:', error);
        mapContainer.innerHTML =
          '<p class="error-message" style="text-align:center; padding:20px;">Peta tidak dapat dimuat.</p>';
      }
    } else {
      console.warn('Kontainer peta dengan ID "story-map-detail" tidak ditemukan di DOM.');
    }
  }
}