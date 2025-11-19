import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { SoundManager } from "@/lib/sounds";
import { Book, Genre, supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { Image } from "expo-image";
import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export default function WheelScreen() {
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedBooks, setSelectedBooks] = useState<Book[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [includeMode, setIncludeMode] = useState(true); // true = include, false = exclude
  const [spinning, setSpinning] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const { colors } = useTheme();

  useEffect(() => {
    fetchGenres();
    fetchUnreadBooks();
  }, []);

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name");

      if (error) throw error;
      setGenres(data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  const fetchUnreadBooks = async () => {
    try {
      const { data, error } = await supabase
        .from("books")
        .select("*")
        .eq("status", "unread");

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error("Error fetching books:", error);
    }
  };

  const spinWheel = async () => {
    if (spinning) return;
    if (books.length === 0) {
      Alert.alert("No Books", "Add some unread books to your library first!");
      return;
    }

    setSpinning(true);
    SoundManager.playSound("wheel");

    // Spinning animation
    spinValue.setValue(0);
    Animated.sequence([
      Animated.timing(spinValue, {
        toValue: 8,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1.1,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(scaleValue, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      let selectedBooksResult: Book[] = [];

      if (selectedGenres.length > 0) {
        // Use the Supabase function for genre filtering
        const { data, error } = await supabase.rpc("get_books_by_genre", {
          selected_genres: selectedGenres,
        });

        if (error) throw error;
        selectedBooksResult = data || [];
      } else {
        // Random selection without genre filter
        const shuffled = [...books].sort(() => Math.random() - 0.5);
        selectedBooksResult = shuffled.slice(0, 3);
      }

      // Wait for animation
      setTimeout(() => {
        if (selectedBooksResult.length === 0) {
          Alert.alert(
            "No Matches",
            "No books found with the selected genres. Try different filters!"
          );
        } else {
          SoundManager.playHaptic("success");
        }
        setSelectedBooks(selectedBooksResult);
        setSpinning(false);
      }, 2000);
    } catch (error) {
      console.error("Error spinning wheel:", error);
      Alert.alert("Error", "Failed to spin the wheel");
      setSpinning(false);
    }
  };

  const toggleGenre = (genreName: string) => {
    SoundManager.playHaptic("light");
    setSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const filterText =
    selectedGenres.length > 0
      ? `${includeMode ? "Including" : "Excluding"}: ${selectedGenres.join(
          ", "
        )}`
      : "All genres";

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            ✨ Pick Your Next Read
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            {books.length} unread {books.length === 1 ? "book" : "books"} • Let
            fate decide!
          </ThemedText>
        </ThemedView>

        {/* Genre Filter Info */}
        <TouchableOpacity
          style={[
            styles.filterInfo,
            {
              backgroundColor: colors.card,
              shadowColor: colors.text,
              shadowOpacity: 0.05,
              shadowRadius: 10,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            },
          ]}
          onPress={() => {
            SoundManager.playHaptic("light");
            setShowFilters(!showFilters);
          }}
          activeOpacity={0.7}
        >
          <View style={styles.filterInfoContent}>
            <IconSymbol
              name="line.3.horizontal.decrease.circle.fill"
              size={22}
              color={colors.primary}
            />
            <ThemedText style={styles.filterText} numberOfLines={1}>
              {filterText}
            </ThemedText>
          </View>
          <IconSymbol
            name={
              showFilters
                ? "chevron.up.circle.fill"
                : "chevron.down.circle.fill"
            }
            size={22}
            color={colors.text}
            style={{ opacity: 0.3 }}
          />
        </TouchableOpacity>

        {/* Genre Filters */}
        {showFilters && (
          <ThemedView
            style={[styles.filtersContainer, { backgroundColor: colors.card }]}
          >
            <View style={styles.modeToggle}>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  includeMode && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  SoundManager.playHaptic("light");
                  setIncludeMode(true);
                }}
              >
                <ThemedText style={[includeMode && { color: "#fff" }]}>
                  Include
                </ThemedText>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.modeButton,
                  !includeMode && { backgroundColor: colors.primary },
                ]}
                onPress={() => {
                  SoundManager.playHaptic("light");
                  setIncludeMode(false);
                }}
              >
                <ThemedText style={[!includeMode && { color: "#fff" }]}>
                  Exclude
                </ThemedText>
              </TouchableOpacity>
            </View>

            <View style={styles.genresGrid}>
              {genres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[
                    styles.genreChip,
                    { backgroundColor: colors.background },
                    selectedGenres.includes(genre.name) && {
                      backgroundColor: includeMode ? colors.primary : "#ff3b30",
                    },
                  ]}
                  onPress={() => toggleGenre(genre.name)}
                >
                  <ThemedText
                    style={[
                      styles.genreChipText,
                      selectedGenres.includes(genre.name) && { color: "#fff" },
                    ]}
                  >
                    {genre.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => {
                SoundManager.playHaptic("light");
                setSelectedGenres([]);
              }}
            >
              <ThemedText style={{ color: colors.primary }}>
                Clear All
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        )}

        {/* Wheel Animation */}
        <View style={styles.wheelContainer}>
          <Animated.View
            style={[
              styles.wheel,
              {
                transform: [{ rotate: spin }, { scale: scaleValue }],
              },
            ]}
          >
            <View
              style={[
                styles.wheelInner,
                {
                  borderColor: colors.primary,
                  backgroundColor: colors.primary + "10",
                  shadowColor: colors.primary,
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  shadowOffset: { width: 0, height: 8 },
                  elevation: 8,
                  overflow: "hidden",
                },
              ]}
            >
              <ThemedText style={styles.wheelEmoji}>
                {spinning ? "🎰" : "📚"}
              </ThemedText>
            </View>
          </Animated.View>
        </View>

        {/* Spin Button */}
        <TouchableOpacity
          style={[
            styles.spinButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOpacity: spinning ? 0.1 : 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 4 },
              elevation: 6,
            },
            spinning && styles.spinButtonDisabled,
          ]}
          onPress={spinWheel}
          disabled={spinning}
          activeOpacity={0.8}
        >
          <ThemedText style={styles.spinButtonText}>
            {spinning ? "🎡 Spinning..." : "✨ Spin the Wheel!"}
          </ThemedText>
        </TouchableOpacity>

        {/* Selected Books */}
        {selectedBooks.length > 0 && !spinning && (
          <ThemedView style={styles.resultsContainer}>
            <ThemedText style={styles.resultsTitle}>
              ✨ Your Top Picks:
            </ThemedText>
            {selectedBooks.map((book, index) => (
              <View
                key={book.id}
                style={[styles.bookCard, { backgroundColor: colors.card }]}
              >
                <View style={styles.bookNumber}>
                  <ThemedText style={styles.bookNumberText}>
                    {index + 1}
                  </ThemedText>
                </View>
                <View style={styles.bookContent}>
                  {book.cover_url && (
                    <Image
                      source={{ uri: book.cover_url }}
                      style={styles.bookCover}
                      contentFit="cover"
                    />
                  )}
                  <View style={styles.bookInfo}>
                    <ThemedText style={styles.bookTitle} numberOfLines={2}>
                      {book.title}
                    </ThemedText>
                    <ThemedText style={styles.bookAuthor} numberOfLines={1}>
                      {book.author}
                    </ThemedText>
                    {book.genre && book.genre.length > 0 && (
                      <View style={styles.bookGenres}>
                        {book.genre.slice(0, 2).map((g, i) => (
                          <View
                            key={i}
                            style={[
                              styles.bookGenreTag,
                              { backgroundColor: colors.primary },
                            ]}
                          >
                            <ThemedText
                              style={[styles.bookGenreText, { color: "#fff" }]}
                            >
                              {g}
                            </ThemedText>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </ThemedView>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.6,
    marginTop: 4,
  },
  filterInfo: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  filterInfoContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  filterText: {
    fontSize: 14,
    flex: 1,
  },
  filtersContainer: {
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  modeToggle: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  modeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  genreChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
  clearButton: {
    marginTop: 16,
    padding: 14,
    alignItems: "center",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  wheel: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  wheelInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
    overflow: "hidden",
  },
  wheelEmoji: {
    fontSize: 60,
    textAlign: "center",
    lineHeight: 60,
  },
  spinButton: {
    marginHorizontal: 40,
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 32,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultsContainer: {
    marginHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 20,
  },
  bookCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  bookNumber: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#FFD700",
    justifyContent: "center",
    alignItems: "center",
  },
  bookNumberText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
  bookContent: {
    flexDirection: "row",
    gap: 12,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookInfo: {
    flex: 1,
    justifyContent: "center",
  },
  bookTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  bookGenres: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  bookGenreTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  bookGenreText: {
    fontSize: 10,
    fontWeight: "600",
  },
});
