import React from "react";
import {
  View,
  StyleSheet,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Text } from "./text";
import { Button } from "./button";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  runOnJS,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { NAV_THEME } from "~/lib/constants";

const { width, height } = Dimensions.get("window");

// Spectacular explosion colors - overwhelming palette
const EXPLOSION_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#45B7D1",
  "#96CEB4",
  "#FECA57",
  "#FF9FF3",
  "#54A0FF",
  "#5F27CD",
  "#00D2D3",
  "#FF9F43",
  "#10AC84",
  "#EE5A24",
  "#0098DB",
  "#F79F1F",
  "#A3CB38",
  "#1289A7",
  "#D980FA",
  "#B53471",
  "#009432",
  "#006BA6",
  "#8395A7",
  "#222F3E",
  "#EE5A6F",
  "#0FB9B1",
  "#3742FA",
  "#FD79A8",
  "#FDCB6E",
  "#6C5CE7",
  "#A29BFE",
  "#74B9FF",
  "#00B894",
  "#00CEC9",
  "#E17055",
  "#FAB1A0",
  "#E84393",
  "#FF7675",
  "#55A3FF",
  "#26DE81",
  "#FD79A8",
  "#FDCB6E",
  "#FF6348",
  "#2ED573",
  "#1E90FF",
  "#FF4757",
  "#FFA502",
  "#FF3838",
  "#2F3542",
  "#57606F",
  "#3742FA",
  "#2ED573",
];

const FIREWORK_ICONS = [
  "star",
  "heart",
  "circle",
  "triangle",
  "square-rounded",
  "flower",
  "fire",
  "lightning-bolt",
  "flash",
  "sparkles",
  "star-four-points",
  "hexagon",
  "pentagon",
  "diamond",
  "crown",
  "gift",
  "cake",
  "balloon",
  "confetti",
];

interface ThankYouModalProps {
  visible: boolean;
  onClose: () => void;
  customerName?: string;
  isDark?: boolean;
}

