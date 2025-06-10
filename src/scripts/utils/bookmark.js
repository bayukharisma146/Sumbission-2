    const BOOKMARK_KEY = 'bookmarkedStories';

    const getBookmarks = () => {
    return JSON.parse(localStorage.getItem(BOOKMARK_KEY)) || [];
    };

    const saveBookmarks = (bookmarks) => {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(bookmarks));
    };

    const addBookmark = (story) => {
    const bookmarks = getBookmarks();
    const exists = bookmarks.some((item) => item.id === story.id);
    if (!exists) {
        bookmarks.push(story);
        saveBookmarks(bookmarks);
    }
    };

    const removeBookmark = (id) => {
    const bookmarks = getBookmarks().filter((item) => item.id !== id);
    saveBookmarks(bookmarks);
    };

    export default {
    getBookmarks,
    addBookmark,
    removeBookmark,
    };
