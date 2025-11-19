# 📚 Book Buddy Feature Roadmap

## Current Version: 1.0.0 (MVP Complete)

This roadmap outlines upcoming features and improvements for Book Buddy, balancing essential usability enhancements with fun, engaging features that will make managing your book collection even more delightful!

---

## 🎯 Priority Features (v1.1.0)

### ✅ Interactive Wheel Selections

**Status:** Planned  
**Priority:** High  
**Description:** When the TBR wheel presents your 3 book choices, you should be able to tap on a book card to immediately change its status (e.g., from "unread" to "reading").

**Implementation:**

- Add touchable interaction to wheel result cards
- Show quick status picker modal when tapping a wheel choice
- Update book status without leaving the wheel screen
- Haptic feedback and success animation
- Confetti effect when selecting "I'll read this one!" 🎉

**User Benefit:** Streamlines the workflow from discovery to action - no need to navigate to the library to update a book's status after the wheel helps you decide!

---

### 📊 Active Books Counter

**Status:** Planned  
**Priority:** High  
**Description:** Display a clear indicator at the top of the library showing how many books are currently active (reading status).

**Implementation:**

- Add "Currently Reading" counter to library header
- Visual indicator (e.g., "📖 3 books in progress")
- Make it tappable to quickly filter to reading status
- Consider adding a progress ring or badge

**User Benefit:** Quick overview of your current reading commitments helps prevent over-committing and provides motivation to finish ongoing reads!

---

### ✏️ Edit Book Details

**Status:** Planned  
**Priority:** High  
**Description:** Allow users to edit book information that may have been incorrectly fetched from the ISBN database, or add details that are missing.

**Implementation:**

- Add "Edit Details" button in book modal
- Editable fields:
  - Title
  - Author
  - Cover image URL (or upload custom image)
  - Genres (add/remove tags)
  - ISBN (in case it was entered wrong)
- Validation to prevent empty required fields
- Visual indicator that book details have been manually edited
- Option to "refresh from ISBN" to re-fetch original data

**User Benefit:** Fixes frustrating data inaccuracies and allows personalization for special editions, self-published books, or books with limited online data!

---

### 📚 Manual Book Entry (No ISBN Required)

**Status:** Planned  
**Priority:** High  
**Description:** Add books manually without requiring an ISBN - perfect for older books, self-published works, or books without barcodes.

**Implementation:**

- "Add Manually" button on scan screen
- Form with fields:
  - Title (required)
  - Author (required)
  - Genre (multi-select)
  - Cover image (optional - URL or photo)
  - ISBN (optional)
  - Notes/description
- Save directly to library without ISBN lookup
- Option to add ISBN later if found

**User Benefit:** No more being limited by ISBN availability! Add any book from any era or source to your collection!

---

### 🐛 Fix Genre Filter Bug

**Status:** Bug Fix  
**Priority:** High  
**Description:** Fix the wheel genre filter where include/exclude modes conflict and exclude mode doesn't work properly.

**Current Issue:**

- Can't switch between include and exclude modes cleanly
- Selected genres persist when switching modes
- Exclude mode doesn't filter books correctly
- Logic issues in the `get_books_by_genre` function

**Fix Implementation:**

- Clear genre selections when switching between include/exclude
- Fix Supabase function to handle exclude mode (currently only handles include)
- Add new function `get_books_excluding_genre` or update existing function
- Update UI to show clear distinction between modes
- Add visual feedback when no books match filter criteria
- Test edge cases (all genres excluded, mixed selections, etc.)

**User Benefit:** Genre filtering will work as expected, giving you full control over wheel recommendations!

---

## 🎨 Fun Features (v1.2.0)

### 🎲 Reading Challenges

**Status:** Planned  
**Priority:** Medium  
**Description:** Set and track reading goals to stay motivated!

**Features:**

- Monthly/yearly reading goals (e.g., "Read 24 books this year")
- Genre diversity challenges (e.g., "Read from 5 different genres")
- Page count challenges
- Reading streak tracking
- Achievement badges (e.g., "Speed Reader", "Genre Explorer", "Review Master")
- Visual progress bars and celebrations

**User Benefit:** Gamification makes reading more engaging and helps you achieve your literary goals!

---

### 📈 Reading Statistics

**Status:** Planned  
**Priority:** Medium  
**Description:** Beautiful visualizations of your reading habits and history.

**Features:**

