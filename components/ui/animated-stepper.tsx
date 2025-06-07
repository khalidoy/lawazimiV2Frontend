import React from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import { Text } from "./text";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  withRepeat,
  withSpring,
  Easing,
  interpolate,
  Extrapolate,
  runOnJS,
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { NAV_THEME } from "~/lib/constants";

const { width } = Dimensions.get("window");

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
  const themeColors = isDark ? NAV_THEME.dark : NAV_THEME.light;
  // Enhanced Progress bar animations
  const progressWidth = useSharedValue(0);
  const progressGradientOffset = useSharedValue(0);
  const progressPulse = useSharedValue(1);
  const progressGlow = useSharedValue(0);
  const progressWaveOffset = useSharedValue(0);
  const progressElectricOffset = useSharedValue(0);

  // Scanner effects for progress bar
  const scanner1X = useSharedValue(-100);
  const scanner2X = useSharedValue(-120);
  const scannerOpacity = useSharedValue(0);

  // Multi-layer shimmer effects
  const shimmer1X = useSharedValue(-200);
  const shimmer2X = useSharedValue(-150);
  const shimmer3X = useSharedValue(-100);
  const shimmerOpacity = useSharedValue(0);

  // Progress segment animations
  const segmentPulses = steps.map(() => useSharedValue(0));
  const segmentGlows = steps.map(() => useSharedValue(0));

  // Step animations
  const stepScales = steps.map(() => useSharedValue(1));
  const stepRotations = steps.map(() => useSharedValue(0));
  const stepGlows = steps.map(() => useSharedValue(0)); // Enhanced particle system - REMOVED
  // const particle1X = useSharedValue(0);
  // const particle2X = useSharedValue(0);
  // const particle3X = useSharedValue(0);
  // const particle4X = useSharedValue(0);
  // const particle5X = useSharedValue(0);
  // const particleOpacity = useSharedValue(0);
  // const sparkleOpacity = useSharedValue(0);

  // Electric/Lightning effect
  const lightningOpacity = useSharedValue(0);
  const lightningScale = useSharedValue(1);

  // Ripple animations
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  // Icon bounce animation
  const iconBounce = useSharedValue(1);
  // ===== ENHANCED ACTIVE STEP ANIMATIONS =====
  // Dynamic glow intensity
  const glowIntensity = useSharedValue(0);
  const glowRadius = useSharedValue(0);

  // Step breathing with color shift
  const breathingScale = useSharedValue(1);
  const colorShift = useSharedValue(0);
  React.useEffect(() => {
    // Enhanced progress calculation for perfect step centering
    // Progress bar: left: 50px, right: 50px - available width calculation
    // Steps are distributed with justifyContent: 'space-between' and flex: 1
    // Each step icon is centered within its flex area

    let targetProgress;

    if (currentStep === 0) {
      // First step: progress starts at 0% to align with first step center
      targetProgress = 0;
    } else if (currentStep === steps.length - 1) {
      // Last step: calculate exact position to align with last step icon
      // For justifyContent: 'space-between', last step is at the end of available space
      // Account for step icon width (60px) and container padding
      // Progress should stop at approximately 75% to align with last step center
      targetProgress = 75;
    } else {
      // Intermediate steps: linear interpolation between 0% and 75%
      const maxProgress = 75; // Match with last step positioning
      const progressPerStep = maxProgress / (steps.length - 1);
      targetProgress = currentStep * progressPerStep;
    }

    // Enhanced progress bar animation with elastic bounce
    progressWidth.value = withSpring(targetProgress, {
      damping: 12,
      stiffness: 80,
      mass: 1.2,
    });

    // Multi-layer flowing gradient effects
    progressGradientOffset.value = withRepeat(
      withTiming(1, { duration: 1800, easing: Easing.linear }),
      -1,
      false
    );

    // Progress bar glow pulse
    progressGlow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) }),
        withTiming(0.4, { duration: 1200, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    // Wave motion effect
    progressWaveOffset.value = withRepeat(
      withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
      -1,
      false
    ); // Electric flow effect
    progressElectricOffset.value = withRepeat(
      withTiming(1, { duration: 800, easing: Easing.linear }),
      -1,
      false
    ); // Enhanced scanner effects for progress bar with improved positioning
    if (currentStep > 0) {
      scannerOpacity.value = withTiming(0.8, { duration: 400 });

      // Primary scanner line - sweeps to current progress position
      scanner1X.value = withRepeat(
        withSequence(
          withTiming(-100, { duration: 0 }),
          withDelay(
            150,
            withTiming(targetProgress + 40, {
              // Sweep to current progress + smaller buffer
              duration: 1500,
              easing: Easing.out(Easing.quad),
            })
          )
        ),
        -1,
        false
      );

      // Secondary scanner line with complementary sweep
      scanner2X.value = withRepeat(
        withSequence(
          withTiming(-120, { duration: 0 }),
          withDelay(
            600,
            withTiming(targetProgress + 55, {
              // Slightly further sweep
              duration: 1800,
              easing: Easing.out(Easing.cubic),
            })
          )
        ),
        -1,
        false
      );
    } else {
      scannerOpacity.value = withTiming(0, { duration: 300 });
    }

    // Multi-layer shimmer effects with staggered timing
    shimmer1X.value = withRepeat(
      withSequence(
        withTiming(-200, { duration: 0 }),
        withDelay(
          300,
          withTiming(width + 200, {
            duration: 1200,
            easing: Easing.out(Easing.quad),
          })
        )
      ),
      -1,
      false
    );

    shimmer2X.value = withRepeat(
      withSequence(
        withTiming(-150, { duration: 0 }),
        withDelay(
          600,
          withTiming(width + 150, {
            duration: 1400,
            easing: Easing.out(Easing.cubic),
          })
        )
      ),
      -1,
      false
    );
    shimmer3X.value = withRepeat(
      withSequence(
        withTiming(-100, { duration: 0 }),
        withDelay(
          900,
          withTiming(width + 100, {
            duration: 1600,
            easing: Easing.out(Easing.cubic),
          })
        )
      ),
      -1,
      false
    );

    // Enhanced shimmer visibility
    shimmerOpacity.value =
      currentStep > 0
        ? withRepeat(
            withSequence(
              withTiming(0.8, { duration: 800 }),
              withTiming(0.3, { duration: 800 })
            ),
            -1,
            true
          )
        : withTiming(0, { duration: 300 });

    // Reset all step animations
    stepScales.forEach((scale, index) => {
      scale.value = withTiming(1, { duration: 300 });
      stepRotations[index].value = withTiming(0, { duration: 300 });
      stepGlows[index].value = withTiming(0, { duration: 300 });
    });

    // Animate segment pulses for completed sections
    segmentPulses.forEach((pulse, index) => {
      if (index < currentStep) {
        pulse.value = withRepeat(
          withSequence(
            withTiming(1, {
              duration: 800 + index * 200,
              easing: Easing.inOut(Easing.quad),
            }),
            withTiming(0.6, {
              duration: 800 + index * 200,
              easing: Easing.inOut(Easing.quad),
            })
          ),
          -1,
          true
        );
      } else {
        pulse.value = withTiming(0, { duration: 400 });
      }
    });
    // Animate current step with enhanced effects
    if (currentStep < stepScales.length) {
      // ===== VERSION 1: ORBITAL RING ANIMATION =====
      // Enhanced ripple effect with multiple waves
      rippleScale.value = 0;
      rippleOpacity.value = 0;
      rippleScale.value = withRepeat(
        withSequence(
          withTiming(0, { duration: 0 }),
          withTiming(1.6, { duration: 1200, easing: Easing.out(Easing.quad) }),
          withTiming(2, { duration: 800, easing: Easing.out(Easing.quad) })
        ),
        -1,
        false
      );
      rippleOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 200 }),
          withTiming(0.3, { duration: 600 }),
          withTiming(0, { duration: 1200 })
        ),
        -1,
        false
      );

      // Dynamic glow that intensifies and expands
      glowIntensity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.3, { duration: 1000, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
      glowRadius.value = withRepeat(
        withSequence(
          withTiming(1.15, {
            duration: 1200,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(1.05, { duration: 1200, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      ); // Breathing effect with subtle scale changes - bigger active step
      breathingScale.value = withRepeat(
        withSequence(
          withTiming(1.25, {
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1.15, {
            duration: 1500,
            easing: Easing.inOut(Easing.quad),
          })
        ),
        -1,
        true
      );

      // Color shift effect for dynamic visuals
      colorShift.value = withRepeat(
        withTiming(1, { duration: 3000, easing: Easing.linear }),
        -1,
        false
      );

      // Enhanced icon bounce with rotation
      iconBounce.value = withSequence(
        withSpring(1.3, { damping: 8, stiffness: 300 }),
        withSpring(1.05, { damping: 12, stiffness: 200 }),
        withSpring(1, { damping: 15, stiffness: 150 })
      ); // Lightning effects disabled
      lightningOpacity.value = withTiming(0, { duration: 300 });

      // Enhanced step glow
      stepGlows[currentStep].value = withRepeat(
        withSequence(
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.quad) }),
          withTiming(0.4, { duration: 800, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      ); // Icon rotation disabled - no wobble
      stepRotations[currentStep].value = withTiming(0, { duration: 300 });

      // Scale breathing
      stepScales[currentStep].value = withRepeat(
        withSequence(
          withTiming(1.08, {
            duration: 1200,
            easing: Easing.inOut(Easing.quad),
          }),
          withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.quad) })
        ),
        -1,
        true
      );
    } else {
      // Reset all active step animations when no step is active
      glowIntensity.value = withTiming(0, { duration: 400 });
    } // Enhanced particle system removed
    // particleOpacity.value = withTiming(0, { duration: 400 });
    // sparkleOpacity.value = withTiming(0, { duration: 400 });
  }, [currentStep, steps.length]); // Enhanced Animated styles
  const progressStyle = useAnimatedStyle(() => ({
    width: `${progressWidth.value}%`,
  }));

  const progressPulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: progressPulse.value }],
  }));

  const progressGlowStyle = useAnimatedStyle(() => ({
    opacity: progressGlow.value,
  }));

  const progressGradientStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progressGradientOffset.value,
          [0, 1],
          [-200, 200]
        ),
      },
    ],
  }));

  const progressWaveStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          progressWaveOffset.value,
          [0, 0.5, 1],
          [0, -2, 0],
          Extrapolate.CLAMP
        ),
      },
    ],
  }));
  const progressElectricStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateX: interpolate(
          progressElectricOffset.value,
          [0, 1],
          [-100, 100]
        ),
      },
    ],
    opacity: interpolate(
      progressElectricOffset.value,
      [0, 0.3, 0.7, 1],
      [0, 1, 1, 0]
    ),
  }));
  const scanner1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: scanner1X.value }],
    opacity: interpolate(
      scanner1X.value,
      [-100, -20, 40, 100],
      [0, 1, 0.7, 0],
      Extrapolate.CLAMP
    ),
  }));

  const scanner2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: scanner2X.value }],
    opacity: interpolate(
      scanner2X.value,
      [-120, -20, 50, 120],
      [0, 0.6, 0.4, 0],
      Extrapolate.CLAMP
    ),
  }));

  const shimmer1Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer1X.value }],
    opacity: shimmerOpacity.value,
  }));

  const shimmer2Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer2X.value }],
    opacity: shimmerOpacity.value * 0.7,
  }));

  const shimmer3Style = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer3X.value }],
    opacity: shimmerOpacity.value * 0.5,
  }));

  const rippleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: rippleScale.value }],
    opacity: rippleOpacity.value,
  }));

  const lightningStyle = useAnimatedStyle(() => ({
    opacity: lightningOpacity.value,
    transform: [{ scale: lightningScale.value }],
  }));
  // Particle styles removed
  // const particle1Style = useAnimatedStyle(() => ({ ... }));
  // const particle2Style = useAnimatedStyle(() => ({ ... }));
  // const particle3Style = useAnimatedStyle(() => ({ ... }));
  // const particle4Style = useAnimatedStyle(() => ({ ... }));
  // const particle5Style = useAnimatedStyle(() => ({ ... }));
  // const sparkleStyle = useAnimatedStyle(() => ({ ... }));

  const getStepStyle = (index: number) => {
    return useAnimatedStyle(() => ({
      transform: [
        { scale: stepScales[index].value },
        { rotate: `${stepRotations[index].value}deg` },
        { scale: index === currentStep ? iconBounce.value : 1 },
      ],
    }));
  };
  const getStepGlowStyle = (index: number) => {
    return useAnimatedStyle(() => ({
      opacity: stepGlows[index].value,
    }));
  };
  // ===== ENHANCED ACTIVE STEP ANIMATED STYLES =====
  const dynamicGlowStyle = useAnimatedStyle(() => ({
    opacity: glowIntensity.value,
    transform: [{ scale: glowRadius.value }],
  }));

  const breathingStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
  }));

  const colorShiftStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      colorShift.value,
      [0, 0.5, 1],
      [1, 0.7, 1],
      Extrapolate.CLAMP
    ),
  }));
  const getSegmentPulseStyle = (index: number) => {
    return useAnimatedStyle(() => ({
      opacity: segmentPulses[index].value,
    }));
  };

  const progressSegmentStyle = useAnimatedStyle(() => ({
    opacity: progressPulse.value,
    transform: [{ scaleY: progressPulse.value }],
  }));

  const renderStep = (step: Step, index: number) => {
    const isActive = index === currentStep;
    const isCompleted = index < currentStep;
    const isFuture = index > currentStep;

    return (
      <View key={step.key} style={styles.stepContainer}>
        <View style={styles.stepIconContainer}>
          {/* Enhanced ripple effect */}
          {isActive && (
            <Animated.View
              style={[
                styles.ripple,
                rippleStyle,
                { backgroundColor: themeColors.primary + "15" },
              ]}
            />
          )}

          {/* Step icon with enhanced breathing and color effects */}
          <Animated.View
            style={[
              styles.stepIcon,
              isCompleted && [
                styles.completedStep,
                { backgroundColor: themeColors.primary },
              ],
              isActive && [
                styles.activeStep,
                { backgroundColor: themeColors.primary },
                breathingStyle,
                colorShiftStyle,
              ],
              isFuture && [
                styles.futureStep,
                {
                  backgroundColor: isDark ? themeColors.card : "#F3F4F6",
                  borderColor: themeColors.border,
                },
              ],
              getStepStyle(index),
            ]}
          >
            {" "}
            {/* Enhanced dynamic glow effect for active step */}
            {isActive && (
              <>
                <Animated.View
                  style={[
                    styles.glow,
                    getStepGlowStyle(index),
                    { backgroundColor: themeColors.primary + "40" },
                  ]}
                />

                {/* Additional dynamic glow layer */}
                <Animated.View
                  style={[
                    styles.dynamicGlow,
                    dynamicGlowStyle,
                    { backgroundColor: themeColors.primary + "20" },
                  ]}
                />

                {/* Lightning effects for active step */}
                <Animated.View style={[styles.lightning, lightningStyle]}>
                  <View
                    style={[
                      styles.lightningBolt,
                      { backgroundColor: "#FFFFFF" },
                    ]}
                  />
                </Animated.View>
              </>
            )}
            <Animated.View
              style={index === currentStep ? getStepStyle(index) : {}}
            >
              <Icon
                name={isCompleted ? "check" : step.iconName}
                size={24}
                color={
                  isCompleted || isActive
                    ? "#FFFFFF"
                    : isDark
                    ? themeColors.text
                    : "#9CA3AF"
                }
                style={{ zIndex: 10 }}
              />
            </Animated.View>
          </Animated.View>
        </View>

        <Text
          style={[
            styles.stepTitle,
            {
              color:
                isActive || isCompleted
                  ? themeColors.primary
                  : themeColors.text,
            },
            isActive && styles.activeStepTitle,
            isCompleted && styles.completedStepTitle,
            { fontFamily: "Staatliches-Regular" },
          ]}
        >
          {step.title}
        </Text>
      </View>
    );
  };
  return (
    <View style={styles.container}>
      {" "}
      <View style={styles.progressContainer}>
        {/* Progress line background */}
        <View
          style={[
            styles.progressLine,
            { backgroundColor: isDark ? themeColors.border : "#E5E7EB" },
          ]}
        />

        {/* Animated progress border glow */}
        {currentStep > 0 && (
          <Animated.View style={[styles.progressBorderGlow, progressGlowStyle]}>
            <LinearGradient
              colors={[
                "transparent",
                themeColors.primary + "20",
                themeColors.primary + "40",
                themeColors.primary + "20",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
        )}

        {/* Active progress line with gradient */}
        <Animated.View style={[styles.activeProgressLine, progressStyle]}>
          {/* Multi-layer progress bar with complex animations */}
          <LinearGradient
            colors={[
              themeColors.primary,
              themeColors.primary + "DD",
              themeColors.primary + "BB",
              themeColors.primary + "88",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[StyleSheet.absoluteFillObject]}
          />
          {/* Pulsing glow layer */}
          <Animated.View style={[styles.progressGlowLayer, progressGlowStyle]}>
            <LinearGradient
              colors={[
                themeColors.primary + "40",
                themeColors.primary + "80",
                themeColors.primary + "40",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          {/* Wave motion effect */}
          <Animated.View style={[styles.progressWaveLayer, progressWaveStyle]}>
            <LinearGradient
              colors={[
                "transparent",
                themeColors.primary + "30",
                themeColors.primary + "60",
                themeColors.primary + "30",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          {/* Electric flow effect */}
          <Animated.View
            style={[styles.progressElectricLayer, progressElectricStyle]}
          >
            <LinearGradient
              colors={[
                "transparent",
                "#FFFFFF80",
                "#FFFFFF",
                "#FFFFFF80",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />{" "}
          </Animated.View>
          {/* Scanner effects for progress bar */}
          <Animated.View style={[styles.scannerLayer1, scanner1Style]}>
            <LinearGradient
              colors={[
                "transparent",
                themeColors.primary + "60",
                "#FFFFFF90",
                themeColors.primary + "60",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <Animated.View style={[styles.scannerLayer2, scanner2Style]}>
            <LinearGradient
              colors={[
                "transparent",
                themeColors.primary + "40",
                "#FFFFFF70",
                themeColors.primary + "40",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          {/* Multi-layer shimmer effects */}
          <Animated.View style={[styles.shimmerLayer1, shimmer1Style]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <Animated.View style={[styles.shimmerLayer2, shimmer2Style]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.3)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          <Animated.View style={[styles.shimmerLayer3, shimmer3Style]}>
            <LinearGradient
              colors={["transparent", "rgba(255,255,255,0.2)", "transparent"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>{" "}
          {/* Flowing gradient overlay */}
          <Animated.View
            style={[styles.gradientOverlay, progressGradientStyle]}
          >
            <LinearGradient
              colors={[
                "transparent",
                themeColors.primary + "20",
                themeColors.primary + "40",
                themeColors.primary + "60",
                themeColors.primary + "40",
                themeColors.primary + "20",
                "transparent",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>
          {/* Progress segments for completed sections */}
          {currentStep > 0 &&
            Array.from({ length: currentStep }, (_, i) => (
              <Animated.View
                key={`segment-${i}`}
                style={[
                  styles.progressSegment,
                  {
                    left: `${(i / (steps.length - 1)) * 100}%`,
                    width: `${(1 / (steps.length - 1)) * 100}%`,
                  },
                  progressSegmentStyle,
                ]}
              >
                <LinearGradient
                  colors={[
                    themeColors.primary + "80",
                    themeColors.primary,
                    themeColors.primary + "80",
                  ]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={StyleSheet.absoluteFillObject}
                />
              </Animated.View>
            ))}
        </Animated.View>

        {/* Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => renderStep(step, index))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 15,
    paddingVertical: 20,
    width: "100%",
  },
  progressContainer: {
    position: "relative",
    width: "100%",
  },
  progressLine: {
    position: "absolute",
    top: 30,
    left: 50,
    right: 50,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    zIndex: 1,
  },
  progressBorderGlow: {
    position: "absolute",
    top: 28,
    left: 48,
    right: 48,
    height: 8,
    borderRadius: 4,
    zIndex: 0,
  },
  activeProgressLine: {
    position: "absolute",
    top: 30,
    left: 50,
    height: 4,
    borderRadius: 2,
    zIndex: 2,
    overflow: "hidden",
  },
  shimmerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    height: "100%",
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 200,
    height: "100%",
  },
  progressGlowLayer: {
    position: "absolute",
    top: -2,
    left: -2,
    right: -2,
    bottom: -2,
    borderRadius: 4,
    overflow: "hidden",
  },
  progressWaveLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 150,
    overflow: "hidden",
  },
  progressElectricLayer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 80,
    overflow: "hidden",
  },
  scannerLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 60,
    height: "100%",
    overflow: "hidden",
    zIndex: 10,
  },
  scannerLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 40,
    height: "100%",
    overflow: "hidden",
    zIndex: 9,
  },
  shimmerLayer1: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 120,
    overflow: "hidden",
  },
  shimmerLayer2: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 100,
    overflow: "hidden",
  },
  shimmerLayer3: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: 80,
    overflow: "hidden",
  },
  lightning: {
    position: "absolute",
    top: -15,
    left: -15,
    right: -15,
    bottom: -15,
    zIndex: 2,
    alignItems: "center",
    justifyContent: "center",
  },
  lightningBolt: {
    width: 2,
    height: 90,
    borderRadius: 1,
    shadowColor: "#FFFFFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 10,
  },
  progressSegment: {
    position: "absolute",
    top: 0,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    zIndex: 1,
  },
  stepsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 0,
    zIndex: 3,
  },
  stepContainer: {
    alignItems: "center",
    flex: 1,
    zIndex: 4,
    paddingHorizontal: 8,
  },
  stepIconContainer: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  ripple: {
    position: "absolute",
    width: 68,
    height: 68,
    borderRadius: 34,
    top: -4,
    left: -4,
    zIndex: 1,
  },
  stepIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    overflow: "hidden",
    zIndex: 5,
  },
  completedStep: {
    shadowColor: NAV_THEME.light.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  activeStep: {
    shadowColor: NAV_THEME.light.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
  },
  futureStep: {
    borderWidth: 2,
  },
  glow: {
    position: "absolute",
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 36,
    backgroundColor: "rgba(76, 205, 196, 0.3)",
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 15,
    elevation: 20,
    zIndex: 1,
  },
  dynamicGlow: {
    position: "absolute",
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 36,
    shadowColor: "#4ECDC4",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 18,
    elevation: 15,
    zIndex: 0,
  },
  stepTitle: {
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
    maxWidth: 90,
  },
  activeStepTitle: {
    fontWeight: "600",
  },
  completedStepTitle: {
    fontWeight: "500",
  },
});

export default AnimatedStepper;
