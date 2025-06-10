import BookmarkStorage from '../../data/bookmark-storage';
import { generateReportItemTemplate, generateReportsListEmptyTemplate } from '../../templates';


export default class BookmarkPage {
  async render() {
    return `
      <section class="container" style="background-color: #0E2148; color: #E3D095; padding: 2rem; border-radius: 12px;">
        <h1 class="section-title" style="color: #E3D095; text-align: center;">BOOKMARK</h1>
        <div class="stories-list__container" style="background-color: #483AA0; padding: 1rem; border-radius: 8px;">
          <div id="bookmarks-container"></div>
        </div>
      </section>
    `;
  }

  async afterRender() {
    const bookmarksContainer = document.getElementById('bookmarks-container');
    const bookmarks = await BookmarkStorage.getAllBookmarks(); // pakai await

    if (!bookmarks || bookmarks.length === 0) {
      bookmarksContainer.innerHTML = generateReportsListEmptyTemplate(
        'Anda belum menyimpan cerita apapun.',
      );
      return;
    }

    // Susun bookmarks ke dalam grid
    const rows = bookmarks.reduce((acc, story, index) => {
      const rowIndex = Math.floor(index / 3);
      if (!acc[rowIndex]) acc[rowIndex] = [];
      acc[rowIndex].push(
        generateReportItemTemplate({
          id: story.id,
          name: story.name,
          description: story.description,
          photoUrl: story.photoUrl,
          createdAt: story.createdAt,
          lat: story.lat,
          lon: story.lon,
          showRemoveButton: true, // <--- tambahkan ini
        }),
      );
      return acc;
    }, []);

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

    // Setelah bookmarksContainer.innerHTML = ...;
    const storiesGrid = bookmarksContainer.querySelector('.stories-grid');
    if (storiesGrid) {
      storiesGrid.addEventListener('click', (event) => {
        const removeButton = event.target.closest('.remove-bookmark-button');
        if (removeButton) {
          event.preventDefault();
          const storyId = removeButton.dataset.id;
          BookmarkStorage.removeBookmark(storyId);
          // Hapus dari DOM
          const storyItem = removeButton.closest('.story-column');
          if (storyItem) storyItem.remove();
          // Jika kosong, tampilkan pesan
          if (BookmarkStorage.getAllBookmarks().length === 0) {
            bookmarksContainer.innerHTML = generateReportsListEmptyTemplate('Anda belum menyimpan cerita apapun.');
          }
        }
      });
    }
  }
}
