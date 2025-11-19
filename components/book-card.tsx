import { SoundManager } from "@/lib/sounds";
import { Book, supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { Image } from "expo-image";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";
import { IconSymbol } from "./ui/icon-symbol";

interface BookCardProps {
  book: Book;
  onUpdate: () => void;
}

export function BookCard({ book, onUpdate }: BookCardProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(false);
  const [status, setStatus] = useState(book.status);
  const [rating, setRating] = useState(book.rating || 0);
  const [review, setReview] = useState(book.review || "");
  const [borrowedTo, setBorrowedTo] = useState(book.borrowed_to || "");
  const { colors } = useTheme();

  const handleUpdateBook = async () => {
    try {
      const updates: any = {
        status,
        rating: rating || null,
        review: review || null,
      };

      if (status === "borrowed") {
        updates.borrowed_to = borrowedTo;
        updates.borrowed_at = new Date().toISOString();
      } else if (book.status === "borrowed") {
        // Book was borrowed, now it's returned
        updates.returned_at = new Date().toISOString();
        updates.borrowed_to = null;
      }

      const { error } = await supabase
        .from("books")
        .update(updates)
        .eq("id", book.id);

      if (error) throw error;

      SoundManager.playHaptic("success");
      setEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Error updating book:", error);
      Alert.alert("Error", "Failed to update book");
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Book", "Are you sure you want to delete this book?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const { error } = await supabase
              .from("books")
              .delete()
              .eq("id", book.id);
            if (error) throw error;
            SoundManager.playHaptic("success");
            setModalVisible(false);
            onUpdate();
          } catch (error) {
            Alert.alert("Error", "Failed to delete book");
          }
        },
      },
    ]);
  };

  const statusEmoji = {
    unread: "📚",
    reading: "📖",
    read: "✅",
    borrowed: "🤝",
  };

  return (
    <>
      <TouchableOpacity
        onPress={() => {
          SoundManager.playHaptic("light");
          setModalVisible(true);
        }}
        activeOpacity={0.7}
        style={[
          styles.card,
          {
            backgroundColor: colors.card,
            shadowColor: colors.text,
            shadowOpacity: 0.08,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 4 },
            elevation: 3,
          },
        ]}
      >
        <View style={styles.cardContent}>
          {book.cover_url ? (
            <Image
              source={{ uri: book.cover_url }}
              style={styles.cover}
              contentFit="cover"
            />
          ) : (
            <View
              style={[
                styles.cover,
                styles.coverPlaceholder,
                { backgroundColor: colors.primary + "15" },
              ]}
            >
              <IconSymbol
                name="book.fill"
                size={32}
                color={colors.primary}
                style={{ opacity: 0.4 }}
              />
            </View>
          )}
          <View style={styles.info}>
            <ThemedText style={styles.title} numberOfLines={2}>
              {book.title || "Unknown Title"}
            </ThemedText>
            <ThemedText style={styles.author} numberOfLines={1}>
              {book.author || "Unknown Author"}
            </ThemedText>
            {book.genre && book.genre.length > 0 && (
              <View style={styles.genreRow}>
                {book.genre.slice(0, 2).map((g, i) => (
                  <View
                    key={i}
                    style={[
                      styles.genrePill,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <ThemedText style={[styles.genreText, { color: "#fff" }]}>
                      {g}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusBadge,
                  { backgroundColor: colors.primary + "20" },
                ]}
              >
                <ThemedText style={[styles.statusText, { color: "#fff" }]}>
                  {statusEmoji[book.status]} {book.status}
                </ThemedText>
              </View>
              {book.rating && (
                <ThemedText style={styles.rating}>
                  {"⭐".repeat(book.rating)}
                </ThemedText>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}
      >
        <ThemedView style={styles.modalContainer}>
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Book Details</ThemedText>
            <TouchableOpacity onPress={handleDelete}>
              <IconSymbol name="trash" size={24} color="#ff3b30" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            {book.cover_url && (
              <Image
                source={{ uri: book.cover_url }}
                style={styles.modalCover}
                contentFit="contain"
              />
            )}

            <ThemedText style={styles.modalBookTitle}>{book.title}</ThemedText>
            <ThemedText style={styles.modalAuthor}>{book.author}</ThemedText>

            {book.isbn && (
              <ThemedText style={styles.isbn}>ISBN: {book.isbn}</ThemedText>
            )}

            {book.genre && book.genre.length > 0 && (
              <View style={styles.genreContainer}>
                {book.genre.map((g, i) => (
                  <View
                    key={i}
                    style={[
                      styles.genreTag,
                      { backgroundColor: colors.primary },
                    ]}
                  >
                    <ThemedText
                      style={[styles.genreTagText, { color: "#fff" }]}
                    >
                      {g}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}

            {/* Status Selection */}
            <ThemedText style={styles.label}>Status</ThemedText>
            <View style={styles.statusButtons}>
              {(["unread", "reading", "read", "borrowed"] as const).map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => {
                    SoundManager.playHaptic("light");
                    setStatus(s);
                    setEditing(true);
                  }}
                  style={[
                    styles.statusButton,
                    { backgroundColor: colors.card },
                    status === s && { backgroundColor: colors.primary },
                  ]}
                >
                  <ThemedText style={[status === s && { color: "#fff" }]}>
                    {statusEmoji[s]} {s}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating */}
            {(status === "read" || book.status === "read") && (
              <>
                <ThemedText style={styles.label}>Rating</ThemedText>
                <View style={styles.ratingButtons}>
                  {[1, 2, 3, 4, 5].map((r) => (
                    <TouchableOpacity
                      key={r}
                      onPress={() => {
                        SoundManager.playHaptic("light");
                        setRating(r);
                        setEditing(true);
                      }}
                      style={styles.starButton}
                    >
                      <ThemedText style={styles.star}>
                        {r <= rating ? "⭐" : "☆"}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>

                <ThemedText style={styles.label}>Review</ThemedText>
                <TextInput
                  style={[
                    styles.reviewInput,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  multiline
                  numberOfLines={4}
                  placeholder="Write your review..."
                  placeholderTextColor={colors.text + "80"}
                  value={review}
                  onChangeText={(text) => {
                    setReview(text);
                    setEditing(true);
                  }}
                />
              </>
            )}

            {/* Borrowed To */}
            {status === "borrowed" && (
              <>
                <ThemedText style={styles.label}>Borrowed To</ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: colors.border,
                    },
                  ]}
                  placeholder="Person's name"
                  placeholderTextColor={colors.text + "80"}
                  value={borrowedTo}
                  onChangeText={(text) => {
                    setBorrowedTo(text);
                    setEditing(true);
                  }}
                />
              </>
            )}

            {book.borrowed_to && book.borrowed_at && (
              <ThemedText style={styles.borrowInfo}>
                Borrowed to {book.borrowed_to} on{" "}
                {new Date(book.borrowed_at).toLocaleDateString()}
              </ThemedText>
            )}

            {editing && (
              <TouchableOpacity
                style={[styles.saveButton, { backgroundColor: colors.primary }]}
                onPress={handleUpdateBook}
              >
                <ThemedText style={styles.saveButtonText}>
                  Save Changes
                </ThemedText>
              </TouchableOpacity>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  cardContent: {
    flexDirection: "row",
    gap: 16,
  },
  cover: {
    width: 90,
    height: 135,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
  },
  coverPlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  info: {
    flex: 1,
    justifyContent: "space-between",
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 4,
  },
  author: {
    fontSize: 15,
    opacity: 0.7,
    marginBottom: 8,
  },
  genreRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  genrePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  genreText: {
    fontSize: 11,
    fontWeight: "600",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 13,
    fontWeight: "600",
  },
  rating: {
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  modalScrollContent: {
    paddingBottom: 100,
  },
  modalCover: {
    width: "100%",
    height: 300,
    borderRadius: 12,
    marginBottom: 16,
  },
  modalBookTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  modalAuthor: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 16,
  },
  isbn: {
    fontSize: 12,
    opacity: 0.5,
    marginBottom: 16,
  },
  genreContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  genreTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  statusButtons: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  statusButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  ratingButtons: {
    flexDirection: "row",
    gap: 8,
  },
  starButton: {
    padding: 8,
  },
  star: {
    fontSize: 32,
  },
  reviewInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 100,
    textAlignVertical: "top",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  borrowInfo: {
    fontSize: 14,
    opacity: 0.6,
    marginTop: 8,
    fontStyle: "italic",
  },
  saveButton: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 40,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
