import BookmarkStorage from '../../data/bookmark-storage';
import { generateReportItemTemplate, generateReportsListEmptyTemplate } from '../../templates';

export default class BookmarkPage {
  async render() {
    return `
      <section class="container" style="background-color: #0E2148; color: #E3D095; padding: 2rem; border-radius: 12px;">
        <h1 class="section-title" style="color: #E3D095; text-align: center;">CERITA TERSIMPAN</h1>

        <div class="stories-list__container" style="background-color: #483AA0; padding: 1rem; border-radius: 8px;">
          <div id="bookmarks-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const bookmarks = BookmarkStorage.getAllBookmarks();

    // Tampilkan jika tidak ada bookmark
    if (!bookmarks || bookmarks.length === 0) {
      bookmarksContainer.innerHTML = generateReportsListEmptyTemplate(
        'Anda belum menyimpan cerita apapun.',
      );
      return;
    }

    // Susun bookmarks ke dalam baris per 3 kolom
    const rows = bookmarks.reduce((acc, story, index) => {
      const rowIndex = Math.floor(index / 3);

      if (!acc[rowIndex]) acc[rowIndex] = [];

      const storyHtml = generateReportItemTemplate({
        id: story.id,
        name: story.name,
        description: story.description,
        photoUrl: story.photoUrl,
        createdAt: story.createdAt,
        lat: story.lat,
        lon: story.lon,
        isBookmarked: true, // kalau template-nya pakai indikator bookmark
      });

      acc[rowIndex].push(storyHtml);
      return acc;
    }, []);

    // Gabungkan baris ke HTML grid
    const htmlContent = rows
      .map(
        (row) => `
        <div class="stories-row">
          ${row
            .map(
              (story) => `
            <div class="story-column">
              ${story}
            </div>
          `,
            )
            .join('')}
        </div>
      `,
      )
      .join('');

    bookmarksContainer.innerHTML = `
      <div class="stories-grid">
        ${htmlContent}
      </div>
    `;

    // Delegasi event untuk tombol hapus bookmark
    const storiesGrid = bookmarksContainer.querySelector('.stories-grid');
    storiesGrid.addEventListener('click', (event) => {
      const removeButton = event.target.closest('.remove-bookmark-button');

      if (removeButton) {
        event.preventDefault();
        const storyId = removeButton.dataset.id;
        const storyItem = event.target.closest('.story-column');

        // Hapus dari penyimpanan
        BookmarkStorage.removeBookmark(storyId);

        // Hapus dari DOM
        if (storyItem) {
          storyItem.remove();
        }

        // Tampilkan pesan jika kosong
        const remainingBookmarks = BookmarkStorage.getAllBookmarks();
        if (remainingBookmarks.length === 0) {
          bookmarksContainer.innerHTML = generateReportsListEmptyTemplate(
            'Anda belum menyimpan cerita apapun.',
          );
        }
      }
    });
  }
  
}
