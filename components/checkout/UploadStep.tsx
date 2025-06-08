import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
  Modal,
  Dimensions,
  Pressable,
} from "react-native";
import Animated, {
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  FadeOutUp,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";
import { LinearGradient } from "expo-linear-gradient";
import StoreBottomSheet from "~/components/StoreBottomSheet";

// UI Library Components
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "~/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Define a FileItem type to use throughout the component
interface FileItem {
  uri: string;
  name: string;
  type: string;
}

interface UploadStepProps {
  onNext: () => void;
  onUploadImage: (images: string[]) => void;
  onSelectItems: (items: any[]) => void;
  selectedItems: any[];
  uploadedImages: string[];
  fileMetadata?: Record<string, string>;
  onFileMetadataChange?: (metadata: Record<string, string>) => void;
  onUploadStatusChange?: (isUploading: boolean) => void;
}

// Reusable Option Card Component using react-native-reusables patterns
interface OptionCardProps {
  title: string;
  description: string;
  iconName: string;
  badgeText: string;
  gradientColors: [string, string, string];
  onPress: () => void;
  animatedStyle: any;
  navColors: any;
}

const OptionCard: React.FC<OptionCardProps> = ({
  title,
  description,
  iconName,
  badgeText,
  gradientColors,
  onPress,
  animatedStyle,
  navColors,
}) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.8}
    className="flex-1"
    style={{
      minHeight: 220,
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 12,
    }}
  >
    <Animated.View style={[animatedStyle]} className="flex-1">
      <Card
        className="flex-1 border border-border bg-card shadow-lg shadow-foreground/20 overflow-hidden relative"
        style={{
          borderColor: navColors.border + "40",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: 8 },
          shadowOpacity: 0.1,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Gradient Background */}
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFillObject, { opacity: 0.3 }]}
        />
        {/* Badge positioned absolutely */}
        <View
          className="absolute top-4 right-4 px-3 py-1.5 rounded-full shadow-md z-30 bg-primary"
          style={{
            backgroundColor: navColors.primary,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 5,
            zIndex: 30,
          }}
        >
          <Text
            className="text-lg font-bold text-primary-foreground tracking-wide"
            style={{
              fontFamily: "Staatliches",
              color: "white",
              zIndex: 31,
              fontSize: 18,
            }}
          >
            {badgeText}
          </Text>
        </View>
        <CardHeader className="flex flex-col items-center space-y-2 p-4 pt-4 pb-2">
          {/* Icon Container */}
          <View
            className="w-20 h-20 rounded-full items-center justify-center shadow-sm z-20"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              borderWidth: 2,
              borderColor: navColors.primary + "30",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
              elevation: 3,
              zIndex: 20,
            }}
          >
            <MaterialCommunityIcons
              name={iconName as any}
              size={48}
              color={navColors.primary}
              style={{
                zIndex: 21,
                textShadowColor: "rgba(0, 0, 0, 0.1)",
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}
            />
          </View>
          <CardTitle
            className="text-3xl font-semibold text-center tracking-tight text-card-foreground"
            style={{
              fontFamily: "Staatliches",
              color: navColors.text,
              zIndex: 20,
              fontSize: 28,
            }}
          >
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 items-center p-4 pt-0">
          <CardDescription
            className="text-lg text-center text-muted-foreground leading-relaxed"
            style={{
              fontFamily: "Staatliches",
              color: navColors.text,
              opacity: 0.8,
              zIndex: 20,
              fontSize: 18,
            }}
          >
            {description}
          </CardDescription>
        </CardContent>
      </Card>
    </Animated.View>
  </TouchableOpacity>
);

