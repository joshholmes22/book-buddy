# Changelog

All notable changes to Book Buddy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-11-19

### Added - Priority Features ✨

#### Interactive Wheel Experience

- **Tappable Wheel Results**: Book cards in wheel results are now interactive - tap any book to quickly change its status
- **Quick Status Picker**: Beautiful modal with quick actions: "I'll read this one!", "Keep it TBR", or "Already Read"
- **Celebration Haptics**: Success haptic feedback when changing status from the wheel
- **Reading Celebration**: Special alert when marking a book as "reading" with confetti emoji 🎉

#### Library Enhancements

- **Active Books Counter**: Prominent counter at the top of the library showing how many books are currently being read
- **Tappable Counter**: Tap the active books counter to instantly filter to "Reading" status
- **Visual Prominence**: Eye-catching design with primary color and shadow effects

#### Book Management

- **Edit Book Details**: Full editing capability for any book in your library
  - Edit title, author, cover image URL, ISBN
  - Add or remove genres with multi-select interface
  - Visual indicator showing edit mode
  - Cancel button to discard changes
  - "Edit Book Details" button in book modal
- **Manual Book Entry**: Add books without scanning or ISBN lookup
  - Completely optional ISBN field
  - Required fields: Title and Author only
  - Optional cover image URL
  - Genre multi-select from available genres
  - Accessible via "Add Book Manually" button on scan screen
  - Perfect for older books, self-published works, or books without barcodes

### Fixed - Bug Fixes 🐛

#### Genre Filter Improvements

- **Mode Switching**: Selections now properly clear when switching between Include/Exclude modes
- **Exclude Mode**: Fixed Supabase function to properly handle genre exclusion
- **New Database Function**: Added `get_books_excluding_genre()` function for exclude mode
- **Better Feedback**: Improved alert messages showing which mode is active
- **Visual Clarity**: Color-coded chips (green for include, red for exclude)

### Changed - Improvements 🔧

#### User Experience

- **Wheel Cards**: Added "Tap to change status" hint text on book cards
- **Modal Layouts**: Improved spacing and visual hierarchy in modals
- **Form Validation**: Better error messages for required fields
- **Genre Selection**: Unified genre chip interface across the app

#### Technical

- **Database Schema**: Added `get_books_excluding_genre()` SQL function
- **State Management**: Improved state handling for edit modes
- **Type Safety**: Enhanced TypeScript types for manual entry forms

### Dependencies

- Added: expo-haptics notification feedback (already included in base SDK)

---

## [1.0.0] - 2025-10-10

### Added - MVP Release 🎉

#### Core Features

- **Barcode Scanning**: Scan book ISBNs using device camera
- **Manual ISBN Entry**: Add books by typing ISBN manually
- **Book Library**: Complete book management system
- **Search & Filter**: Search by title/author/genre, filter by status
- **Book Details**: Full modal view with editing capabilities
- **Status Tracking**: Unread, Reading, Read, Borrowed states
- **Rating System**: 1-5 star ratings for read books
- **Review System**: Write reviews for finished books
- **Borrowing Tracker**: Track who borrowed books and when
- **TBR Wheel**: Spin for 3 random book suggestions
- **Genre Filtering**: Include or exclude genres from wheel

#### User Experience

- **Haptic Feedback**: Satisfying tactile responses for all interactions
- **Dark Mode**: Automatic light/dark theme switching
- **Beautiful UI**: Warm, library-themed color palette
- **Smooth Animations**: React Native Reanimated powered
- **Loading States**: Clear loading indicators
- **Error Handling**: Helpful error messages
- **Empty States**: Informative empty state messages
- **Pull to Refresh**: Refresh library with pull gesture

#### Technical

- **Supabase Integration**: Complete database setup
- **TypeScript**: Full type safety
- **Expo Router**: File-based navigation
- **Open Library API**: Primary book data source
- **Google Books API**: Fallback book data source
- **Optimized Images**: Fast loading with expo-image
- **Database Functions**: Smart SQL functions for filtering
- **Auto Timestamps**: Automatic created/updated tracking
- **Row Level Security**: Ready for authentication

#### Documentation

- Complete README with quick start
- Detailed getting started guide
- User-friendly user guide
- Complete feature documentation
- Deployment checklist
- Troubleshooting guide
- Project summary
- Database schema files

### Schema

```sql
books table: id, isbn, title, author, cover_url, genre[],
            status, rating, review, borrowed_to,
            borrowed_at, returned_at, created_at, updated_at

genres table: id, name

get_books_by_genre(selected_genres[]) function
```

### Known Limitations

- No user authentication (single user only)
- Cannot edit book details after creation
- Requires internet connection (no offline mode)
- ISBNs required to add books
- No custom book cover upload

### Dependencies

- React Native 0.81.4
- Expo SDK 54
- Supabase JS 2.75.0
- TypeScript 5.9.2
- Expo Camera 17.0.8
- Expo Haptics 15.0.7
- React Native Reanimated 4.1.1

---

## [Unreleased]

### Planned Features

- [ ] User authentication
- [ ] Edit book details (title, author, cover)
- [ ] Manual book entry (without ISBN)
- [ ] Reading statistics dashboard
- [ ] Book recommendations
- [ ] Reading goals
- [ ] Series tracking
- [ ] Multiple bookshelves/collections
- [ ] Export/import library data
- [ ] Offline mode
- [ ] Custom book covers
- [ ] Social features
- [ ] Book notes and highlights
- [ ] Reading progress tracking
- [ ] Goodreads integration

### Possible Enhancements

- [ ] Sound effects (framework ready)
- [ ] More genre options
- [ ] Book wishlists
- [ ] Lending history
- [ ] Book location tracking (which shelf)
- [ ] Duplicate book detection improvements
- [ ] Bulk import
- [ ] Advanced search filters
- [ ] Sorting options
- [ ] Library statistics
- [ ] Annual reading challenges
- [ ] Book club features
- [ ] Share reviews
- [ ] QR code for sharing books

---

## Version History

- **1.0.0** (2025-10-10) - Initial MVP release

---

## How to Update This File

When adding a new version:

1. Add new version header: `## [X.X.X] - YYYY-MM-DD`
2. Group changes under:
   - `Added` - New features
   - `Changed` - Changes in existing functionality
   - `Deprecated` - Soon-to-be removed features
   - `Removed` - Removed features
   - `Fixed` - Bug fixes
   - `Security` - Security fixes
3. Move items from Unreleased to the new version
4. Update version in package.json
5. Tag the release in git

---

**Note**: This is the initial release! All features are new. Future updates will be logged here with proper change tracking.
