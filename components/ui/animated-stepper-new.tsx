import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "./text";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withSequence,
  withRepeat,
  interpolate,
  Extrapolate,
  Easing,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { NAV_THEME } from "~/lib/constants";

const { width } = Dimensions.get("window");
const STEP_SIZE = 60;
const CONNECTOR_HEIGHT = 4;

interface Step {
  key: string;
  title: string;
  iconName: string;
}

interface AnimatedStepperProps {
  steps: Step[];
  currentStep: number;
  isDark?: boolean;
}

const AnimatedStepper: React.FC<AnimatedStepperProps> = ({
  steps,
  currentStep,
  isDark = false,
}) => {
  const progress = useSharedValue(0);
  const themeColors = isDark ? NAV_THEME.dark : NAV_THEME.light;

  React.useEffect(() => {
    progress.value = withTiming(currentStep / (steps.length - 1), {
      duration: 600,
      easing: Easing.out(Easing.quad),
    });
  }, [currentStep, steps.length]);

  const StepItem = ({ step, index }: { step: Step; index: number }) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;

    // Subtle pulse animation for active step
    const pulseScale = useSharedValue(1);
    const glowOpacity = useSharedValue(0);

    React.useEffect(() => {
      if (isActive) {
        // Very subtle pulsing - much smaller than before
        pulseScale.value = withRepeat(
          withSequence(
            withSpring(1.02, { damping: 15, stiffness: 200 }), // Much smaller scale
            withSpring(1, { damping: 15, stiffness: 200 })
          ),
          -1,
          true
        );

        // Gentle glow for active step
        glowOpacity.value = withRepeat(
          withSequence(
            withTiming(0.3, { duration: 1500 }),
            withTiming(0.1, { duration: 1500 })
          ),
          -1,
          true
        );
      } else {
        pulseScale.value = withSpring(1, { damping: 15, stiffness: 200 });
        glowOpacity.value = withTiming(0, { duration: 300 });
      }
    }, [isActive]);

    const animatedStyle = useAnimatedStyle(() => ({
      transform: [{ scale: pulseScale.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
      opacity: glowOpacity.value,
    }));

    return (
      <View style={styles.stepContainer}>
        <View style={styles.stepCircleContainer}>
          {/* Subtle glow effect for active step only */}
          {isActive && (
            <Animated.View style={[styles.glowCircle, glowStyle]}>
              <LinearGradient
                colors={[
                  themeColors.primary + "40",
                  themeColors.primary + "10",
                  "transparent",
                ]}
                style={styles.glowGradient}
              />
            </Animated.View>
          )}

          <Animated.View style={[styles.stepCircle, animatedStyle]}>
            {isCompleted ? (
              // Beautiful green checkmark for completed steps
              <LinearGradient
                colors={["#26DE81", "#2ED573"]}
                style={styles.completedCircle}
              >
                <Icon name="check-circle" size={28} color="#FFFFFF" />
              </LinearGradient>
            ) : (
              <View
                style={[
                  styles.stepCircleInner,
                  {
                    backgroundColor: isActive
                      ? themeColors.primary
                      : themeColors.background,
                    borderColor: isActive
                      ? themeColors.primary
                      : themeColors.border,
                    borderWidth: isActive ? 3 : 2,
                  },
                ]}
              >
                <Icon
                  name={step.iconName}
                  size={isActive ? 26 : 22}
                  color={isActive ? "#FFFFFF" : themeColors.text}
                />
              </View>
            )}
          </Animated.View>
        </View>

        <Text
          style={[
            styles.stepLabel,
            {
              color: isActive
                ? themeColors.primary
                : isCompleted
                ? "#26DE81"
                : themeColors.text,
              fontWeight: isActive || isCompleted ? "600" : "400",
            },
          ]}
        >
          {step.title}
        </Text>
      </View>
    );
  };

  const ConnectorLine = ({ index }: { index: number }) => {
    const lineStyle = useAnimatedStyle(() => {
      const lineProgress = interpolate(
        progress.value,
        [index / (steps.length - 1), (index + 1) / (steps.length - 1)],
        [0, 100],
        Extrapolate.CLAMP
      );

      return {
        width: withTiming(`${lineProgress}%`, {
          duration: 600,
          easing: Easing.out(Easing.quad),
        }),
      };
    });

    return (
      <View
        style={[
          styles.connector,
          { backgroundColor: themeColors.border + "40" },
        ]}
      >
        <Animated.View style={lineStyle}>
          <LinearGradient
            colors={["#26DE81", "#2ED573"]}
            style={styles.connectorFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          />
        </Animated.View>
      </View>
    );
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: themeColors.card,
          borderBottomColor: themeColors.border,
        },
      ]}
    >
      <View style={styles.stepsRow}>
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <StepItem step={step} index={index} />
            {index < steps.length - 1 && <ConnectorLine index={index} />}
          </React.Fragment>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stepContainer: {
    alignItems: "center",
    maxWidth: (width - 32) / 4,
  },
  stepCircleContainer: {
    position: "relative",
    marginBottom: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircle: {
    width: STEP_SIZE,
    height: STEP_SIZE,
    borderRadius: STEP_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  stepCircleInner: {
    width: "100%",
    height: "100%",
    borderRadius: STEP_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  glowCircle: {
    position: "absolute",
    width: STEP_SIZE * 1.5,
    height: STEP_SIZE * 1.5,
    borderRadius: (STEP_SIZE * 1.5) / 2,
    top: -STEP_SIZE * 0.25,
    left: -STEP_SIZE * 0.25,
  },
  glowGradient: {
    width: "100%",
    height: "100%",
    borderRadius: (STEP_SIZE * 1.5) / 2,
  },
  completedCircle: {
    width: "100%",
    height: "100%",
    borderRadius: STEP_SIZE / 2,
    justifyContent: "center",
    alignItems: "center",
  },
  stepLabel: {
    fontSize: 12,
    textAlign: "center",
    fontFamily: "Staatliches-Regular",
    marginTop: 4,
  },
  connector: {
    flex: 1,
    height: CONNECTOR_HEIGHT,
    borderRadius: CONNECTOR_HEIGHT / 2,
    marginHorizontal: 8,
    overflow: "hidden",
    position: "relative",
  },
  connectorFill: {
    height: "100%",
    borderRadius: CONNECTOR_HEIGHT / 2,
  },
});

export default AnimatedStepper;