- Books read per month/year (bar charts)
- Favorite genres (pie chart)
- Average rating over time
- Longest reading streak
- Total pages read
- Books per month trend line
- Top authors
- Reading pace analysis
- Export stats as shareable images

**User Benefit:** Gain insights into your reading patterns and share your accomplishments with friends!

---

### 🎭 Book Series Tracking

**Status:** Planned  
**Priority:** Medium  
**Description:** Group and track book series to keep series organized.

**Features:**

- Link books together as part of a series
- Display series name and book number
- Series completion progress
- "Next in series" recommendations
- Sort/filter by series
- Series cover view (gallery of all covers)

**User Benefit:** Never lose track of which book comes next in your favorite series!

---

### 🌟 Custom Book Collections

**Status:** Planned  
**Priority:** Medium  
**Description:** Create custom collections beyond status (e.g., "Summer Reading", "Book Club", "Favorites").

**Features:**

- Create unlimited custom collections
- Add books to multiple collections
- Collection-specific wheels (spin from a collection)
- Share collection lists
- Collection cover collages
- Color-coded collections

**User Benefit:** Organize books the way YOU want to, not just by reading status!

---

### 🎵 Reading Moods & Tags

**Status:** Planned  
**Priority:** Low  
**Description:** Tag books with moods and themes for better discovery.

**Features:**

- Predefined mood tags: Cozy, Dark, Uplifting, Thrilling, etc.
- Custom tags
- Filter wheel by mood
- "I'm in the mood for..." quick filter
- Tag-based recommendations

**User Benefit:** Pick books that match your current emotional state!

---

### 👥 Multi-User Support & Authentication

**Status:** Planned  
**Priority:** High (moved up from Social Features)  
**Description:** Add user accounts so the whole family can use Book Buddy with separate libraries!

**Phase 1 - Foundation:**

- Supabase authentication (email/password, Google, Apple)
- User profiles (name, avatar, reading preferences)
- Migrate existing books to primary user account
- Per-user book libraries (each user has their own collection)
- User switcher in settings
- Data isolation between users

**Phase 2 - Family Sharing:**

- Family/household groups
- Shared "family library" view (see all books in household)
- "Who's reading what?" family dashboard
- Book borrowing between family members
- Family reading challenges
- Prevent duplicate purchases (see if someone else owns it)

**Phase 3 - Social Features (Future):**

- Share book reviews publicly
- See what friends are reading
- Recommend books to friends
- Reading clubs/groups
- Comment on reviews
- Like and bookmark reviews

**Migration Plan:**

- Current database has all books without user association
- Create migration script to assign existing books to primary user (your girlfriend)
- Add `user_id` column to books table with foreign key
- Update all queries to filter by authenticated user
- Maintain backward compatibility during migration

**User Benefit:** Everyone in the family can track their own reading journey while still sharing and coordinating book purchases! No more confusion about whose book is whose!

---

### 📸 Custom Book Covers

**Status:** Planned  
**Priority:** Low  
**Description:** Upload or take photos of your physical books.

**Features:**

- Upload custom cover images
- Take photo with camera
- Edit/crop images
- Default cover generator with title/author text
- Cover quality indicator

**User Benefit:** Personalize rare books or special editions with unique covers!

---

### 🔔 Smart Reminders

**Status:** Planned  
**Priority:** Low  
**Description:** Gentle nudges to keep you reading.

**Features:**

- "Time to read" notifications (customizable times)
- "You've been reading X for 2 weeks" check-ins
- "Don't forget to return X to [friend]" borrowed book reminders
- Reading goal progress notifications
- New book release alerts (for tracked authors)

**User Benefit:** Stay on track with your reading habits!

---

### 🎨 Theme Customization

**Status:** Planned  
**Priority:** Low  
**Description:** Customize the app's appearance beyond dark/light mode.

**Features:**

- Custom accent colors
- Font size options
- Cover display styles (grid vs list)
- Animated backgrounds
- Seasonal themes
- Accessibility options (high contrast, dyslexia-friendly fonts)

**User Benefit:** Make the app truly yours with personalized styling!

---

### 📱 Widget Support

**Status:** Planned  
**Priority:** Low  
**Description:** Home screen widgets for quick access.

**Features:**

- Currently reading widget
- Random TBR suggestion widget
- Reading goal progress widget
- Quick scan button widget
- Library stats widget

