import * as React from "react";
import { View, StyleSheet } from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { useRouter } from "expo-router";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

import UploadStep from "~/components/checkout/UploadStep";
import PersonalInfoStep from "~/components/checkout/PersonalInfoStep";
import LocationStep from "~/components/checkout/LocationStep";
import ReviewStep from "~/components/checkout/ReviewStep";
import AnimatedStepper from "~/components/ui/animated-stepper";
import ThankYouModal from "~/components/ui/thank-you-modal";

import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";

export default function HomeScreen() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [showThankYouModal, setShowThankYouModal] = React.useState(false);
  const steps = [
    { key: "choose", title: "Choisir", iconName: "clipboard-file-outline" },
    { key: "info", title: "Info", iconName: "account-details-outline" },
    { key: "location", title: "Location", iconName: "map-marker-outline" },
    { key: "order", title: "Commander", iconName: "playlist-check" },
  ];

  const { isDarkColorScheme } = useColorScheme();
  const themeColors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

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
    setShowThankYouModal(true);
  };

  const handleModalClose = () => {
    setShowThankYouModal(false);
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
        <AnimatedStepper
          steps={steps}
          currentStep={currentStep}
          isDark={isDarkColorScheme}
        />
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

      <ThankYouModal
        visible={showThankYouModal}
        onClose={handleModalClose}
        customerName={clientName}
        isDark={isDarkColorScheme}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepperContainer: {
    height: 150, // Fixed height for stepper area
    justifyContent: "center",
    alignItems: "center",
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
