import { BookCard } from "@/components/book-card";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SoundManager } from "@/lib/sounds";
import { Book, supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from "react-native";

export default function LibraryScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "unread" | "reading" | "read" | "borrowed"
  >("all");
  const { colors } = useTheme();

  const fetchBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBooks(data || []);
      filterBooks(data || [], selectedFilter, searchQuery);
    } catch (error) {
      console.error("Error fetching books:", error);
      Alert.alert(
        "Error",
        error instanceof Error ? error.message : "Failed to fetch books"
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchBooks();
    }, [])
  );

  const filterBooks = (
    booksToFilter: Book[],
    filter: string,
    query: string
  ) => {
    let filtered = booksToFilter;

    if (filter !== "all") {
      filtered = filtered.filter((book) => book.status === filter);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (book) =>
          book.title?.toLowerCase().includes(lowerQuery) ||
          book.author?.toLowerCase().includes(lowerQuery) ||
          book.genre?.some((g) => g.toLowerCase().includes(lowerQuery))
      );
    }

    setFilteredBooks(filtered);
  };

  const handleFilterChange = (filter: typeof selectedFilter) => {
    SoundManager.playHaptic("light");
    setSelectedFilter(filter);
    filterBooks(books, filter, searchQuery);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    filterBooks(books, selectedFilter, query);
  };

  const stats = {
    total: books.length,
    unread: books.filter((b) => b.status === "unread").length,
    reading: books.filter((b) => b.status === "reading").length,
    read: books.filter((b) => b.status === "read").length,
    borrowed: books.filter((b) => b.status === "borrowed").length,
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>
          📚 My Library
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {stats.total} {stats.total === 1 ? "book" : "books"} • {stats.read}{" "}
          read • {stats.unread} to go
        </ThemedText>

        {/* Active Books Counter */}
        {stats.reading > 0 && (
          <Pressable
            style={[styles.activeCounter, { backgroundColor: colors.primary }]}
            onPress={() => handleFilterChange("reading")}
            android_ripple={{
              color: "rgba(255, 255, 255, 0.3)",
              borderless: false,
            }}
          >
            <ThemedText style={styles.activeCounterText}>
              📖 {stats.reading} {stats.reading === 1 ? "book" : "books"} in
              progress
            </ThemedText>
          </Pressable>
        )}
      </ThemedView>

      {/* Search Bar */}
      <ThemedView
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 4 },
            elevation: 8,
          },
        ]}
      >
        <IconSymbol
          name="magnifyingglass"
          size={20}
          color={colors.text}
          style={{ opacity: 0.5 }}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search books, authors, genres..."
          placeholderTextColor={colors.text + "80"}
          value={searchQuery}
          onChangeText={handleSearch}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => handleSearch("")}>
            <IconSymbol
              name="xmark.circle.fill"
              size={20}
              color={colors.text}
              style={{ opacity: 0.3 }}
            />
          </TouchableOpacity>
        )}
      </ThemedView>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={{ paddingHorizontal: 20 }}
      >
        {[
          { key: "all", label: "All", count: stats.total, emoji: "📖" },
          { key: "unread", label: "TBR", count: stats.unread, emoji: "📚" },
          {
            key: "reading",
            label: "Reading",
            count: stats.reading,
            emoji: "👀",
          },
          { key: "read", label: "Read", count: stats.read, emoji: "✅" },
          {
            key: "borrowed",
            label: "Lent",
            count: stats.borrowed,
            emoji: "🤝",
          },
        ].map((filter) => (
          <Pressable
            key={filter.key}
            onPress={() =>
              handleFilterChange(filter.key as typeof selectedFilter)
            }
            android_ripple={{
              color:
                selectedFilter === filter.key
                  ? "rgba(255, 255, 255, 0.3)"
                  : colors.primary + "20",
              borderless: false,
            }}
            style={[
              styles.filterButton,
              {
                backgroundColor:
                  selectedFilter === filter.key ? colors.primary : colors.card,
                shadowColor:
                  selectedFilter === filter.key ? colors.primary : colors.text,
                shadowOpacity: selectedFilter === filter.key ? 0.35 : 0.08,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 3 },
                elevation: selectedFilter === filter.key ? 6 : 2,
              },
            ]}
          >
            <ThemedText
              style={[
                styles.filterText,
                selectedFilter === filter.key && {
                  color: "#fff",
                  fontWeight: "700",
                },
              ]}
            >
              {filter.emoji} {filter.label} ({filter.count})
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      {/* Books List */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.booksContainer}
        refreshControl={
          <RefreshControl
            refreshing={loading}
            onRefresh={fetchBooks}
            tintColor={colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {filteredBooks.length === 0 ? (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyEmoji}>
              {searchQuery ? "🔍" : loading ? "⏳" : "📖"}
            </ThemedText>
            <ThemedText style={styles.emptyText}>
              {searchQuery
                ? "No books found"
                : loading
                ? "Loading your library..."
                : "No books yet"}
            </ThemedText>
            <ThemedText style={styles.emptySubtext}>
              {searchQuery
                ? "Try a different search term"
                : "Tap Scan to add your first book!"}
            </ThemedText>
          </ThemedView>
        ) : (
          filteredBooks.map((book) => (
            <BookCard key={book.id} book={book} onUpdate={fetchBooks} />
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
    marginTop: 6,
    fontWeight: "500",
    letterSpacing: 0.2,
  },
  activeCounter: {
    marginTop: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    overflow: "hidden",
  },
  activeCounterText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.2,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 20,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    letterSpacing: 0.2,
  },
  filterScroll: {
    maxHeight: 50,
    marginBottom: 20,
  },
  filterButton: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    marginRight: 14,
    overflow: "hidden",
  },
  filterText: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  scrollView: {
    flex: 1,
  },
  booksContainer: {
    padding: 20,
    paddingBottom: 120,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 100,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
    opacity: 0.8,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: -0.5,
  },
  emptySubtext: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    paddingHorizontal: 40,
    letterSpacing: 0.1,
  },
});
