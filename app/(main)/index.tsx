import * as React from "react";
import { View, StyleSheet, Animated, Easing, Dimensions } from "react-native"; // Added Easing, Dimensions
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { router, Link, useRouter } from "expo-router"; // Ensure useRouter is imported
import { Check, File, User, MapPin, ShoppingBag } from "lucide-react-native";

// Import modular step components
import UploadStep from "~/components/checkout/UploadStep";
import PersonalInfoStep from "~/components/checkout/PersonalInfoStep";
import LocationStep from "~/components/checkout/LocationStep";
import ReviewStep from "~/components/checkout/ReviewStep";

import { useColorScheme } from "~/lib/useColorScheme"; // Import useColorScheme
import { THEME_COLORS } from "~/lib/constants"; // Import THEME_COLORS

export default function HomeScreen() {
  const router = useRouter(); // Initialize router
  // State setup for the multi-step process
  const [currentStep, setCurrentStep] = React.useState(0);
  const [steps] = React.useState([
    { key: "choose", title: "Choisir", icon: File },
    { key: "info", title: "Info", icon: User },
    { key: "location", title: "Location", icon: MapPin },
    { key: "order", title: "Commander", icon: ShoppingBag },
  ]);

  // Animated value for the progress bar
  const progressAnimation = React.useRef(new Animated.Value(0)).current;
  // Animated value for the moving lines
  const lineAnimation = React.useRef(new Animated.Value(0)).current;

  const { width: screenWidth } = Dimensions.get("window");
  const PATTERN_UNIT_WIDTH = 50; // Width of one stripe + gap
  // Calculate number of units needed to cover the max progress bar width (80% of screen) + some buffer for animation
  const NUM_STRIPE_UNITS =
    Math.ceil((screenWidth * 0.8) / PATTERN_UNIT_WIDTH) + 3;

  React.useEffect(() => {
    // Animate progress bar fill when currentStep changes
    const targetValue = steps.length > 1 ? currentStep / (steps.length - 1) : 0;
    Animated.timing(progressAnimation, {
      toValue: targetValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentStep, steps.length, progressAnimation]);

  React.useEffect(() => {
    // Looping animation for the moving lines
    Animated.loop(
      Animated.timing(lineAnimation, {
        toValue: 1,
        duration: 800, // Adjust duration for speed of lines
        useNativeDriver: true, // translateX is supported
        easing: Easing.linear,
      })
    ).start();
  }, [lineAnimation]);

  // Form state
  const [clientName, setClientName] = React.useState("");
  const [clientPhone, setClientPhone] = React.useState("");
  const [selectedItems, setSelectedItems] = React.useState<any[]>([]);
  const [uploadedImages, setUploadedImages] = React.useState<string[]>([]);
  const [position, setPosition] = React.useState<{
    latitude: number | null;
    longitude: number | null;
  }>({
    latitude: null,
    longitude: null,
  });

  // Add state for file metadata
  const [fileMetadata, setFileMetadata] = React.useState<
    Record<string, string>
  >({});

  // Add a state to track if uploading is happening in child components
  const [isChildUploading, setIsChildUploading] = React.useState(false);

  // Validation functions
  const canGoBack = () => {
    return currentStep > 0;
  };

  const canProceedStep1 = () => {
    return selectedItems.length > 0 || uploadedImages.length > 0;
  };

  const canProceedStep2 = () => {
    return clientName !== "" && clientPhone !== "";
  };

  const canProceedStep3 = () => {
    return position.latitude !== null;
  };

  // Navigation functions
  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleSubmitOrder = () => {
    // Here you would submit the order to your backend
    console.log("Order submitted with:", {
      clientName,
      clientPhone,
      selectedItems,
      uploadedImages,
      position,
    });
    // Navigate to orders screen after submission
    router.replace("/orders");
  };

  // Function to let child components notify parent about upload status
  const handleUploadStatusChange = (isUploading: boolean) => {
    setIsChildUploading(isUploading);
  };

  // Render step content using the modular components
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <UploadStep
            onNext={goToNextStep}
            onUploadImage={setUploadedImages}
            onSelectItems={setSelectedItems} // This likely won't be used if choosing manually from store
            selectedItems={selectedItems} // Pass through, might be used for other upload options
            uploadedImages={uploadedImages}
            fileMetadata={fileMetadata}
            onFileMetadataChange={setFileMetadata}
            onUploadStatusChange={handleUploadStatusChange}
            // router={router} // Pass router if UploadStep needs to navigate directly
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            onNext={goToNextStep}
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
          />
        );
      case 2:
        return (
          <LocationStep
            onNext={goToNextStep}
            onLocationSelected={setPosition}
            position={position}
          />
        );
      case 3:
        return (
          <ReviewStep
            onComplete={handleSubmitOrder}
            customerInfo={{
              name: clientName,
              phone: clientPhone,
            }}
            deliveryLocation={position}
            items={selectedItems}
            images={uploadedImages}
          />
        );
      default:
        return null;
    }
  };

  const { isDarkColorScheme } = useColorScheme(); // Get theme status
  const colors = isDarkColorScheme ? THEME_COLORS.dark : THEME_COLORS.light; // Get current theme colors

  // Determine text color for the "Étape suivante" button based on theme
  // Using a very light color for dark orange, and a very dark color for light orange if needed.
  // For a standard orange, white or a very dark gray usually works.
  const etapeSuivanteTextColor = colors["primary-foreground"]; // Default to primary-foreground

  return (
    <View style={styles.container} className="bg-background">
      {/* Improved Step indicator with reusable components */}
      <View className="bg-card border-b border-border pt-4 pb-3">
        {/* Progress Bar Track */}
        <View className="bg-border h-2.5 w-4/5 absolute top-9 left-[10%] z-0 rounded-full">
          {/* Animated Progress Fill */}
          <Animated.View
            style={{
              height: "100%",
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              backgroundColor: "green", // Changed from "orange" to "green"
              borderRadius: 9999,
              overflow: "hidden", // Clip the moving lines
            }}
          >
            {/* Moving Lines Container */}
            <Animated.View
              style={{
                width: NUM_STRIPE_UNITS * PATTERN_UNIT_WIDTH,
                height: "100%",
                flexDirection: "row",
                transform: [
                  {
                    translateX: lineAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, -PATTERN_UNIT_WIDTH], // Move one pattern unit to the left
                    }),
                  },
                ],
              }}
            >
              {Array.from({ length: NUM_STRIPE_UNITS }).map((_, index) => (
                <View
                  key={`stripe-unit-${index}`}
                  style={{ flexDirection: "row" }}
                >
                  <View
                    style={{
                      width: 10, // Width of the visible stripe
                      height: "100%",
                      backgroundColor: "rgba(255, 255, 255, 0.3)", // Light, semi-transparent color for lines
                      transform: [{ skewX: "-30deg" }], // Make lines diagonal
                    }}
                  />
                  <View style={{ width: 40, height: "100%" }} />
                  {/* Gap after stripe */}
                </View>
              ))}
            </Animated.View>
          </Animated.View>
        </View>
        <View className="flex-row w-full px-5 justify-between z-10">
          {steps.map((step, i) => (
            <View key={i} className="items-center">
              {i < currentStep ? (
                // Completed step
                <View
                  className="rounded-full border-2 w-12 h-12 items-center justify-center mb-2 shadow-lg"
                  style={{
                    backgroundColor: colors.success,
                    borderColor: colors.success,
                  }}
                >
                  <Check color={colors["success-foreground"]} size={24} />
                </View>
              ) : i === currentStep ? (
                // Current step
                <View className="rounded-full bg-primary border-2 border-primary w-12 h-12 items-center justify-center mb-2 shadow-lg">
                  <step.icon color={"orange"} size={24} />{" "}
                  {/* Icon color reverted to orange */}
                </View>
              ) : (
                // Future step
                <View className="rounded-full bg-muted border-2 border-border w-12 h-12 items-center justify-center mb-2 shadow-md">
                  <step.icon color={colors["muted-foreground"]} size={24} />
                </View>
              )}
              <Text
                className={
                  i === currentStep
                    ? "text-primary font-medium text-sm"
                    : "text-muted-foreground text-sm"
                }
              >
                {step.title}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Main content area - render the current step */}
      <View className="flex-1">
        {currentStep === 0 && (
          <View className="p-4 items-center">
            {" "}
            {/* Added items-center for centering */}
            <Text className="text-lg font-semibold mb-2 text-center text-foreground">
              {" "}
              {/* Added text-center */}
              Choisissez vos produits
            </Text>
            <Text className="text-sm text-muted-foreground text-center">
              {" "}
              {/* Added text-center */}
              Remplissez le formulaire ci-dessous pour passer votre commande ou
              choisissez manuellement.
            </Text>
          </View>
        )}
        {renderStepContent()}
      </View>

      {/* Navigation buttons at bottom - add padding when uploading */}
      <View
        className={`flex-row p-4 bg-card border-t border-border items-center ${
          isChildUploading ? "pb-20" : ""
        }`}
      >
        <Button
          variant="outline"
          onPress={goToPreviousStep}
          disabled={!canGoBack()}
          className="flex-1 mr-2 shadow-md"
        >
          <Text className="text-primary">Étape précédente</Text>
        </Button>

        {/* Next step or submit button */}
        {currentStep < 3 ? (
          <Button
            onPress={goToNextStep}
            disabled={
              (currentStep === 0 && !canProceedStep1()) ||
              (currentStep === 1 && !canProceedStep2()) ||
              (currentStep === 2 && !canProceedStep3())
            }
            style={[
              {
                // Common styles for the button
                // Add any other common styles here if needed
              },
              (currentStep === 0 && !canProceedStep1()) ||
              (currentStep === 1 && !canProceedStep2()) ||
              (currentStep === 2 && !canProceedStep3())
                ? { backgroundColor: colors.muted } // Muted background when disabled
                : { backgroundColor: "orange" }, // Apply orange background when not disabled
            ]}
            className="flex-1 ml-2 shadow-md"
          >
            <Text style={{ color: etapeSuivanteTextColor, fontWeight: "bold" }}>
              Étape suivante
            </Text>
          </Button>
        ) : (
          <Button
            onPress={handleSubmitOrder}
            className="flex-1 ml-2 shadow-md"
            style={{ backgroundColor: colors.success }} // Use theme success color
          >
            <Text
              style={{
                color: colors["success-foreground"],
                fontWeight: "bold",
              }}
            >
              Commander!
            </Text>
          </Button>
        )}
      </View>
    </View>
  );
}

// Remove the styles that we replaced with className
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
