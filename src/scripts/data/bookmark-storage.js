import { openDB } from 'idb';

const DB_NAME = 'bookmark-db';
const STORE_NAME = 'bookmarks';

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    },
  });
}

const BookmarkStorage = {
  async getAllBookmarks() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
  },

  async saveBookmark(story) {
    const db = await getDB();
    await db.put(STORE_NAME, story);
  },

  async removeBookmark(storyId) {
    const db = await getDB();
    await db.delete(STORE_NAME, storyId);
  },

  async isBookmarked(storyId) {
    const db = await getDB();
    const story = await db.get(STORE_NAME, storyId);
    return !!story;
  },
};

export default BookmarkStorage;