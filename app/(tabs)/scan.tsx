import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { fetchBookData } from "@/lib/book-api";
import { SoundManager } from "@/lib/sounds";
import { Genre, supabase } from "@/lib/supabase";
import { useTheme } from "@react-navigation/native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [bookData, setBookData] = useState<any>(null);
  const [manualIsbn, setManualIsbn] = useState("");
  const [showManualEntry, setShowManualEntry] = useState(false);

  // Manual entry form fields
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthor, setManualAuthor] = useState("");
  const [manualCoverUrl, setManualCoverUrl] = useState("");
  const [manualIsbnField, setManualIsbnField] = useState("");
  const [manualSelectedGenres, setManualSelectedGenres] = useState<string[]>(
    []
  );
  const [availableGenres, setAvailableGenres] = useState<Genre[]>([]);

  const { colors } = useTheme();
  const router = useRouter();

  useEffect(() => {
    fetchGenres();
  }, []);

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from("genres")
        .select("*")
        .order("name");

      if (error) throw error;
      setAvailableGenres(data || []);
    } catch (error) {
      console.error("Error fetching genres:", error);
    }
  };

  if (!permission) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Requesting camera permission...</ThemedText>
      </ThemedView>
    );
  }

  if (!permission.granted) {
    return (
      <ThemedView style={styles.container}>
        <ThemedView style={styles.permissionContainer}>
          <IconSymbol
            name="camera.fill"
            size={64}
            color={colors.text}
            style={{ opacity: 0.3 }}
          />
          <ThemedText style={styles.permissionTitle}>
            Camera Permission Required
          </ThemedText>
          <ThemedText style={styles.permissionText}>
            We need camera access to scan book barcodes
          </ThemedText>
          <TouchableOpacity
            style={[
              styles.permissionButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={requestPermission}
          >
            <ThemedText style={styles.permissionButtonText}>
              Grant Permission
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || scanning) return;

    setScanned(true);
    setScanning(true);
    SoundManager.playSound("scan");

    await processIsbn(data);
  };

  const processIsbn = async (isbn: string) => {
    try {
      // Check if book already exists
      const { data: existingBook } = await supabase
        .from("books")
        .select("*")
        .eq("isbn", isbn)
        .single();

      if (existingBook) {
        Alert.alert(
          "Book Already Exists",
          `"${existingBook.title}" is already in your library!`,
          [{ text: "OK", onPress: () => resetScanner() }]
        );
        return;
      }

      // Fetch book data from API
      const data = await fetchBookData(isbn);

      if (!data) {
        Alert.alert(
          "Book Not Found",
          "Could not find book information. Try entering details manually.",
          [{ text: "OK", onPress: () => resetScanner() }]
        );
        return;
      }

      setBookData({ ...data, isbn });
    } catch (error) {
      console.error("Error processing ISBN:", error);
      Alert.alert("Error", "Failed to process barcode");
      resetScanner();
    } finally {
      setScanning(false);
    }
  };

  const handleSaveBook = async () => {
    if (!bookData) return;

    try {
      const { error } = await supabase.from("books").insert({
        isbn: bookData.isbn,
        title: bookData.title,
        author: bookData.author,
        cover_url: bookData.cover_url,
        genre: bookData.genre,
        status: "unread",
      });

      if (error) throw error;

      SoundManager.playHaptic("success");
      Alert.alert("Success!", "Book added to your library", [
        {
          text: "View Library",
          onPress: () => {
            resetScanner();
            router.push("/(tabs)");
          },
        },
        { text: "Scan Another", onPress: () => resetScanner() },
      ]);
    } catch (error) {
      console.error("Error saving book:", error);
      Alert.alert("Error", "Failed to save book");
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScanning(false);
    setBookData(null);
  };

  const handleManualEntry = async () => {
    if (!manualIsbn.trim()) {
      Alert.alert("Error", "Please enter an ISBN");
      return;
    }

    setScanning(true);
    await processIsbn(manualIsbn.trim());
    setManualIsbn("");
  };

  const toggleManualGenre = (genreName: string) => {
    SoundManager.playHaptic("light");
    setManualSelectedGenres((prev) =>
      prev.includes(genreName)
        ? prev.filter((g) => g !== genreName)
        : [...prev, genreName]
    );
  };

  const handleSaveManualBook = async () => {
    if (!manualTitle.trim() || !manualAuthor.trim()) {
      Alert.alert("Error", "Title and Author are required");
      return;
    }

    try {
      const { error } = await supabase.from("books").insert({
        isbn: manualIsbnField.trim() || null,
        title: manualTitle.trim(),
        author: manualAuthor.trim(),
        cover_url: manualCoverUrl.trim() || null,
        genre: manualSelectedGenres,
        status: "unread",
      });

      if (error) throw error;

      SoundManager.playHaptic("success");
      Alert.alert("Success!", "Book added to your library", [
        {
          text: "View Library",
          onPress: () => {
            resetManualEntry();
            router.push("/(tabs)");
          },
        },
        { text: "Add Another", onPress: () => resetManualEntry() },
      ]);
    } catch (error) {
      console.error("Error saving manual book:", error);
      Alert.alert("Error", "Failed to save book");
    }
  };

  const resetManualEntry = () => {
    setShowManualEntry(false);
    setManualTitle("");
    setManualAuthor("");
    setManualCoverUrl("");
    setManualIsbnField("");
    setManualSelectedGenres([]);
  };

  if (bookData) {
    return (
      <ThemedView style={styles.container}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity onPress={resetScanner}>
            <IconSymbol name="xmark" size={24} color={colors.text} />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle}>Confirm Book</ThemedText>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.previewContainer}
          contentContainerStyle={styles.previewContent}
        >
          {bookData.cover_url && (
            <Image
              source={{ uri: bookData.cover_url }}
              style={styles.previewCover}
              contentFit="contain"
            />
          )}

          <ThemedText style={styles.previewTitle}>{bookData.title}</ThemedText>
          <ThemedText style={styles.previewAuthor}>
            {bookData.author}
          </ThemedText>

          {bookData.isbn && (
            <ThemedText style={styles.previewIsbn}>
              ISBN: {bookData.isbn}
            </ThemedText>
          )}

          {bookData.genre && bookData.genre.length > 0 && (
            <View style={styles.genreContainer}>
              {bookData.genre
                .filter((g: string) => g && g.trim().length > 0)
                .map((g: string, i: number) => (
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

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.primary }]}
            onPress={handleSaveBook}
          >
            <ThemedText style={styles.saveButtonText}>
              ✨ Add to Library
            </ThemedText>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.cancelButton, { borderColor: colors.border }]}
            onPress={resetScanner}
          >
            <ThemedText>Cancel</ThemedText>
          </TouchableOpacity>
        </ScrollView>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.cameraHeader}>
        <ThemedText type="title" style={styles.title}>
          📷 Scan a Book
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Point your camera at the barcode ✨
        </ThemedText>
      </ThemedView>

      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
          barcodeScannerSettings={{
            barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
          }}
        >
          <View style={styles.overlay}>
            <View style={styles.scanFrame} />
          </View>
        </CameraView>
      </View>

      {scanning && (
        <ThemedView style={styles.scanningIndicator}>
          <ThemedText>📚 Looking up book...</ThemedText>
        </ThemedView>
      )}

      <ThemedView style={styles.manualEntryContainer}>
        <ThemedText style={styles.manualLabel}>
          💡 Or enter ISBN manually:
        </ThemedText>
        <View style={styles.manualInputRow}>
          <TextInput
            style={[
              styles.manualInput,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Enter ISBN"
            placeholderTextColor={colors.text + "80"}
            value={manualIsbn}
            onChangeText={setManualIsbn}
            keyboardType="numeric"
          />
          <TouchableOpacity
            style={[styles.manualButton, { backgroundColor: colors.primary }]}
            onPress={handleManualEntry}
            disabled={scanning}
          >
            <IconSymbol name="magnifyingglass" size={20} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Add Book Manually Button */}
        <TouchableOpacity
          style={[styles.addManuallyButton, { backgroundColor: colors.card }]}
          onPress={() => {
            SoundManager.playHaptic("light");
            setShowManualEntry(true);
          }}
        >
          <IconSymbol
            name="pencil.circle.fill"
            size={24}
            color={colors.primary}
          />
          <ThemedText style={styles.addManuallyText}>
            📝 Add Book Manually (No ISBN Required)
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={resetManualEntry}
      >
        <ThemedView style={styles.modalContainer}>
          <View
            style={[styles.modalHeader, { borderBottomColor: colors.border }]}
          >
            <TouchableOpacity onPress={resetManualEntry}>
              <IconSymbol name="xmark" size={24} color={colors.text} />
            </TouchableOpacity>
            <ThemedText style={styles.modalTitle}>Add Book Manually</ThemedText>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={styles.modalScrollContent}
          >
            <ThemedText style={styles.formLabel}>Title *</ThemedText>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={manualTitle}
              onChangeText={setManualTitle}
              placeholder="Enter book title"
              placeholderTextColor={colors.text + "80"}
            />

            <ThemedText style={styles.formLabel}>Author *</ThemedText>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={manualAuthor}
              onChangeText={setManualAuthor}
              placeholder="Enter author name"
              placeholderTextColor={colors.text + "80"}
            />

            <ThemedText style={styles.formLabel}>
              Cover Image URL (optional)
            </ThemedText>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={manualCoverUrl}
              onChangeText={setManualCoverUrl}
              placeholder="https://..."
              placeholderTextColor={colors.text + "80"}
            />

            <ThemedText style={styles.formLabel}>ISBN (optional)</ThemedText>
            <TextInput
              style={[
                styles.formInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={manualIsbnField}
              onChangeText={setManualIsbnField}
              placeholder="Enter ISBN"
              placeholderTextColor={colors.text + "80"}
              keyboardType="numeric"
            />

            <ThemedText style={styles.formLabel}>Genres (optional)</ThemedText>
            <View style={styles.genresGrid}>
              {availableGenres.map((genre) => (
                <TouchableOpacity
                  key={genre.id}
                  style={[
                    styles.genreChip,
                    { backgroundColor: colors.background },
                    manualSelectedGenres.includes(genre.name) && {
                      backgroundColor: colors.primary,
                    },
                  ]}
                  onPress={() => toggleManualGenre(genre.name)}
                >
                  <ThemedText
                    style={[
                      styles.genreChipText,
                      manualSelectedGenres.includes(genre.name) && {
                        color: "#fff",
                      },
                    ]}
                  >
                    {genre.name}
                  </ThemedText>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { backgroundColor: colors.primary }]}
              onPress={handleSaveManualBook}
            >
              <ThemedText style={styles.saveButtonText}>
                ✨ Add to Library
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: colors.border }]}
              onPress={resetManualEntry}
            >
              <ThemedText>Cancel</ThemedText>
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
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },
  permissionText: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    marginBottom: 32,
  },
  permissionButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  cameraHeader: {
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
  cameraContainer: {
    flex: 1,
    overflow: "hidden",
    borderRadius: 24,
    marginHorizontal: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  scanFrame: {
    width: 260,
    height: 160,
    borderWidth: 4,
    borderColor: "#fff",
    borderRadius: 16,
    shadowColor: "#fff",
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 },
  },
  scanningIndicator: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -100 }, { translateY: -20 }],
    padding: 20,
    borderRadius: 16,
    width: 200,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  manualEntryContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  manualLabel: {
    fontSize: 14,
    marginBottom: 8,
    opacity: 0.7,
  },
  manualInputRow: {
    flexDirection: "row",
    gap: 8,
  },
  manualInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  manualButton: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  previewContainer: {
    flex: 1,
  },
  previewContent: {
    padding: 20,
    paddingBottom: 100,
  },
  previewCover: {
    width: "100%",
    height: 320,
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  previewTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 8,
  },
  previewAuthor: {
    fontSize: 18,
    opacity: 0.7,
    marginBottom: 8,
  },
  previewIsbn: {
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
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  genreTagText: {
    fontSize: 12,
    fontWeight: "600",
  },
  saveButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
  },
  cancelButton: {
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  addManuallyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderRadius: 14,
    marginTop: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  addManuallyText: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  modalContent: {
    flex: 1,
  },
  modalScrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 16,
  },
  formInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 8,
    marginBottom: 24,
  },
  genreChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  genreChipText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
