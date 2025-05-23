import * as React from "react";
import { View, StyleSheet, Animated, Dimensions } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import UploadStep from "~/components/checkout/UploadStep";
import PersonalInfoStep from "~/components/checkout/PersonalInfoStep";
import LocationStep from "~/components/checkout/LocationStep";
import ReviewStep from "~/components/checkout/ReviewStep";

import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";

const { width } = Dimensions.get("window");
const STEP_CIRCLE_DIAMETER = 36;
const CONNECTOR_HEIGHT = 4;

export default function HomeScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const steps = [
    { key: "choose", title: "Choisir", iconName: "clipboard-file-outline" },
    { key: "info", title: "Info", iconName: "account-details-outline" },
    { key: "location", title: "Location", iconName: "map-marker-outline" },
    { key: "order", title: "Commander", iconName: "playlist-check" },
  ];

  const progressAnim = React.useRef(new Animated.Value(0)).current;

  const { isDarkColorScheme } = useColorScheme();
  const themeColors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  React.useEffect(() => {
    const targetProgress =
      steps.length > 1 ? currentStep / (steps.length - 1) : 0;
    Animated.timing(progressAnim, {
      toValue: targetProgress,
      duration: 350,
      useNativeDriver: false,
    }).start();
  }, [currentStep, steps.length, progressAnim]);

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
  const [fileMetadata, setFileMetadata] = React.useState<
    Record<string, string>
  >({});
  const [isUploading, setIsUploading] = React.useState(false);

  const canProceed1 = () =>
    selectedItems.length > 0 || uploadedImages.length > 0;
  const canProceed2 = () => clientName !== "" && clientPhone !== "";
  const canProceed3 = () => position.latitude !== null;

  const goBack = () => currentStep > 0 && setCurrentStep(currentStep - 1);
  const goNext = () =>
    currentStep < steps.length - 1 && setCurrentStep(currentStep + 1);

  const submit = () => {
    console.log("Order:", {
      clientName,
      clientPhone,
      selectedItems,
      uploadedImages,
      position,
    });
    router.replace("/orders");
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <UploadStep
            onNext={goNext}
            onUploadImage={setUploadedImages}
            onSelectItems={setSelectedItems}
            selectedItems={selectedItems}
            uploadedImages={uploadedImages}
            fileMetadata={fileMetadata}
            onFileMetadataChange={setFileMetadata}
            onUploadStatusChange={setIsUploading}
          />
        );
      case 1:
        return (
          <PersonalInfoStep
            onNext={goNext}
            clientName={clientName}
            setClientName={setClientName}
            clientPhone={clientPhone}
            setClientPhone={setClientPhone}
          />
        );
      case 2:
        return (
          <LocationStep
            onNext={goNext}
            onLocationSelected={setPosition}
            position={position}
          />
        );
      case 3:
        return (
          <ReviewStep
            onComplete={submit}
            customerInfo={{ name: clientName, phone: clientPhone }}
            deliveryLocation={position}
            items={selectedItems}
            images={uploadedImages}
          />
        );
      default:
        return null;
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: themeColors.background }]}
    >
      <View style={styles.stepperContainer}>
        <View style={styles.stepsRow}>
          {steps.map((step, index) => {
            const isActive = index === currentStep;
            const isCompleted = index < currentStep;

            let stepColor = themeColors.text;
            let iconColor = themeColors.text; // Default icon color
            let circleBorderColor = themeColors.border;
            let circleBackgroundColor = themeColors.background;

            if (isCompleted) {
              stepColor = themeColors.primary;
              iconColor = NAV_THEME.light.text; // White icon on primary background
              circleBorderColor = themeColors.primary;
              circleBackgroundColor = themeColors.primary;
            } else if (isActive) {
              stepColor = themeColors.primary;
              iconColor = themeColors.primary; // Icon color matches border for active
              circleBorderColor = themeColors.primary;
              circleBackgroundColor = themeColors.background; // Keep background same as page for active
            }

            // Calculate progress for the connector *after* this step
            // Connector index is same as step index
            const connectorProgressStart = index / (steps.length - 1);
            const connectorProgressEnd = (index + 1) / (steps.length - 1);

            const segmentCompletion = progressAnim.interpolate({
              inputRange: [connectorProgressStart, connectorProgressEnd],
              outputRange: [0, 1],
              extrapolate: "clamp",
            });

            const animatedConnectorWidth = segmentCompletion.interpolate({
              inputRange: [0, 1],
              outputRange: ["0%", "100%"],
            });

            const connectorBackgroundColor = isCompleted
              ? themeColors.primary
              : themeColors.border;

            return (
              <React.Fragment key={step.key}>
                <View style={styles.stepItemContainer}>
                  <View
                    style={[
                      styles.stepCircle,
                      {
                        borderColor: circleBorderColor,
                        backgroundColor: circleBackgroundColor,
                      },
                      isActive && styles.activeStepCircle, // Emphasize active step
                    ]}
                  >
                    {isCompleted ? (
                      <Icon
                        name="check"
                        size={isActive ? 20 : 18}
                        color={iconColor}
                      />
                    ) : (
                      <Icon
                        name={step.iconName}
                        size={isActive ? 22 : 18}
                        color={iconColor}
                      /> // Increased active icon size
                    )}
                  </View>
                  <Text
                    style={[
                      styles.stepLabel,
                      { color: stepColor },
                      isActive && styles.activeStepLabel,
                    ]}
                    numberOfLines={1}
                  >
                    {step.title}
                  </Text>
                </View>

                {index < steps.length - 1 && (
                  <View
                    style={[
                      styles.connectorContainer,
                      { backgroundColor: themeColors.border /* Track color */ },
                    ]}
                  >
                    <Animated.View
                      style={[
                        styles.connectorFill,
                        {
                          width: animatedConnectorWidth,
                          backgroundColor: themeColors.primary, // Fill color
                        },
                        // Removed: isCompleted && {width: '100%'} // This was overriding the animation on "next"
                      ]}
                    />
                  </View>
                )}
              </React.Fragment>
            );
          })}
        </View>
      </View>

      {/* Content Area for Steps */}
      <View style={styles.contentArea}>{renderStep()}</View>

      {/* Footer with Buttons */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: themeColors.border,
            backgroundColor: themeColors.card,
          },
        ]}
      >
        <Button
          variant="outline"
          disabled={currentStep === 0}
          onPress={goBack}
          style={{
            borderColor: themeColors.primary,
            borderWidth: 1.5,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          className="flex-1 mr-2" // Added flex-1 and margin
        >
          <Icon
            name="chevron-left"
            size={22}
            color={themeColors.primary}
            style={{ marginRight: 8 }}
          />
          <Text
            style={{
              color: themeColors.primary,
              fontFamily: "Staatliches",
              fontSize: 18,
            }}
          >
            Précédent
          </Text>
        </Button>
        <Button
          disabled={
            (currentStep === 0 && !canProceed1()) ||
            (currentStep === 1 && !canProceed2()) ||
            (currentStep === 2 && !canProceed3()) ||
            isUploading // Disable if uploading
          }
          onPress={currentStep === steps.length - 1 ? submit : goNext}
          style={{
            backgroundColor: themeColors.primary,
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 20,
            paddingVertical: 12,
            borderRadius: 8,
          }}
          className="flex-1 ml-2" // Added flex-1 and margin
        >
          <Text
            style={{
              color: NAV_THEME.dark.text,
              fontFamily: "Staatliches",
              fontSize: 18,
            }}
          >
            {currentStep === steps.length - 1 ? "Terminer" : "Suivant"}
          </Text>
          <Icon
            name={
              currentStep === steps.length - 1
                ? "check-circle-outline"
                : "chevron-right"
            }
            size={22}
            color={NAV_THEME.dark.text}
            style={{ marginLeft: 8 }}
          />
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepperContainer: {
    paddingVertical: 20, // Increased padding for better spacing
    paddingHorizontal: 10, // Reduced horizontal padding to give items more space
    backgroundColor: NAV_THEME.light.card, // Subtle background for the stepper area
    borderBottomWidth: 1,
    borderBottomColor: NAV_THEME.light.border,
  },
  stepsRow: {
    flexDirection: "row",
    alignItems: "center", // Vertically align circles and connectors
    justifyContent: "space-between", // Distribute items
  },
  stepItemContainer: {
    alignItems: "center",
    // flex: 1, // Allow step items to grow but not excessively if titles are long
    paddingHorizontal: 5, // Small padding around icon+label
    maxWidth: (width - 20) / 4 - 10, // Max width based on 4 items, adjust if num steps changes
  },
  stepCircle: {
    width: STEP_CIRCLE_DIAMETER,
    height: STEP_CIRCLE_DIAMETER,
    borderRadius: STEP_CIRCLE_DIAMETER / 2,
    borderWidth: 2, // Standard border width
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8, // Space between circle and label
  },
  activeStepCircle: {
    borderWidth: 2.5, // Thicker border for active step
    transform: [{ scale: 1.15 }], // Slightly larger active circle (increased from 1.1)
  },
  stepLabel: {
    fontSize: 12, // Slightly smaller for cleaner look
    textAlign: "center",
    fontFamily: "Staatliches-Regular",
    // fontWeight: "500", // Handled by font
  },
  activeStepLabel: {
    // fontWeight: "bold", // Font might not have bold, rely on color or use different font weight if available
    fontSize: 13, // Slightly larger for active
  },
  connectorContainer: {
    flex: 1, // Take available space between step items
    height: CONNECTOR_HEIGHT,
    backgroundColor: NAV_THEME.light.border, // Default track color
    borderRadius: CONNECTOR_HEIGHT / 2,
    marginHorizontal: 4, // Space between step item edge and connector start/end
    overflow: "hidden", // Ensure connectorFill respects borderRadius
  },
  connectorFill: {
    height: "100%",
    backgroundColor: NAV_THEME.light.primary, // Default fill color
    borderRadius: CONNECTOR_HEIGHT / 2,
  },
  contentArea: {
    flex: 1,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    // backgroundColor is set dynamically
  },
});
