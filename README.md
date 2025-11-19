# 📚 Book Buddy

A beautiful, modern React Native app for managing your personal book library with barcode scanning, reading tracking, and a fun TBR (To Be Read) wheel!

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)
![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **📷 Barcode Scanning**: Scan book barcodes to automatically fetch book details
- **📖 Library Management**: Track books as unread, reading, read, or borrowed
- **⭐ Reviews & Ratings**: Rate and review books you've read
- **🎡 TBR Wheel**: Spin the wheel to pick your next read from 3 random suggestions
- **🎯 Genre Filtering**: Filter the TBR wheel by including or excluding specific genres
- **🤝 Borrowing Tracking**: Keep track of books you've lent to friends
- **🎵 Haptic Feedback**: Satisfying haptic feedback for all interactions
- **🌗 Dark Mode**: Beautiful light and dark themes

## � Documentation

- **[Getting Started](GETTING_STARTED.md)** - Detailed setup instructions
- **[User Guide](USER_GUIDE.md)** - How to use the app (perfect for your girlfriend!)
- **[Features](FEATURES.md)** - Complete feature documentation
- **[Deployment](DEPLOYMENT.md)** - Build and deployment guide
- **[Troubleshooting](TROUBLESHOOTING.md)** - Common issues and solutions
- **[Project Summary](PROJECT_SUMMARY.md)** - Quick overview of everything

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd book-buddy
npm install
```

### 2. Configure Supabase

```bash
# Create environment file
cp .env.example .env

# Edit .env and add your Supabase credentials:
# EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. Set Up Database

Go to your Supabase SQL Editor and run:

1. `supabase/schema.sql` - Creates tables and functions
2. `supabase/populate-genres.sql` - Adds common genres

### 4. Run the App

```bash
npm start
```

Then:

- Press `i` for iOS Simulator
- Press `a` for Android Emulator
- Scan the QR code with Expo Go app on your phone

## 📱 Screenshots

The app includes three main screens:

1. **Library** - View, search, and filter your book collection
2. **Scan** - Scan barcodes or enter ISBNs to add books
3. **TBR Wheel** - Spin for your next book recommendation

## 🛠️ Tech Stack

- **React Native** with **Expo**
- **TypeScript** for type safety
- **Expo Router** for file-based navigation
- **Supabase** for backend and database
- **Expo Camera** for barcode scanning
- **Expo Image** for optimized image loading
- **Expo Haptics** for tactile feedback
- **React Native Reanimated** for smooth animations

## 📦 Database Schema

The app uses Supabase with the following structure:

```sql
books (
  id, isbn, title, author, cover_url,
  genre[], status, rating, review,
  borrowed_to, borrowed_at, returned_at,
  created_at, updated_at
)

genres (
  id, name
)

get_books_by_genre(selected_genres[])
  -- Returns 3 random unread books matching genres
```

## 🎯 MVP Requirements

✅ Scan books to get data  
✅ Mark books as read/unread/reading/borrowed  
✅ Add ratings and reviews  
✅ TBR wheel picks 3 books  
✅ Genre filtering (include/exclude)  
✅ Fun haptic feedback for interactions

## � Project Status

**Current Version**: 1.0.0 (MVP Complete)

This is a fully functional MVP ready for use! All core features are implemented and tested.

### What's Included ✅

- Complete barcode scanning system
- Full library management
- Rating and review system
- TBR wheel with genre filtering
- Borrowing tracking
- Beautiful UI with dark mode
- Haptic feedback
- Full documentation

### Future Enhancements 🔮

- User authentication
- Reading statistics
- Book recommendations
- Social features
- Custom book covers
- Series tracking
- Reading goals

## � License

MIT

## 💝 Credits

Made with love for book lovers everywhere! 📚✨

Perfect for personal use, book clubs, or anyone who wants to organize their reading life.

---

**Need Help?** Check out the [Troubleshooting Guide](TROUBLESHOOTING.md) or [Getting Started](GETTING_STARTED.md) documentation.
