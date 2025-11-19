// Fetch book data from Open Library API using ISBN
export async function fetchBookData(isbn: string) {
  try {
    // Clean ISBN (remove dashes and spaces)
    const cleanIsbn = isbn.replace(/[-\s]/g, "");

    // Try Open Library first
    const response = await fetch(
      `https://openlibrary.org/api/books?bibkeys=ISBN:${cleanIsbn}&format=json&jscmd=data`
    );
    const data = await response.json();

    const bookKey = `ISBN:${cleanIsbn}`;
    if (data[bookKey]) {
      const book = data[bookKey];

      return {
        title: book.title || null,
        author: book.authors?.[0]?.name || null,
        cover_url:
          book.cover?.large || book.cover?.medium || book.cover?.small || null,
        genre: book.subjects?.slice(0, 5).map((s: any) => s.name) || [],
      };
    }

    // Fallback to Google Books API
    const googleResponse = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=isbn:${cleanIsbn}`
    );
    const googleData = await googleResponse.json();

    if (googleData.items && googleData.items.length > 0) {
      const bookInfo = googleData.items[0].volumeInfo;

      return {
        title: bookInfo.title || null,
        author: bookInfo.authors?.[0] || null,
        cover_url:
          bookInfo.imageLinks?.thumbnail?.replace("http://", "https://") ||
          null,
        genre: bookInfo.categories || [],
      };
    }

    return null;
  } catch (error) {
    console.error("Error fetching book data:", error);
    return null;
  }
}
