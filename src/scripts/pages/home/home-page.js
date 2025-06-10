import {
  generateLoaderAbsoluteTemplate,
  // Nama-nama template dikembalikan sesuai dengan yang ada di file templates.js Anda
  generateReportItemTemplate,
  generateReportsListEmptyTemplate,
  generateReportsListErrorTemplate,
} from '../../templates'; // Pastikan path ini benar
import HomePresenter from './home-presenter';
import Map from '../../utils/map'; // Utilitas Peta Anda
import * as StoryAPI from '../../data/api'; // Menggunakan alias yang lebih sesuai

export default class HomePage {
  #presenter = null;
  #map = null;

  async render() {
    // Menggunakan terminologi "Cerita"
    return `
      <section>
        <div class="stories-list__map__container">
          <div id="map" class="stories-list__map"></div>
          <div id="map-loading-container"></div>
        </div>
      </section>

      <section class="container" style="background-color: #0E2148; color: #E3D095; padding: 2rem; border-radius: 12px;">
  <h1 class="section-title" style="color: #E3D095; text-align: center;">LIST YOUR STORY</h1>

  <div class="stories-list__container" style="background-color: #483AA0; padding: 1rem; border-radius: 8px;">
    <div id="stories-list"></div> 
    <div id="stories-list-loading-container" style="margin-top: 1rem; text-align: center; color: #7965C1;"></div>
  </div>
</section>

    `;
  }

  async afterRender() {
    this.#presenter = new HomePresenter({
      view: this,
      model: StoryAPI,
    });

    await this.#presenter.initialGalleryAndMap();
  }

  populateStoriesList(stories) {
    const storiesListContainer = document.getElementById('stories-list');
    if (!storiesListContainer) {
      console.error('Element with ID "stories-list" not found.');
      return;
    }

    if (!stories || stories.length === 0) {
      this.populateStoriesListEmpty();
      return;
    }

    // Create row wrapper for every 3 stories
    const rows = stories.reduce((acc, story, index) => {
      const rowIndex = Math.floor(index / 3);
      
      if (!acc[rowIndex]) {
        acc[rowIndex] = [];
      }
      
      this.#addStoryMarkerToMap(story);
      
      const storyHtml = generateReportItemTemplate({
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
      });
      
      acc[rowIndex].push(storyHtml);
      return acc;
    }, []);

    // Convert rows array to HTML
    const htmlContent = rows.map(row => `
      <div class="stories-row">
        ${row.map(story => `
          <div class="story-column">
            ${story}
          </div>
        `).join('')}
      </div>
    `).join('');

    storiesListContainer.innerHTML = `
      <div class="stories-grid">
        ${htmlContent}
      </div>
    `;
  }

  /**
   * Adds a marker for the story to the map, if map is initialized and story has location data.
   * @param {Object} story - The story object containing location data.
   */
  #addStoryMarkerToMap(story) {
    if (this.#map && typeof story.lat === 'number' && typeof story.lon === 'number') {
      const coordinate = [story.lat, story.lon];
      const markerOptions = { alt: story.name || 'Story Location' };
      const popupContent = `
        <strong>${story.name || 'Pengguna'}</strong><br>
        ${story.description ? story.description.substring(0, 70) + (story.description.length > 70 ? '...' : '') : 'Tidak ada deskripsi.'}
        ${story.photoUrl ? `<br><img src="${story.photoUrl}" alt="Story image" style="width:100px; margin-top:5px;">` : ''}
      `;
      const popupOptions = { content: popupContent };
      this.#map.addMarker(coordinate, markerOptions, popupOptions);
    }
  }

  populateStoriesListEmpty() {
    const storiesListContainer = document.getElementById('stories-list');
    if (storiesListContainer) {
      // Menggunakan generateReportsListEmptyTemplate
      storiesListContainer.innerHTML = generateReportsListEmptyTemplate('Belum ada cerita yang tersedia.');
    }
  }

  populateStoriesListError(message) {
    const storiesListContainer = document.getElementById('stories-list');
    if (storiesListContainer) {
      // Menggunakan generateReportsListErrorTemplate
      storiesListContainer.innerHTML = generateReportsListErrorTemplate(message || 'Gagal memuat cerita.');
    }
  }

  async initialMap() {
    try {
      this.showMapLoading();
      this.#map = await Map.build('#map', {
        zoom: 8,
        locate: true,
      });
    } catch (error) {
      console.error('Failed to initialize map:', error);
      const mapContainer = document.getElementById('map');
      if (mapContainer) {
        mapContainer.innerHTML = '<p class="error-message">Peta tidak dapat dimuat.</p>';
      }
    } finally {
      this.hideMapLoading();
    }
  }

  showMapLoading() {
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideMapLoading() {
    const mapLoadingContainer = document.getElementById('map-loading-container');
    if (mapLoadingContainer) {
      mapLoadingContainer.innerHTML = '';
    }
  }

  showStoriesLoading() {
    const storiesListLoadingContainer = document.getElementById('stories-list-loading-container');
    if (storiesListLoadingContainer) {
      storiesListLoadingContainer.innerHTML = generateLoaderAbsoluteTemplate();
    }
  }

  hideStoriesLoading() {
    const storiesListLoadingContainer = document.getElementById('stories-list-loading-container');
    if (storiesListLoadingContainer) {
      storiesListLoadingContainer.innerHTML = '';
    }
  }
}