**User Benefit:** Stay connected to your reading life without opening the app!

---

### 🌐 Goodreads Integration

**Status:** Planned  
**Priority:** Low  
**Description:** Import and sync with Goodreads.

**Features:**

- One-time import from Goodreads
- Sync reviews and ratings
- Import "Want to Read" as TBR
- Export library to Goodreads

**User Benefit:** No need to maintain two separate reading lists!

---

### 📝 Reading Notes

**Status:** Planned  
**Priority:** Low  
**Description:** Take notes while reading.

**Features:**

- Chapter-by-chapter notes
- Favorite quotes
- Highlight important passages
- Page number references
- Rich text formatting
- Search within notes

**User Benefit:** Remember key moments and insights from your books!

---

### 🎯 Smart Recommendations

**Status:** Planned  
**Priority:** Low  
**Description:** AI-powered book suggestions based on your library.

**Features:**

- "Books like [X]" suggestions
- "Based on your 5-star reads" recommendations
- Genre exploration suggestions
- Fill gaps in series
- "Popular with readers like you"

**User Benefit:** Never run out of great books to read!

---

### 🏆 Achievements & Milestones

**Status:** Planned  
**Priority:** Low  
**Description:** Celebrate your reading accomplishments!

**Achievements:**

- 📚 First Book Added
- 🎉 10 Books Read
- ⭐ First 5-Star Review
- 🎡 First Wheel Spin
- 📖 Week-long Reading Streak
- 🌈 Genre Explorer (read 10 different genres)
- 📝 Review Master (write 25 reviews)
- 🚀 Speed Reader (read 50 books in a year)
- 🤝 Sharing is Caring (lend 5 books)

**User Benefit:** Extra motivation and celebration of your reading journey!

---

## 🛠️ Technical Improvements

### Performance & UX

- [ ] Offline support with local caching
- [ ] Image optimization and lazy loading
- [ ] Pull-to-refresh animations
- [ ] Skeleton loading states
- [ ] Error boundary improvements
- [ ] App startup optimization

### Data & Backend

- [ ] User authentication (Supabase Auth)
- [ ] Cloud backup & sync
- [ ] Data export (CSV, JSON)
- [ ] Migration tools for database updates
- [ ] Analytics integration

### Code Quality

- [ ] Unit test coverage
- [ ] E2E testing
- [ ] TypeScript strict mode
- [ ] Performance monitoring
- [ ] Accessibility improvements
- [ ] Internationalization (i18n)

---

## 🗓️ Release Timeline

### v1.1.0 - Essential Fixes & Enhancements (Target: 1-2 months)

- 🐛 Fix genre filter include/exclude bug
- ✅ Interactive wheel selections
- 📊 Active books counter
- ✏️ Edit book details
- 📚 Manual book entry (no ISBN required)

### v1.2.0 - Multi-User Support (Target: 2-3 months)

- 👥 User authentication (Supabase Auth)
- 👤 User profiles
- 📚 Per-user libraries
- 🔄 Data migration for existing books
- 👨‍👩‍👧‍👦 Family sharing basics

### v1.3.0 - Fun & Engagement (Target: 4-5 months)

- 🏆 Reading challenges
- 📈 Statistics dashboard
- 📚 Series tracking
- 🎨 Custom collections
- 👨‍👩‍👧‍👦 Advanced family features

### v1.4.0 - Social & Advanced (Target: 6-7 months)

- 🌐 Goodreads integration
- 📝 Reading notes
- 🔔 Smart reminders
- 🎭 Reading moods & tags

### v2.0.0 - Premium Experience (Target: 8-12 months)

- 🎯 AI recommendations
- 📱 Advanced widgets
- 🎨 Theme customization
- 💾 Full offline support
- 🌍 Public social features

---

## 💡 Community Ideas

Have a feature idea? We'd love to hear it! Consider:

- What problem does it solve?
- How would it make the app more fun or useful?
- Would it work well with existing features?

Remember: The best features are ones that make reading more enjoyable while staying true to Book Buddy's simple, delightful design philosophy! 📚✨

---

## 📊 Success Metrics

We'll measure success by:

- User engagement (daily active users)
- Books scanned per user
- Wheel spins per week
- Review completion rate
- User retention
- App store ratings
- Feature usage analytics

---

**Last Updated:** November 19, 2025  
**Next Review:** December 2025

---

_Made with ❤️ for book lovers everywhere!_
