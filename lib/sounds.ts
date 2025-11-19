import { Audio } from "expo-av";
import * as Haptics from "expo-haptics";

// Sound effect helper
export class SoundManager {
  private static sounds: { [key: string]: Audio.Sound } = {};

  static async playSound(
    type: "scan" | "wheel" | "success" | "button" | "swipe"
  ) {
    // Haptic feedback for all interactions
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // You can add actual sound files later, for now just haptics
    // Example of how to load and play sounds:
    // if (!this.sounds[type]) {
    //   const { sound } = await Audio.Sound.createAsync(
    //     require(`@/assets/sounds/${type}.mp3`)
    //   );
    //   this.sounds[type] = sound;
    // }
    // await this.sounds[type].replayAsync();
  }

  static async playHaptic(
    style: "light" | "medium" | "heavy" | "success" | "warning" | "error"
  ) {
    switch (style) {
      case "light":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
      case "medium":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        break;
      case "heavy":
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        break;
      case "success":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Success
        );
        break;
      case "warning":
        await Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning
        );
        break;
      case "error":
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
    }
  }
}