const ThankYouModal: React.FC<ThankYouModalProps> = ({
  visible,
  onClose,
  customerName = "Client",
  isDark = false,
}) => {
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);
  const checkScale = useSharedValue(0);
  const textSlide = useSharedValue(50);
  const buttonSlide = useSharedValue(50);
  const rainbowRotation = useSharedValue(0);

  const themeColors = isDark ? NAV_THEME.dark : NAV_THEME.light;

  // Create 60+ explosion particles for overwhelming effect
  const explosionParticles = Array.from({ length: 60 }, (_, index) => ({
    id: index,
    x: useSharedValue(width / 2),
    y: useSharedValue(height / 2),
    scale: useSharedValue(0),
    rotation: useSharedValue(0),
    opacity: useSharedValue(0),
    icon: FIREWORK_ICONS[Math.floor(Math.random() * FIREWORK_ICONS.length)],
    color:
      EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)],
    size: 20 + Math.random() * 25, // Varied sizes
  }));

  // Create multiple firework bursts at different positions
  const fireworkBursts = Array.from({ length: 8 }, (_, index) => ({
    id: index,
    scale: useSharedValue(0),
    opacity: useSharedValue(0),
    x: Math.random() * width,
    y: 100 + Math.random() * (height / 2),
  }));

  React.useEffect(() => {
    if (visible) {
      // Backdrop animation
      opacity.value = withTiming(1, { duration: 300 });

      // Modal scale animation with explosive entrance
      scale.value = withSequence(
        withSpring(1.5, { damping: 6, stiffness: 250 }),
        withSpring(0.85, { damping: 8, stiffness: 200 }),
        withSpring(1, { damping: 12, stiffness: 150 })
      );

      // Trigger massive explosion of particles
      explosionParticles.forEach((particle, index) => {
        const delay = index * 20; // Staggered explosion
        const angle = (index / explosionParticles.length) * 2 * Math.PI;
        const distance = 200 + Math.random() * 400; // Varied explosion radius

        // Calculate target position
        const targetX = width / 2 + Math.cos(angle) * distance;
        const targetY = height / 2 + Math.sin(angle) * distance;

        // Animate particle explosion
        particle.x.value = withDelay(
          delay,
          withTiming(targetX, {
            duration: 1500 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
          })
        );

        particle.y.value = withDelay(
          delay,
          withTiming(targetY, {
            duration: 1500 + Math.random() * 1000,
            easing: Easing.out(Easing.quad),
          })
        );

        particle.scale.value = withDelay(
          delay,
          withSequence(
            withTiming(1.8, {
              duration: 300,
              easing: Easing.out(Easing.back(2)),
            }),
            withTiming(0.8, { duration: 1200 }),
            withTiming(0, { duration: 500 })
          )
        );

        particle.rotation.value = withDelay(
          delay,
          withTiming(720 + Math.random() * 360, {
            duration: 2000 + Math.random() * 1000,
          })
        );

        particle.opacity.value = withDelay(
          delay,
          withSequence(
            withTiming(1, { duration: 200 }),
            withDelay(1000, withTiming(0, { duration: 800 }))
          )
        );
      });

      // Trigger firework bursts
      fireworkBursts.forEach((burst, index) => {
        const delay = 200 + index * 150;
        burst.scale.value = withDelay(
          delay,
          withSequence(
            withTiming(12, { duration: 400, easing: Easing.out(Easing.quad) }),
            withTiming(0, { duration: 600 })
          )
        );
        burst.opacity.value = withDelay(
          delay,
          withSequence(
            withTiming(0.8, { duration: 200 }),
            withTiming(0, { duration: 800 })
          )
        );
      });

      // Check icon animation (delayed and bouncy)
      checkScale.value = withDelay(
        800,
        withSequence(
          withSpring(2.2, { damping: 6, stiffness: 300 }),
          withSpring(0.7, { damping: 10, stiffness: 200 }),
          withSpring(1, { damping: 15, stiffness: 150 })
        )
      );

      // Text slide up animation
      textSlide.value = withDelay(
        1200,
        withSpring(0, { damping: 20, stiffness: 100 })
      );

      // Button slide up animation
      buttonSlide.value = withDelay(
        1500,
        withSpring(0, { damping: 20, stiffness: 100 })
      );

      // Continuous rainbow rotation for background
      rainbowRotation.value = withRepeat(
        withTiming(360, { duration: 4000, easing: Easing.linear }),
        -1,
        false
      );
    } else {
      // Reset all animations
      scale.value = withTiming(0, { duration: 200 });
      opacity.value = withTiming(0, { duration: 300 });
      checkScale.value = 0;
      textSlide.value = 50;
      buttonSlide.value = 50;
      rainbowRotation.value = 0;

      // Reset particles
      explosionParticles.forEach((particle) => {
        particle.x.value = width / 2;
        particle.y.value = height / 2;
        particle.scale.value = 0;
        particle.rotation.value = 0;
        particle.opacity.value = 0;
      });

      // Reset fireworks
      fireworkBursts.forEach((burst) => {
        burst.scale.value = 0;
        burst.opacity.value = 0;
      });
    }
  }, [visible]);

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const modalStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
  }));

  const textStyle = useAnimatedStyle(() => ({
    opacity: textSlide.value === 0 ? 1 : 0,
    transform: [{ translateY: textSlide.value }],
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    opacity: buttonSlide.value === 0 ? 1 : 0,
    transform: [{ translateY: buttonSlide.value }],
  }));

  const rainbowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rainbowRotation.value}deg` }],
  }));

  const handleClose = () => {
    scale.value = withTiming(0, { duration: 200 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onClose)();
    });
  };

  // Explosion Particle Component
  const ExplosionParticle = ({ particle }: { particle: any }) => {
    const particleStyle = useAnimatedStyle(() => ({
      position: "absolute",
      left: particle.x.value - particle.size / 2,
      top: particle.y.value - particle.size / 2,
      transform: [
        { scale: particle.scale.value },
        { rotate: `${particle.rotation.value}deg` },
      ],
      opacity: particle.opacity.value,
    }));

    return (
      <Animated.View style={particleStyle}>
        <Icon
          name={particle.icon}
          size={particle.size}
          color={particle.color}
        />
      </Animated.View>
    );
  };

  // Firework Burst Component
  const FireworkBurst = ({ burst }: { burst: any }) => {
    const burstStyle = useAnimatedStyle(() => ({
      position: "absolute",
      left: burst.x - 50,
      top: burst.y - 50,
      transform: [{ scale: burst.scale.value }],
      opacity: burst.opacity.value,
    }));

    return (
      <Animated.View style={[styles.fireworkBurst, burstStyle]}>
        <LinearGradient
          colors={[
            EXPLOSION_COLORS[
              Math.floor(Math.random() * EXPLOSION_COLORS.length)
            ] + "FF",
            EXPLOSION_COLORS[
              Math.floor(Math.random() * EXPLOSION_COLORS.length)
            ] + "80",
            "transparent",
          ]}
          style={styles.burstGradient}
        />
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} animationType="none">
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          {/* Animated Rainbow Background */}
          <Animated.View style={[styles.rainbowBackground, rainbowStyle]}>
            <LinearGradient
              colors={[
                "#FF6B6B",
                "#4ECDC4",
                "#45B7D1",
                "#96CEB4",
                "#FECA57",
                "#FF9FF3",
                "#54A0FF",
                "#5F27CD",
                "#00D2D3",
                "#FF9F43",
              ]}
              style={styles.rainbowGradient}
            />
          </Animated.View>

          {/* Backdrop Blur */}
          <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
            <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          </Animated.View>

          {/* Explosion Particles - Overwhelming Effect */}
          {explosionParticles.map((particle) => (
            <ExplosionParticle key={particle.id} particle={particle} />
          ))}

          {/* Firework Bursts */}
          {fireworkBursts.map((burst) => (
            <FireworkBurst key={burst.id} burst={burst} />
          ))}

          {/* Main Modal Content */}
          <TouchableWithoutFeedback>
            <Animated.View style={[styles.modalContainer, modalStyle]}>
              <LinearGradient
                colors={[themeColors.card + "F0", themeColors.card + "E0"]}
                style={styles.modalContent}
              >
                {/* Success Icon with Spectacular Effect */}
                <Animated.View style={[styles.iconContainer, checkStyle]}>
                  <LinearGradient
                    colors={["#00D2D3", "#26DE81", "#2ED573"]}
                    style={styles.iconGradient}
                  >
                    <Icon name="check-circle" size={80} color="#FFFFFF" />
                  </LinearGradient>
                </Animated.View>

                {/* Congratulations Text */}
                <Animated.View style={[styles.textContainer, textStyle]}>
                  <Text style={[styles.title, { color: themeColors.text }]}>
                    🎉 CONGRATULATIONS! 🎉
                  </Text>
                  <Text style={[styles.subtitle, { color: themeColors.text }]}>
                    Thank you, {customerName}!
                  </Text>
                  <Text
                    style={[
                      styles.description,
                      { color: themeColors.text + "99" },
                    ]}
                  >
                    Your order has been successfully placed and is being
                    processed with care. We appreciate your business! ✨
                  </Text>
                </Animated.View>

                {/* Action Button */}
                <Animated.View style={[styles.buttonContainer, buttonStyle]}>
                  <Button
                    onPress={handleClose}
                    style={[
                      styles.button,
                      { backgroundColor: themeColors.primary },
                    ]}
                  >
                    <Text style={[styles.buttonText, { color: "#FFFFFF" }]}>
                      Continue Shopping 🛍️
                    </Text>
                  </Button>
                </Animated.View>
              </LinearGradient>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.7)",
  },
  rainbowBackground: {
    position: "absolute",
    width: width * 3,
    height: height * 3,
    left: -width,
    top: -height,
  },
  rainbowGradient: {
    flex: 1,
    borderRadius: width * 1.5,
  },
  modalContainer: {
    width: width * 0.9,
    maxWidth: 400,
  },
  modalContent: {
    borderRadius: 24,
    padding: 32,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  iconContainer: {
    marginBottom: 24,
    shadowColor: "#00D2D3",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  iconGradient: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontFamily: "Staatliches-Regular",
    textAlign: "center",
    marginBottom: 8,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 22,
    fontFamily: "Staatliches-Regular",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
    fontFamily: "Staatliches-Regular",
  },
  buttonContainer: {
    width: "100%",
  },
  button: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    fontSize: 18,
    fontFamily: "Staatliches-Regular",
    textAlign: "center",
  },
  fireworkBurst: {
    width: 100,
    height: 100,
  },
  burstGradient: {
    flex: 1,
    borderRadius: 50,
  },
});

export default ThankYouModal;
