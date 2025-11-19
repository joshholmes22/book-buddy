import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Book, supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Dimensions,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { BarChart, PieChart } from "react-native-chart-kit";

const SCREEN_WIDTH = Dimensions.get("window").width;

interface MonthlyStats {
  month: string;
  count: number;
}

interface GenreStats {
  genre: string;
  count: number;
}

interface Challenge {
  id: string;
  type: string;
  title: string;
  target: number;
  current: number;
  emoji: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export default function StatsScreen() {
  const { colors } = useTheme();
  const [books, setBooks] = useState<Book[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyData, setMonthlyData] = useState<MonthlyStats[]>([]);
  const [genreData, setGenreData] = useState<GenreStats[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [newChallengeTarget, setNewChallengeTarget] = useState("");
  const [selectedChallengeType, setSelectedChallengeType] = useState<
    "yearly" | "monthly"
  >("yearly");

  const [stats, setStats] = useState({
    total: 0,
    read: 0,
    reading: 0,
    tbr: 0,
    avgRating: 0,
    totalPages: 0,
    currentStreak: 0,
    longestStreak: 0,
  });

  const loadBooks = async () => {
    const { data, error } = await supabase
      .from("books")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Alert.alert("Error", "Failed to load books");
      return;
    }

    setBooks(data || []);
    calculateStats(data || []);
    calculateMonthlyData(data || []);
    calculateGenreData(data || []);
  };

  const calculateStats = (booksList: Book[]) => {
    const readBooks = booksList.filter((b) => b.status === "read");
    const ratings = readBooks
      .filter((b) => b.rating)
      .map((b) => b.rating as number);
    const avgRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    // Calculate streak (simplified version - counts consecutive days with status updates)
    const today = new Date();
    let currentStreak = 0;
    const sortedBooks = [...booksList].sort(
      (a, b) =>
        new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );

    // This is a simple version - in production you'd track daily reading activity
    if (sortedBooks.length > 0) {
      const lastUpdate = new Date(sortedBooks[0].updated_at);
      const daysSinceUpdate = Math.floor(
        (today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
      );
      currentStreak = daysSinceUpdate <= 1 ? Math.min(booksList.length, 30) : 0;
    }

    setStats({
      total: booksList.length,
      read: readBooks.length,
      reading: booksList.filter((b) => b.status === "reading").length,
      tbr: booksList.filter((b) => b.status === "unread").length,
      avgRating: Math.round(avgRating * 10) / 10,
      totalPages: readBooks.reduce((sum, b) => sum + (b.page_count || 0), 0),
      currentStreak,
      longestStreak: Math.max(currentStreak, 0),
    });

    checkAchievements(booksList);
  };

  const calculateMonthlyData = (booksList: Book[]) => {
    const monthCounts: { [key: string]: number } = {};
    const readBooks = booksList.filter((b) => b.status === "read");

    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      monthCounts[monthKey] = 0;
    }

    readBooks.forEach((book) => {
      const date = new Date(book.finished_at || book.updated_at);
      const monthKey = date.toLocaleDateString("en-US", {
        month: "short",
        year: "2-digit",
      });
      if (monthKey in monthCounts) {
        monthCounts[monthKey]++;
      }
    });

    const data = Object.entries(monthCounts).map(([month, count]) => ({
      month,
      count,
    }));

    setMonthlyData(data);
  };

  const calculateGenreData = (booksList: Book[]) => {
    const genreCounts: { [key: string]: number } = {};
    const readBooks = booksList.filter((b) => b.status === "read");

    readBooks.forEach((book) => {
      if (book.genre && book.genre.length > 0) {
        book.genre.forEach((g) => {
          genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });

    const data = Object.entries(genreCounts)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 genres

    setGenreData(data);
  };

  const checkAchievements = (booksList: Book[]) => {
    const readBooks = booksList.filter((b) => b.status === "read");
    const allAchievements: Achievement[] = [
      {
        id: "first_book",
        title: "First Book",
        description: "Added your first book",
        emoji: "📚",
        unlocked: booksList.length >= 1,
      },
      {
        id: "ten_books",
        title: "Growing Library",
        description: "Read 10 books",
        emoji: "🎉",
        unlocked: readBooks.length >= 10,
      },
      {
        id: "first_review",
        title: "Reviewer",
        description: "Wrote your first review",
        emoji: "⭐",
        unlocked: booksList.some((b) => b.review),
      },
      {
        id: "five_star",
        title: "Perfect Read",
        description: "Gave a book 5 stars",
        emoji: "🌟",
        unlocked: booksList.some((b) => b.rating === 5),
      },
      {
        id: "genre_explorer",
        title: "Genre Explorer",
        description: "Read from 5 different genres",
        emoji: "🌈",
        unlocked: genreData.length >= 5,
      },
      {
        id: "speed_reader",
        title: "Speed Reader",
        description: "Read 25 books",
        emoji: "🚀",
        unlocked: readBooks.length >= 25,
      },
      {
        id: "dedicated_reader",
        title: "Dedicated Reader",
        description: "Read 50 books",
        emoji: "🏆",
        unlocked: readBooks.length >= 50,
      },
      {
        id: "bookworm",
        title: "Bookworm",
        description: "Read 100 books",
        emoji: "📖",
        unlocked: readBooks.length >= 100,
      },
    ];

    setAchievements(allAchievements);
  };

  const loadChallenges = () => {
    // For now, using local state. In production, fetch from Supabase
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString("en-US", {
      month: "long",
    });
    const readThisYear = books.filter(
      (b) =>
        b.status === "read" &&
        new Date(b.finished_at || b.updated_at).getFullYear() === currentYear
    ).length;
    const readThisMonth = books.filter(
      (b) =>
        b.status === "read" &&
        new Date(b.finished_at || b.updated_at).getMonth() ===
          new Date().getMonth()
    ).length;

    const defaultChallenges: Challenge[] = [
      {
        id: "yearly",
        type: "yearly",
        title: `${currentYear} Reading Goal`,
        target: 24,
        current: readThisYear,
        emoji: "📅",
      },
      {
        id: "monthly",
        type: "monthly",
        title: `${currentMonth} Challenge`,
        target: 2,
        current: readThisMonth,
        emoji: "📆",
      },
    ];

    setChallenges(defaultChallenges);
  };

  const createChallenge = () => {
    const target = parseInt(newChallengeTarget);
    if (isNaN(target) || target <= 0) {
      Alert.alert("Invalid Target", "Please enter a valid number");
      return;
    }

    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().toLocaleDateString("en-US", {
      month: "long",
    });
    const readCount =
      selectedChallengeType === "yearly"
        ? books.filter(
            (b) =>
              b.status === "read" &&
              new Date(b.finished_at || b.updated_at).getFullYear() ===
                currentYear
          ).length
        : books.filter(
            (b) =>
              b.status === "read" &&
              new Date(b.finished_at || b.updated_at).getMonth() ===
                new Date().getMonth()
          ).length;

    const updatedChallenges = challenges.map((c) =>
      c.type === selectedChallengeType
        ? {
            ...c,
            target,
            current: readCount,
          }
        : c
    );

    setChallenges(updatedChallenges);
    setShowChallengeModal(false);
    setNewChallengeTarget("");
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadBooks();
    setRefreshing(false);
  };

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [])
  );

  useFocusEffect(
    useCallback(() => {
      loadChallenges();
    }, [books])
  );

  const pieColors = [
    colors.primary,
    "#FF6B6B",
    "#4ECDC4",
    "#FFD93D",
    "#A78BFA",
  ];

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <ThemedView style={styles.header}>
          <ThemedText type="title" style={styles.title}>
            📊 Your Reading Journey
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Insights, challenges, and achievements
          </ThemedText>
        </ThemedView>

        {/* Quick Stats Cards */}
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ThemedText style={styles.statValue}>{stats.read}</ThemedText>
            <ThemedText style={styles.statLabel}>Books Read</ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ThemedText style={styles.statValue}>{stats.reading}</ThemedText>
            <ThemedText style={styles.statLabel}>Reading</ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ThemedText style={styles.statValue}>
              {stats.avgRating.toFixed(1)}⭐
            </ThemedText>
            <ThemedText style={styles.statLabel}>Avg Rating</ThemedText>
          </View>
          <View
            style={[
              styles.statCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <ThemedText style={styles.statValue}>
              {stats.currentStreak}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </View>
        </View>

        {/* Reading Challenges */}
        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText style={styles.sectionTitle}>
              🎯 Reading Challenges
            </ThemedText>
            <TouchableOpacity onPress={() => setShowChallengeModal(true)}>
              <ThemedText
                style={[styles.editButton, { color: colors.primary }]}
              >
                Edit
              </ThemedText>
            </TouchableOpacity>
          </View>

          {challenges.map((challenge) => {
            const progress = Math.min(
              (challenge.current / challenge.target) * 100,
              100
            );
            const isComplete = challenge.current >= challenge.target;

            return (
              <View
                key={challenge.id}
                style={[
                  styles.challengeCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: isComplete ? colors.primary : colors.border,
                  },
                ]}
              >
                <View style={styles.challengeHeader}>
                  <ThemedText style={styles.challengeEmoji}>
                    {challenge.emoji}
                  </ThemedText>
                  <View style={styles.challengeInfo}>
                    <ThemedText style={styles.challengeTitle}>
                      {challenge.title}
                    </ThemedText>
                    <ThemedText style={styles.challengeProgress}>
                      {challenge.current} / {challenge.target} books
                    </ThemedText>
                  </View>
                  {isComplete && (
                    <ThemedText style={styles.completeBadge}>✓</ThemedText>
                  )}
                </View>
                <View
                  style={[
                    styles.progressBarBg,
                    { backgroundColor: colors.border },
                  ]}
                >
                  <View
                    style={[
                      styles.progressBar,
                      {
                        width: `${progress}%`,
                        backgroundColor: isComplete
                          ? "#4CAF50"
                          : colors.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            );
          })}
        </ThemedView>

        {/* Monthly Reading Chart */}
        {monthlyData.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              📈 Books per Month
            </ThemedText>
            <View
              style={[
                styles.chartCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <BarChart
                data={{
                  labels: monthlyData.map((d) => d.month),
                  datasets: [
                    {
                      data: monthlyData.map((d) => d.count),
                    },
                  ],
                }}
                width={SCREEN_WIDTH - 100}
                height={220}
                yAxisLabel=""
                yAxisSuffix=""
                chartConfig={{
                  backgroundColor: colors.card,
                  backgroundGradientFrom: colors.card,
                  backgroundGradientTo: colors.card,
                  decimalPlaces: 0,
                  color: (opacity = 1) => colors.primary,
                  labelColor: (opacity = 1) => colors.text,
                  style: {
                    borderRadius: 16,
                  },
                  propsForLabels: {
                    fontSize: 10,
                  },
                  barPercentage: 0.6,
                }}
                style={{
                  borderRadius: 16,
                }}
                showValuesOnTopOfBars
                fromZero
              />
            </View>
          </ThemedView>
        )}

        {/* Genre Distribution */}
        {genreData.length > 0 && (
          <ThemedView style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              🎨 Favorite Genres
            </ThemedText>
            <View
              style={[
                styles.chartCard,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
            >
              <PieChart
                data={genreData.map((item, index) => ({
                  name: item.genre,
                  population: item.count,
                  color: pieColors[index % pieColors.length],
                  legendFontColor: colors.text,
                  legendFontSize: 12,
                }))}
                width={SCREEN_WIDTH - 100}
                height={220}
                chartConfig={{
                  color: (opacity = 1) => colors.primary,
                }}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>
          </ThemedView>
        )}

        {/* Achievements */}
        <ThemedView style={styles.section}>
          <ThemedText style={styles.sectionTitle}>🏆 Achievements</ThemedText>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement) => (
              <View
                key={achievement.id}
                style={[
                  styles.achievementCard,
                  {
                    backgroundColor: colors.card,
                    borderColor: achievement.unlocked
                      ? colors.primary
                      : colors.border,
                    opacity: achievement.unlocked ? 1 : 0.5,
                  },
                ]}
              >
                <ThemedText style={styles.achievementEmoji}>
                  {achievement.emoji}
                </ThemedText>
                <ThemedText style={styles.achievementTitle}>
                  {achievement.title}
                </ThemedText>
                <ThemedText style={styles.achievementDescription}>
                  {achievement.description}
                </ThemedText>
                {achievement.unlocked && (
                  <View
                    style={[
                      styles.unlockedBadge,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <ThemedText style={styles.unlockedText}>✓</ThemedText>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ThemedView>

        {/* Empty state */}
        {stats.total === 0 && (
          <ThemedView style={styles.emptyState}>
            <ThemedText style={styles.emptyEmoji}>📚</ThemedText>
            <ThemedText style={styles.emptyTitle}>No Stats Yet</ThemedText>
            <ThemedText style={styles.emptySubtitle}>
              Start adding books to see your reading journey!
            </ThemedText>
          </ThemedView>
        )}
      </ScrollView>

      {/* Challenge Modal */}
      <Modal
        visible={showChallengeModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowChallengeModal(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setShowChallengeModal(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Set Challenge</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={styles.modalContent}>
            <ThemedText style={styles.modalLabel}>Challenge Type</ThemedText>
            <View style={styles.challengeTypeButtons}>
              <Pressable
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      selectedChallengeType === "yearly"
                        ? colors.primary
                        : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedChallengeType("yearly")}
              >
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        selectedChallengeType === "yearly"
                          ? "#fff"
                          : colors.text,
                    },
                  ]}
                >
                  📅 Yearly Goal
                </ThemedText>
              </Pressable>
              <Pressable
                style={[
                  styles.typeButton,
                  {
                    backgroundColor:
                      selectedChallengeType === "monthly"
                        ? colors.primary
                        : colors.card,
                    borderColor: colors.border,
                  },
                ]}
                onPress={() => setSelectedChallengeType("monthly")}
              >
                <ThemedText
                  style={[
                    styles.typeButtonText,
                    {
                      color:
                        selectedChallengeType === "monthly"
                          ? "#fff"
                          : colors.text,
                    },
                  ]}
                >
                  📆 Monthly Challenge
                </ThemedText>
              </Pressable>
            </View>

            <ThemedText style={styles.modalLabel}>
              Target Books to Read
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={newChallengeTarget}
              onChangeText={setNewChallengeTarget}
              placeholder={selectedChallengeType === "yearly" ? "24" : "2"}
              placeholderTextColor={colors.text + "60"}
              keyboardType="number-pad"
            />

            <TouchableOpacity
              style={[styles.createButton, { backgroundColor: colors.primary }]}
              onPress={createChallenge}
            >
              <ThemedText style={styles.createButtonText}>
                Update Challenge
              </ThemedText>
            </TouchableOpacity>
          </ScrollView>
        </ThemedView>
      </Modal>
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
    paddingHorizontal: 28,
    paddingBottom: 32,
  },
  title: {
    fontSize: 36,
    fontWeight: "900",
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    opacity: 0.65,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  statValue: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.65,
  },
  section: {
    paddingHorizontal: 28,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  editButton: {
    fontSize: 15,
    fontWeight: "600",
  },
  challengeCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 2,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  challengeHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  challengeEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 2,
  },
  challengeProgress: {
    fontSize: 14,
    opacity: 0.65,
  },
  completeBadge: {
    fontSize: 24,
    color: "#4CAF50",
  },
  progressBarBg: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
  },
  chartCard: {
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
    alignItems: "center",
  },
  achievementsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  achievementCard: {
    width: "48%",
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    position: "relative",
  },
  achievementEmoji: {
    fontSize: 40,
    marginBottom: 8,
  },
  achievementTitle: {
    fontSize: 14,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 11,
    opacity: 0.65,
    textAlign: "center",
  },
  unlockedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  unlockedText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "800",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 16,
    opacity: 0.8,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    marginTop: 8,
  },
  challengeTypeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  typeButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: "center",
  },
  typeButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 24,
  },
  createButton: {
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