const UploadStep = ({
  onNext,
  onUploadImage,
  onSelectItems,
  selectedItems,
  uploadedImages,
  fileMetadata = {},
  onFileMetadataChange = () => {},
  onUploadStatusChange = () => {},
}: UploadStepProps) => {
  const router = useRouter();
  const { colors } = useTheme(); // from @react-navigation/native
  const { isDarkColorScheme } = useColorScheme();
  const navColors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light; // Animation values for enhanced entrance animations
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const alertScale = useSharedValue(0.9);
  const alertOpacity = useSharedValue(0);
  const cardsScale = useSharedValue(0.95);
  const cardsOpacity = useSharedValue(0);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUploadOptions, setShowUploadOptions] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);
  // File preview modal states
  const [filePreviewVisible, setFilePreviewVisible] = React.useState(false);
  const [selectedFileIndex, setSelectedFileIndex] = React.useState<
    number | null
  >(null); // Custom accordion state
  const [isFilesExpanded, setIsFilesExpanded] = React.useState(true);
  const [isCartExpanded, setIsCartExpanded] = React.useState(true);

  // Store bottom sheet state
  const [storeVisible, setStoreVisible] = React.useState(false);
  // Ref for accordion container to enable auto-scroll
  const accordionRef = React.useRef<View>(null);
  const cartAccordionRef = React.useRef<View>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);

  const [fileMap, setFileMap] = React.useState<Map<string, FileItem>>(
    new Map()
  ); // Initialize entrance animations
  React.useEffect(() => {
    // Staggered entrance animations
    headerScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    headerOpacity.value = withTiming(1, { duration: 800 });

    alertScale.value = withDelay(
      150,
      withSpring(1, { damping: 18, stiffness: 180 })
    );
    alertOpacity.value = withDelay(150, withTiming(1, { duration: 600 }));

    cardsScale.value = withDelay(
      300,
      withSpring(1, { damping: 16, stiffness: 160 })
    );
    cardsOpacity.value = withDelay(300, withTiming(1, { duration: 700 }));
  }, []); // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));

  const alertAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: alertScale.value }],
    opacity: alertOpacity.value,
  }));

  const cardsAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardsScale.value }],
    opacity: cardsOpacity.value,
  }));

  const createFileItem = (uri: string): FileItem => {
    const existingFile = fileMap.get(uri);
    if (existingFile) {
      return existingFile;
    }
    let filename = "file";
    try {
      const parts = uri.split("/");
      if (parts.length > 0) {
        filename = parts[parts.length - 1].split("?")[0];
        filename = decodeURIComponent(filename);
      }
    } catch (e) {
      const ext = getFileExtension(uri);
      filename = `file-${Date.now()}.${ext || "unknown"}`;
    }
    return { uri, name: filename, type: getFileType(uri) };
  };

  React.useEffect(() => {
    if (uploadedImages.length > 0) {
      const newFileMap = new Map<string, FileItem>();
      uploadedImages.forEach((uri) => {
        newFileMap.set(uri, createFileItem(uri));
      });
      setFileMap(newFileMap);
    }
  }, []);

  React.useEffect(() => {
    const currentUris = Array.from(fileMap.keys());
    const newUris = uploadedImages.filter((uri) => !currentUris.includes(uri));
    const removedUris = currentUris.filter(
      (uri) => !uploadedImages.includes(uri)
    );

    if (newUris.length > 0 || removedUris.length > 0) {
      const newFileMap = new Map(fileMap);
      newUris.forEach((uri) => {
        newFileMap.set(uri, createFileItem(uri));
      });
      removedUris.forEach((uri) => {
        newFileMap.delete(uri);
      });
      setFileMap(newFileMap);
    }
  }, [uploadedImages]);

  const getFileExtension = (uri: string) => {
    return uri.split(".").pop()?.toLowerCase() || "";
  };

  const isImageFile = (uri: string) => {
    const ext = getFileExtension(uri);
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
  };

  const getFileType = (uri: string) => {
    const ext = getFileExtension(uri);
    if (isImageFile(uri)) {
      return `image/${ext === "jpg" ? "jpeg" : ext}`;
    } else if (ext === "pdf") {
      return "application/pdf";
    } else if (["doc", "docx"].includes(ext)) {
      return "application/msword";
    }
    return "application/octet-stream";
  };

  React.useEffect(() => {
    (async () => {
      if (Platform.OS !== "web") {
        const { status: cameraStatus } =
          await ImagePicker.requestCameraPermissionsAsync();
        const { status: libraryStatus } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (cameraStatus !== "granted" || libraryStatus !== "granted") {
          alert(
            "Sorry, we need camera and media library permissions to make this work!"
          );
        }
      }
    })();
  }, []);

  const simulateUploadProgress = (
    callback: (images: string[]) => void,
    images: string[]
  ) => {
    setIsUploading(true);
    setUploadProgress(0);
    onUploadStatusChange(true); // Notify parent immediately

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        onUploadStatusChange(false); // Notify parent
        callback(images);
      }
    }, 150);
  };
  const takePhoto = async () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUri = result.assets[0].uri;
        setShowUploadOptions(false);
        simulateUploadProgress(() => {
          onUploadImage([...uploadedImages, newUri]);
        }, [newUri]);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to take photo. Please try again.");
    }
  };
  const pickImage = async () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
        allowsMultipleSelection: true,
      });
      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newUris = result.assets.map((asset) => asset.uri);
        setShowUploadOptions(false);
        simulateUploadProgress(() => {
          onUploadImage([...uploadedImages, ...newUris]);
        }, newUris);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to select image. Please try again.");
    }
  };

  const fileMetadataRef = React.useRef<Record<string, string>>(fileMetadata);

  React.useEffect(() => {
    fileMetadataRef.current = fileMetadata;
  }, [fileMetadata]);
  const pickDocument = async () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*", // Allow images through document picker as well
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
        multiple: true,
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        setShowUploadOptions(false);

        const newUris: string[] = [];
        const currentMetadata = { ...fileMetadataRef.current };

        result.assets.forEach((file) => {
          if (file.uri) {
            newUris.push(file.uri);
            if (file.name) {
              const filenamePart = file.uri.split("/").pop() || "";
              currentMetadata[filenamePart] = file.name;
            }
          }
        });

        onFileMetadataChange(currentMetadata); // Update parent with all metadata changes at once

        simulateUploadProgress(() => {
          onUploadImage([...uploadedImages, ...newUris]);
        }, newUris);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      alert("Failed to select document. Please try again.");
    }
  };
  const removeFile = (uri: string) => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    onUploadImage(uploadedImages.filter((imgUri) => imgUri !== uri));
    // Metadata associated with this URI might need cleanup if stored by URI directly
    // However, current metadata is keyed by filenamePart, so it might persist if another file has the same temp name.
    // For simplicity, we're not cleaning up metadata here, assuming names are unique enough or managed by parent.
  };

  const files = React.useMemo(() => {
    return Array.from(fileMap.values());
  }, [fileMap]);
  const getDisplayName = (file: FileItem): string => {
    if (
      file.name &&
      !file.name.match(/^[0-9A-F]{8}-([0-9A-F]{4}-){3}[0-9A-F]{12}/i) &&
      !file.name.startsWith("file-")
    ) {
      return file.name;
    }
    const filenamePart = file.uri.split("/").pop() || "";
    const storedName =
      fileMetadata[filenamePart] || fileMetadataRef.current[filenamePart];
    if (storedName) {
      return storedName;
    }
    return file.name || filenamePart || "Unknown File";
  }; // Handle file preview
  const handleFilePreview = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedFileIndex(index);
    setFilePreviewVisible(true);
  };

  // Handle modal close with scroll-up functionality
  const handleModalClose = () => {
    setFilePreviewVisible(false);
    setSelectedFileIndex(null);

    // Scroll to top with smooth animation after modal closes
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: 0,
        animated: true,
      });
    }, 300); // Delay to allow modal close animation to complete
  };

  // Handle accordion toggle with auto-scroll
  const handleAccordionToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExpanded = !isFilesExpanded;
    setIsFilesExpanded(newExpanded);
    // Auto-scroll to accordion when opening
    if (newExpanded && accordionRef.current && scrollViewRef.current) {
      setTimeout(() => {
        accordionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 50, // Offset to show some content above
              animated: true,
            });
          },
          () => {
            // Fallback: scroll to bottom if measure fails
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }, 250); // Delay to allow accordion animation to start
    }
  };
  // Handle cart accordion toggle with auto-scroll
  const handleCartAccordionToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const newExpanded = !isCartExpanded;
    setIsCartExpanded(newExpanded);
    // Auto-scroll to accordion when opening
    if (newExpanded && cartAccordionRef.current && scrollViewRef.current) {
      setTimeout(() => {
        cartAccordionRef.current?.measureLayout(
          scrollViewRef.current as any,
          (x, y) => {
            scrollViewRef.current?.scrollTo({
              y: y - 50, // Offset to show some content above
              animated: true,
            });
          },
          () => {
            // Fallback: scroll to bottom if measure fails
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }
        );
      }, 250); // Delay to allow accordion animation to start
    }
  };

  // Animation values for cards
  const uploadCardScale = useSharedValue(1);
  const manualCardScale = useSharedValue(1);

  const uploadCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: uploadCardScale.value }],
  }));

  const manualCardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: manualCardScale.value }],
  }));
  const handleUploadPress = () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    uploadCardScale.value = withSpring(0.95, { duration: 100 }, () => {
      uploadCardScale.value = withSpring(1, { duration: 150 });
    });
    setShowUploadOptions(true);
  };
  const handleManualPress = () => {
    // Add haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    manualCardScale.value = withSpring(0.95, { duration: 100 }, () => {
      manualCardScale.value = withSpring(1, { duration: 150 });
    });
    setStoreVisible(true);
  };
  React.useEffect(() => {
    onUploadStatusChange(isUploading);
  }, [isUploading, onUploadStatusChange]);
  return (
    <ScrollView
      ref={scrollViewRef}
      className="flex-1"
      style={{ backgroundColor: navColors.background }}
      contentContainerStyle={{ padding: 16, paddingBottom: 20 }}
      keyboardShouldPersistTaps="handled"
    >
      {/* Compact Alert Container with Animation */}
      <Animated.View
        className="w-full items-center mb-5"
        style={[alertAnimatedStyle]}
        entering={FadeInDown.delay(100).duration(600)}
      >
        <Alert
          icon={
            <MaterialCommunityIcons
              name="information-outline"
              size={20}
              color={navColors.primary}
            />
          }
          variant="default"
          className="border rounded-xl shadow-lg p-3"
          style={{
            backgroundColor: navColors.card,
            borderColor: navColors.primary + "20",
            borderWidth: 1,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.25,
            shadowRadius: 12,
          }}
        >
          <AlertDescription
            className="text-sm text-center opacity-80"
            style={{
              color: navColors.text,
              fontFamily: "Staatliches",
              fontSize: 14,
            }}
          >
            {" "}
            Choisissez comment vous souhaitez ajouter vos articles
          </AlertDescription>
        </Alert>
      </Animated.View>
      {/* Main Options Container - Horizontal Layout with Animation */}
      <Animated.View
        className="flex-row justify-between gap-4 mb-6"
        style={[cardsAnimatedStyle]}
        entering={FadeInUp.delay(250).duration(700)}
      >
        {/* Upload Option */}
        <Animated.View
          entering={FadeInLeft.delay(400).duration(600)}
          className="flex-1"
        >
          <OptionCard
            title="Importer votre Liste"
            description="Photographiez ou téléchargez votre liste scolaire pour une sélection automatique"
            iconName="cloud-upload-outline"
            badgeText="Rapide"
            gradientColors={[
              navColors.card + "FF",
              navColors.card + "F5",
              navColors.card + "FF",
            ]}
            onPress={handleUploadPress}
            animatedStyle={uploadCardAnimatedStyle}
            navColors={navColors}
          />
        </Animated.View>
        {/* Manual Selection Option */}
        <Animated.View
          entering={FadeInRight.delay(400).duration(600)}
          className="flex-1"
        >
          <OptionCard
            title="Sélection Manuelle"
            description="Parcourez notre catalogue et choisissez manuellement vos articles"
            iconName="format-list-bulleted-square"
            badgeText="Précis"
            gradientColors={[
              navColors.card + "FF",
              navColors.card + "F5",
              navColors.card + "FF",
            ]}
            onPress={handleManualPress}
            animatedStyle={manualCardAnimatedStyle}
            navColors={navColors}
          />
        </Animated.View>
      </Animated.View>
      <Dialog open={showUploadOptions} onOpenChange={setShowUploadOptions}>
        <DialogContent
          className="p-0 w-[90%] max-w-md rounded-2xl border"
          style={{
            backgroundColor: navColors.card,
            borderColor: navColors.border,
            borderWidth: 1,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 15,
          }}
        >
          {" "}
          <DialogHeader
            className="px-6 py-8 items-center border-b"
            style={{
              borderBottomColor: navColors.border,
              paddingTop: 32,
              paddingBottom: 24,
            }}
          >
            <DialogTitle
              className="text-3xl text-center font-bold"
              style={{
                color: navColors.text,
                fontFamily: "Staatliches",
                fontSize: 28,
                lineHeight: 36,
                paddingHorizontal: 16,
              }}
            >
              Comment voulez-vous ajouter?
            </DialogTitle>
          </DialogHeader>
          <View className="p-8">
            <View className="space-y-4">
              {[
                {
                  icon: "camera-outline",
                  text: "Prendre une photo",
                  onPress: takePhoto,
                },
                {
                  icon: "image-multiple-outline",
                  text: "Choisir des images",
                  onPress: pickImage,
                },
                {
                  icon: "file-document-outline",
                  text: "Choisir un document",
                  onPress: pickDocument,
                },
              ].map((item, index) => (
                <Animated.View
                  key={index}
                  entering={FadeInDown.delay(index * 150 + 200).duration(500)}
                >
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={item.onPress}
                    style={{
                      backgroundColor: navColors.card,
                      borderColor: navColors.primary,
                      borderWidth: 2,
                      borderRadius: 12,
                      paddingVertical: 16,
                      paddingHorizontal: 20,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 4 },
                      shadowOpacity: 0.1,
                      shadowRadius: 8,
                      elevation: 6,
                      marginBottom: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={40}
                      color={navColors.primary}
                      style={{ marginRight: 16 }}
                    />
                    <Text
                      className="text-2xl font-bold"
                      style={{
                        color: navColors.primary,
                        fontFamily: "Staatliches",
                        fontSize: 24,
                      }}
                    >
                      {" "}
                      {item.text}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}{" "}
            </View>

            <Animated.View entering={FadeInUp.delay(650).duration(400)}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setShowUploadOptions(false)}
                style={{
                  marginTop: 24,
                  paddingVertical: 14,
                  paddingHorizontal: 20,
                  borderRadius: 12,
                  backgroundColor: navColors.background,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  className="text-2xl font-bold"
                  style={{
                    color: navColors.text,
                    fontFamily: "Staatliches",
                    fontSize: 24,
                  }}
                >
                  Annuler
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </DialogContent>
      </Dialog>{" "}
      {/* Files Section - Custom Accordion Implementation */}
      {files.length > 0 && (
        <Animated.View
          ref={accordionRef}
          entering={FadeInDown.delay(400).springify()}
          className="mt-4"
        >
          {" "}
          <Card
            className="border-0"
            style={{
              backgroundColor: navColors.card,
              borderColor: navColors.border,
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 12,
              overflow: "hidden",
            }}
          >
            {" "}
            {/* Custom Accordion Header */}
            <Pressable
              onPress={handleAccordionToggle}
              style={{
                backgroundColor: navColors.background,
                borderTopLeftRadius: 7,
                borderTopRightRadius: 7,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                <MaterialCommunityIcons
                  name="file-multiple"
                  size={24}
                  color={navColors.primary}
                />
                <Text
                  className="ml-2 font-medium text-lg"
                  style={{
                    color: navColors.text,
                    fontFamily: "Staatliches",
                    fontSize: 20,
                  }}
                >
                  Fichiers ({files.length})
                </Text>
              </View>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: isFilesExpanded ? "180deg" : "0deg",
                    },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={navColors.text}
                />
              </Animated.View>
            </Pressable>{" "}
            {/* Custom Accordion Content */}
            {isFilesExpanded && (
              <Animated.View
                entering={FadeInDown.duration(200)}
                exiting={FadeOutUp.duration(150)}
                style={{
                  backgroundColor: navColors.card,
                  borderBottomLeftRadius: 7,
                  borderBottomRightRadius: 7,
                  padding: 8,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <View className="flex-row flex-wrap justify-start">
                  {files.map((file, index) => {
                    const isImage = isImageFile(file.uri);
                    const displayName = getDisplayName(file);
                    return (
                      <View
                        key={`file-${index}-${file.uri}`}
                        style={{
                          width: 70,
                          margin: 6,
                        }}
                      >
                        <TouchableOpacity
                          activeOpacity={0.7}
                          onPress={() => handleFilePreview(index)}
                          style={{
                            width: "100%",
                            height: "auto",
                            shadowColor: "#000",
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.1,
                            shadowRadius: 8,
                            elevation: 6,
                          }}
                        >
                          {" "}
                          <Card
                            className="relative bg-card border border-border shadow-sm"
                            style={{
                              backgroundColor: navColors.card,
                              borderColor: navColors.border,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 4,
                              elevation: 3,
                            }}
                          >
                            <CardContent className="p-2 items-center">
                              {isImage ? (
                                <View style={{ position: "relative" }}>
                                  <Image
                                    source={{ uri: file.uri }}
                                    style={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: 6,
                                      marginBottom: 4,
                                    }}
                                    resizeMode="cover"
                                  />
                                  {/* Eye icon overlay for images */}
                                  <View
                                    style={{
                                      position: "absolute",
                                      top: 0,
                                      left: 0,
                                      right: 0,
                                      bottom: 4,
                                      backgroundColor: "rgba(0,0,0,0.3)",
                                      borderRadius: 6,
                                      alignItems: "center",
                                      justifyContent: "center",
                                      opacity: 0.8,
                                    }}
                                  >
                                    <MaterialCommunityIcons
                                      name="eye"
                                      size={16}
                                      color="white"
                                    />
                                  </View>
                                </View>
                              ) : (
                                <View
                                  className="h-10 w-10 rounded-md mb-1 items-center justify-center"
                                  style={{
                                    backgroundColor: "transparent",
                                    borderWidth: 1,
                                    borderColor: navColors.border,
                                    position: "relative",
                                  }}
                                >
                                  <MaterialCommunityIcons
                                    name={
                                      file.type === "application/pdf"
                                        ? "file-pdf-box"
                                        : "file-outline"
                                    }
                                    size={30}
                                    color={navColors.primary}
                                  />
                                  {/* Eye icon overlay for documents */}
                                  <View
                                    style={{
                                      position: "absolute",
                                      top: 2,
                                      right: 2,
                                      backgroundColor: navColors.primary,
                                      borderRadius: 8,
                                      padding: 2,
                                    }}
                                  >
                                    <MaterialCommunityIcons
                                      name="eye"
                                      size={10}
                                      color="white"
                                    />
                                  </View>
                                </View>
                              )}
                              <Text
                                numberOfLines={1}
                                ellipsizeMode="tail"
                                className="text-base text-center text-card-foreground"
                                style={{
                                  color: navColors.text,
                                  maxWidth: 60,
                                  fontFamily: "Staatliches",
                                  fontSize: 16,
                                }}
                              >
                                {displayName}
                              </Text>
                              <TouchableOpacity
                                onPress={() => removeFile(file.uri)}
                                className="absolute -top-1 -right-1 p-0.5 rounded-full bg-border"
                                style={{
                                  backgroundColor: navColors.border,
                                }}
                              >
                                <MaterialCommunityIcons
                                  name="close-circle"
                                  size={20}
                                  color={navColors.notification}
                                />
                              </TouchableOpacity>{" "}
                            </CardContent>
                          </Card>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </Animated.View>
            )}
          </Card>
        </Animated.View>
      )}
      {isUploading && (
        <Animated.View
          entering={Platform.OS !== "web" ? FadeInUp : undefined}
          style={[styles.uploadProgressContainer]}
        >
          <Card
            className="bg-card border-t border-border shadow-lg"
            style={{
              backgroundColor: navColors.card,
              borderColor: navColors.border,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 3,
              elevation: 5,
            }}
          >
            <CardContent className="p-4">
              <CardHeader className="p-0 pb-3 flex-row items-center justify-center space-y-0">
                <MaterialCommunityIcons
                  name="cloud-upload-outline"
                  size={28}
                  color={navColors.primary}
                  style={{ marginRight: 8 }}
                />
                <CardTitle
                  className="text-2xl font-semibold text-card-foreground"
                  style={{
                    color: navColors.text,
                    fontFamily: "Staatliches",
                    fontSize: 26,
                  }}
                >
                  Téléchargement en cours...
                </CardTitle>
              </CardHeader>

              <View className="flex-row items-center space-x-3">
                <Progress
                  value={uploadProgress}
                  className="flex-1 h-3"
                  style={{ backgroundColor: `${navColors.background}80` }}
                  indicatorClassName="bg-primary"
                />
                <View className="min-w-[40px] items-center">
                  <Text
                    className="text-xl font-medium text-card-foreground"
                    style={{
                      color: navColors.text,
                      fontFamily: "Staatliches",
                      fontSize: 22,
                    }}
                  >
                    {uploadProgress}%
                  </Text>
                </View>
              </View>
            </CardContent>{" "}
          </Card>{" "}
        </Animated.View>
      )}{" "}
      {/* Cart Items Accordion */}
      {selectedItems.length > 0 && (
        <Animated.View
          ref={cartAccordionRef}
          entering={FadeInDown.delay(500).springify()}
          className="mt-4"
        >
          <Card
            className="border-0"
            style={{
              backgroundColor: navColors.card,
              borderColor: navColors.border,
              borderWidth: 1,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.25,
              shadowRadius: 16,
              elevation: 12,
              overflow: "hidden",
            }}
          >
            {/* Cart Header */}
            <Pressable
              onPress={handleCartAccordionToggle}
              style={{
                backgroundColor: navColors.background,
                borderTopLeftRadius: 7,
                borderTopRightRadius: 7,
                padding: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
              }}
            >
              <View className="flex-row items-center">
                {" "}
                <MaterialCommunityIcons
                  name="cart"
                  size={24}
                  color={navColors.primary}
                />
                <Text
                  className="ml-2 font-medium text-lg"
                  style={{
                    color: navColors.text,
                    fontFamily: "Staatliches",
                    fontSize: 20,
                  }}
                >
                  Panier ({selectedItems.length})
                </Text>
              </View>
              <Animated.View
                style={{
                  transform: [
                    {
                      rotate: isCartExpanded ? "180deg" : "0deg",
                    },
                  ],
                }}
              >
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={20}
                  color={navColors.text}
                />
              </Animated.View>{" "}
            </Pressable>{" "}
            {/* Cart Content */}
            {isCartExpanded && (
              <Animated.View
                entering={FadeInDown.duration(200)}
                exiting={FadeOutUp.duration(150)}
                style={{
                  backgroundColor: navColors.card,
                  borderBottomLeftRadius: 7,
                  borderBottomRightRadius: 7,
                  padding: 16,
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.15,
                  shadowRadius: 8,
                  elevation: 6,
                }}
              >
                <ScrollView
                  style={{ maxHeight: 400 }}
                  showsVerticalScrollIndicator={false}
                >
                  {selectedItems.map((item, index) => (
                    <Animated.View
                      key={item.id || index}
                      entering={FadeInDown.delay(index * 100).duration(400)}
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        paddingVertical: 16,
                        borderBottomWidth:
                          index < selectedItems.length - 1 ? 1 : 0,
                        borderBottomColor: navColors.border + "20",
                      }}
                    >
                      {/* Item Details */}
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "flex-start",
                          flex: 1,
                          marginRight: 12,
                        }}
                      >
                        {/* Item Image */}
                        {item.image && (
                          <Image
                            source={{ uri: item.image }}
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 12,
                              marginRight: 12,
                              backgroundColor: navColors.border + "20",
                            }}
                            resizeMode="cover"
                          />
                        )}

                        {/* Item Info */}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "600",
                              color: navColors.text,
                              marginBottom: 4,
                              fontFamily: "Staatliches",
                            }}
                          >
                            {item.name || "Article sans nom"}
                          </Text>

                          {item.description && (
                            <Text
                              style={{
                                fontSize: 14,
                                color: navColors.text + "70",
                                marginBottom: 6,
                                lineHeight: 18,
                              }}
                              numberOfLines={2}
                            >
                              {item.description}
                            </Text>
                          )}
                          {/* Item Meta */}
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 12,
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 14,
                                fontWeight: "500",
                                color: navColors.primary,
                                paddingHorizontal: 8,
                                paddingVertical: 2,
                                borderRadius: 6,
                              }}
                            >
                              Qté: {item.quantity || 1}
                            </Text>

                            {item.category && (
                              <Text
                                style={{
                                  fontSize: 12,
                                  color: navColors.text + "60",
                                  backgroundColor: navColors.border + "20",
                                  paddingHorizontal: 6,
                                  paddingVertical: 2,
                                  borderRadius: 4,
                                }}
                              >
                                {item.category}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>

                      {/* Item Pricing & Remove Button */}
                      <View style={{ alignItems: "flex-end" }}>
                        {" "}
                        {/* Price */}
                        <View
                          style={{ alignItems: "flex-end", marginBottom: 8 }}
                        >
                          {item.originalPrice &&
                            parseFloat(item.originalPrice) >
                              parseFloat(item.price || "0") && (
                              <Text
                                style={{
                                  fontSize: 14,
                                  color: navColors.text + "50",
                                  textDecorationLine: "line-through",
                                  marginBottom: 2,
                                }}
                              >
                                {parseFloat(item.originalPrice).toFixed(2)} DH
                              </Text>
                            )}
                          <Text
                            style={{
                              fontSize: 18,
                              fontWeight: "700",
                              color: "#2D7D32",
                              marginBottom: 2,
                            }}
                          >
                            {parseFloat(item.price || "0").toFixed(2)} DH
                          </Text>
                          {item.quantity && item.quantity > 1 && (
                            <Text
                              style={{
                                fontSize: 12,
                                color: navColors.text + "60",
                                fontWeight: "500",
                              }}
                            >
                              Total:{" "}
                              {(
                                parseFloat(item.price || "0") * item.quantity
                              ).toFixed(2)}{" "}
                              DH
                            </Text>
                          )}
                        </View>
                        {/* Remove Button */}
                        <TouchableOpacity
                          onPress={() => {
                            Haptics.impactAsync(
                              Haptics.ImpactFeedbackStyle.Light
                            );
                            const updatedItems = selectedItems.filter(
                              (_, i) => i !== index
                            );
                            onSelectItems(updatedItems);
                          }}
                          style={{
                            padding: 8,
                            backgroundColor: "#FF4444" + "15",
                            borderRadius: 8,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <MaterialCommunityIcons
                            name="close"
                            size={16}
                            color="#FF4444"
                          />
                        </TouchableOpacity>
                      </View>
                    </Animated.View>
                  ))}{" "}
                  {/* Cart Summary */}
                  <Animated.View
                    entering={FadeInUp.delay(300).duration(400)}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingVertical: 16,
                      marginTop: 8,
                      borderRadius: 12,
                      gap: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="package-variant"
                      size={20}
                      color={navColors.primary}
                    />
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "600",
                        color: navColors.primary,
                        fontFamily: "Staatliches",
                      }}
                    >
                      {selectedItems.length} article
                      {selectedItems.length !== 1 ? "s" : ""} sélectionné
                      {selectedItems.length !== 1 ? "s" : ""}
                    </Text>
                  </Animated.View>{" "}
                  {/* Total Price */}
                  <Animated.View
                    entering={FadeInUp.delay(400).duration(400)}
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                      paddingVertical: 16,
                      paddingHorizontal: 8,
                      borderRadius: 12,
                      marginTop: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: navColors.text,
                        fontFamily: "Staatliches",
                      }}
                    >
                      Total Panier
                    </Text>{" "}
                    <Text
                      style={{
                        fontSize: 22,
                        fontWeight: "800",
                        color: "#2D5A27",
                        fontFamily: "Staatliches",
                      }}
                    >
                      {selectedItems
                        .reduce(
                          (sum, item) =>
                            sum +
                            parseFloat(item.price || "0") *
                              (item.quantity || 1),
                          0
                        )
                        .toFixed(2)}{" "}
                      DH
                    </Text>{" "}
                  </Animated.View>
                </ScrollView>
              </Animated.View>
            )}
          </Card>
        </Animated.View>
      )}
      {/* File Preview Modal */}
      <Modal
        visible={filePreviewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={handleModalClose}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={handleModalClose}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              {selectedFileIndex !== null && files[selectedFileIndex] && (
                <>
                  {isImageFile(files[selectedFileIndex].uri) ? (
                    <Image
                      source={{ uri: files[selectedFileIndex].uri }}
                      style={styles.fullScreenImage}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.documentPreview}>
                      <MaterialCommunityIcons
                        name={
                          files[selectedFileIndex].type === "application/pdf"
                            ? "file-pdf-box"
                            : "file-outline"
                        }
                        size={120}
                        color={navColors.primary}
                      />
                      <Text
                        style={[
                          styles.documentTitle,
                          { color: navColors.text },
                        ]}
                      >
                        {getDisplayName(files[selectedFileIndex])}
                      </Text>
                      <Text
                        style={[styles.documentType, { color: navColors.text }]}
                      >
                        {files[selectedFileIndex].type === "application/pdf"
                          ? "PDF Document"
                          : "Document"}
                      </Text>
                    </View>
                  )}
                </>
              )}{" "}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={handleModalClose}
              >
                <MaterialCommunityIcons name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>{" "}
          </TouchableOpacity>
        </View>
      </Modal>
      {/* Store Bottom Sheet */}
      <StoreBottomSheet
        visible={storeVisible}
        onClose={() => setStoreVisible(false)}
        onSelectItems={onSelectItems}
        selectedItems={selectedItems}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  // Upload progress styles - simplified since we're using Card component
  uploadProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  // File preview modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.9)",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: screenWidth * 0.95,
    height: screenHeight * 0.8,
    position: "relative",
  },
  fullScreenImage: {
    width: "100%",
    height: "100%",
    borderRadius: 12,
  },
  documentPreview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    padding: 20,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 16,
    textAlign: "center",
    fontFamily: "Staatliches",
  },
  documentType: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    textAlign: "center",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 20,
    padding: 8,
    zIndex: 10,
  },
});

export default UploadStep;
