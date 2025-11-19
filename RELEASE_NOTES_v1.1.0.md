# 📚 Book Buddy v1.1.0 Release Notes

**Release Date:** November 19, 2025

## 🎉 What's New

We're excited to announce Book Buddy v1.1.0, packed with highly requested features that make managing your book collection even better! This release focuses on essential usability improvements and fixes that enhance your daily reading experience.

---

## ✨ New Features

### 1. Interactive Wheel Selections

The TBR Wheel just got way more powerful! Now you can tap any book card in your wheel results to instantly change its status.

**How it works:**

- After spinning the wheel, tap any of the 3 book cards
- Beautiful modal appears with quick actions
- Choose: "I'll read this one!" (📖), "Keep it TBR" (📚), or "Already Read" (✅)
- Haptic feedback confirms your action
- Special celebration when you start reading! 🎉

**Why you'll love it:**
No more navigating to the library to update a book's status after the wheel helps you decide. Everything happens right where you need it!

---

### 2. Active Books Counter

Your library now shows exactly how many books you're currently reading, right at the top!

**Features:**

- Prominent counter with eye-catching design
- Shows "📖 X books in progress"
- Tap the counter to instantly filter to reading books
- Only appears when you have active reads

**Why you'll love it:**
Quick overview of your reading commitments helps you stay on track and prevents over-committing to too many books at once!

---

### 3. Edit Book Details

Finally! You can now edit any book's information directly in the app.

**What you can edit:**

- ✏️ Title
- ✏️ Author
- 🖼️ Cover image URL
- 🔢 ISBN
- 🏷️ Genres (add or remove with multi-select)

**How to use:**

1. Open any book in your library
2. Tap "Edit Book Details" button
3. Make your changes
4. Save or cancel to discard

**Why you'll love it:**
Fixes those frustrating data inaccuracies from ISBN lookups! Perfect for special editions, self-published books, or books with limited online data.

---

### 4. Manual Book Entry

Add any book to your library without an ISBN! Perfect for older books, self-published works, or books without barcodes.

**Required fields:**

- 📖 Title
- ✍️ Author

**Optional fields:**

- 🖼️ Cover image URL
- 🔢 ISBN (can add later if you find it)
- 🏷️ Genres (multi-select)

**How to access:**
Go to the Scan screen → Tap "📝 Add Book Manually (No ISBN Required)"

**Why you'll love it:**
No more being limited by ISBN availability! Add classics, rare books, self-published works, and more!

---

## 🐛 Bug Fixes

### Genre Filter Improvements

Fixed the wheel genre filtering system that was causing issues:

**What was fixed:**

- ✅ Selections now properly clear when switching between Include/Exclude modes
- ✅ Exclude mode now actually works (added new database function)
- ✅ Better visual feedback showing which mode is active
- ✅ Improved error messages when no books match filters

**Technical details:**

- Added new `get_books_excluding_genre()` Supabase function
- Color-coded chips (primary color for include, red for exclude)
- Proper state management for mode switching

---

## 🔧 Improvements

### User Experience

- Added "Tap to change status" hint on wheel result cards
- Improved modal layouts with better spacing and hierarchy
- Enhanced form validation with clearer error messages
- Unified genre selection interface across the app
- Better haptic feedback throughout

### Technical

- Added `get_books_excluding_genre()` SQL function to database
- Improved state management for edit modes
- Enhanced TypeScript types for better code safety
- Better error handling in fetch operations

---

## 📊 Database Updates Required

If you're upgrading from v1.0.0, run this SQL in your Supabase SQL editor:

```sql
-- Function to get random books excluding genres (exclude mode)
CREATE OR REPLACE FUNCTION get_books_excluding_genre(selected_genres TEXT[])
RETURNS SETOF books AS $$
  SELECT * FROM books
  WHERE NOT (genre && selected_genres) AND status = 'unread'
  ORDER BY RANDOM()
  LIMIT 3;
$$ LANGUAGE SQL STABLE;
```

---

## 🚀 Getting Started

### For New Users

1. Install Book Buddy v1.1.0
2. Set up your Supabase database with the schema from `supabase/schema.sql`
3. Add your first book by scanning or manual entry!

### For Existing Users

1. Update to v1.1.0
2. Run the database update SQL above
3. Enjoy the new features!

---

## 📱 Compatibility

- **React Native:** 0.81.4
- **Expo SDK:** 54
- **iOS:** 13.0+
- **Android:** 5.0+

---

## 🙏 Thank You!

This release brings the top 5 priority features from our roadmap to life! Special thanks to everyone who provided feedback and suggestions.

---

## 🔮 What's Next?

Coming in v1.2.0:

- 👥 Multi-User Support & Authentication
- 👨‍👩‍👧‍👦 Family library sharing
- 📚 Per-user book collections
- And more!

Check out the [ROADMAP.md](./ROADMAP.md) for the full feature plan.

---

## 📚 Resources

- **Documentation:** See [README.md](./README.md)
- **Roadmap:** See [ROADMAP.md](./ROADMAP.md)
- **Full Changelog:** See [CHANGELOG.md](./CHANGELOG.md)

---

**Made with ❤️ for book lovers everywhere!**

Happy Reading! 📖✨
