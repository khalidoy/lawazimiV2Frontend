import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Image,
} from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import React from "react";
import { useTheme } from "@react-navigation/native";
import { NAV_THEME } from "~/lib/constants";
import { useColorScheme } from "~/lib/useColorScheme";

// Assuming these components are correctly imported from your UI library
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button"; // Keep for Dialog, remove from Cards
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"; // CardTitle might not be used if text is custom
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter, // If needed for dialog buttons
  DialogClose, // If needed for a close button in dialog
} from "~/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Progress } from "~/components/ui/progress"; // Assuming a Progress component exists

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
  const navColors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUploadOptions, setShowUploadOptions] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  const [fileMap, setFileMap] = React.useState<Map<string, FileItem>>(
    new Map()
  );

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
  };

  React.useEffect(() => {
    onUploadStatusChange(isUploading);
  }, [isUploading, onUploadStatusChange]);

  const cardShadowStyle = {
    backgroundColor: navColors.card, // Use navColors
    borderColor: navColors.border, // Use navColors
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 4 }, // Adjusted for a bit more depth
    shadowOpacity: 0.2, // Clearer shadow
    shadowRadius: 5, // Softer edges
    elevation: 7, // Android equivalent
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: navColors.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.alertContainer}>
        <Alert
          icon={
            <Icon
              name="information-outline"
              size={24}
              color={navColors.primary}
            />
          }
          variant="default" // Assuming default variant handles basic structure
          style={{
            backgroundColor: navColors.card,
            borderColor: navColors.border,
            borderWidth: 1,
            borderRadius: 8, // Match card rounding
            width: "90%", // Make alert narrower than screen width
            alignSelf: "center", // Center the alert
            elevation: 2, // Add a slight shadow on Android
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          }}
          className="mb-6 p-4" // Adjusted padding and margin
        >
          <AlertTitle
            style={{
              color: navColors.primary,
              fontFamily: "Staatliches",
              fontSize: 18,
              marginBottom: 4,
            }}
          >
            Upload Instructions
          </AlertTitle>
          <AlertDescription
            style={{
              color: navColors.text,
              fontSize: 14,
              fontFamily: "Staatliches",
            }}
          >
            Select an option below to add your school supply list or items.
          </AlertDescription>
        </Alert>
      </View>

      <TouchableOpacity
        onPress={() => setShowUploadOptions(true)}
        activeOpacity={0.7}
        style={{ marginHorizontal: 16 }} // Added margin for consistency
      >
        <Card
          // className="mb-4 bg-card border-border rounded-xl"
          className="mb-4 rounded-xl" // Removed color classes, style prop handles it
          style={cardShadowStyle} // cardShadowStyle already uses navColors
        >
          <CardHeader className="p-5 items-center">
            <Icon
              name="upload"
              size={64} // Increased icon size
              color={navColors.primary}
              className="mb-3"
            />
            <View className="items-center w-full">
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "Staatliches",
                  color: navColors.text,
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                Importer votre Liste
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Staatliches",
                  color: navColors.text,
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                Rapide et facile
              </Text>
            </View>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Staatliches",
                color: navColors.text,
                lineHeight: 22,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              Photographiez votre liste ou téléchargez un fichier (PDF, JPG,
              PNG).
            </Text>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/store")}
        activeOpacity={0.7}
        style={{ marginHorizontal: 16 }}
      >
        <Card
          // className="mb-4 bg-card border-border rounded-xl"
          className="mb-4 rounded-xl"
          style={cardShadowStyle} // cardShadowStyle already uses navColors
        >
          <CardHeader className="p-5 items-center">
            <Icon
              name="cursor-default-click-outline"
              size={64} // Increased icon size
              color={navColors.primary}
              className="mb-3"
            />
            <View className="items-center w-full">
              <Text
                style={{
                  fontSize: 22,
                  fontFamily: "Staatliches",
                  color: navColors.text,
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                Sélection Manuelle
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  fontFamily: "Staatliches",
                  color: navColors.text,
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                Contrôle total
              </Text>
            </View>
          </CardHeader>
          <CardContent className="p-5 pt-2">
            <Text
              style={{
                fontSize: 15,
                fontFamily: "Staatliches",
                color: navColors.text,
                lineHeight: 22,
                textAlign: "center",
                opacity: 0.8,
              }}
            >
              Parcourez notre catalogue et ajoutez des articles
              individuellement.
            </Text>
          </CardContent>
        </Card>
      </TouchableOpacity>

      <Dialog open={showUploadOptions} onOpenChange={setShowUploadOptions}>
        {/* Increased width from w-[90%] to w-[95%] or a fixed pixel value if preferred for more space 
            Also increased overall padding for the content within the dialog e.g. p-0 to p-2 or more if DialogContent allows direct padding control
            If DialogContent uses a fixed internal padding, we might need to adjust styles of children directly or the component itself if customizable.
        */}
        <DialogContent
          style={{
            backgroundColor: navColors.card,
            borderColor: navColors.border,
            borderWidth: 1,
            borderRadius: 16,
            width: "95%",
          }}
          className="p-0"
        >
          <DialogHeader
            style={{
              borderBottomColor: navColors.border,
              borderBottomWidth: 1,
            }}
            className="px-6 py-5 items-center"
          >
            {" "}
            {/* Increased py-5 from p-6 for more vertical padding in header */}
            <DialogTitle
              style={{
                color: navColors.text,
                fontFamily: "Staatliches",
                fontSize: 28,
                textAlign: "center",
              }}
            >
              {" "}
              {/* Increased font size */}
              Comment voulez-vous ajouter?
            </DialogTitle>
          </DialogHeader>
          {/* Increased space-y to 6 for more pronounced spacing between buttons */}
          <View className="p-6 space-y-6">
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
              <Button
                key={index}
                variant="outline"
                onPress={item.onPress}
                style={{
                  backgroundColor: navColors.card,
                  borderColor: navColors.primary,
                  borderWidth: 2, // Slightly thicker border
                  paddingVertical: 16, // Increased vertical padding
                  borderRadius: 10, // More rounded corners
                }}
                className="w-full flex-row items-center justify-center"
              >
                <Icon
                  name={item.icon as any}
                  size={30} // Larger icon
                  color={navColors.primary}
                  style={{ marginRight: 14 }} // Increased margin
                />
                <Text
                  style={{
                    color: navColors.primary,
                    fontFamily: "Staatliches",
                    fontSize: 22,
                  }}
                >
                  {item.text}
                </Text>{" "}
                {/* Increased font size */}
              </Button>
            ))}
            <Button
              variant="ghost"
              className="mt-6 w-full" // Increased top margin
              style={{ paddingVertical: 14, borderRadius: 10 }} // Increased padding and rounding
              onPress={() => setShowUploadOptions(false)}
            >
              <Text
                style={{
                  color: navColors.text,
                  fontFamily: "Staatliches",
                  fontSize: 20,
                }}
              >
                Annuler
              </Text>{" "}
              {/* Increased font size */}
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      {files.length > 0 && (
        <View className="mt-2">
          <Accordion type="single" collapsible defaultValue="files">
            <AccordionItem
              value="files"
              className="rounded-lg"
              style={{
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                // Using a subtle shadow for the accordion as well
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
                elevation: 3,
              }}
            >
              <AccordionTrigger
                className="py-3 px-4"
                style={{
                  backgroundColor: navColors.background, // Use navColors
                  borderTopLeftRadius: 7,
                  borderTopRightRadius: 7,
                }}
              >
                <View className="flex-row items-center">
                  <Icon
                    name="file-multiple"
                    size={20}
                    color={navColors.primary}
                  />
                  <Text
                    className="ml-2 font-medium"
                    style={{
                      color: navColors.text,
                      fontFamily: "Staatliches",
                      fontSize: 16,
                    }} // Apply Staatliches font and navColors
                  >
                    Fichiers téléchargés ({files.length})
                  </Text>
                </View>
              </AccordionTrigger>
              <AccordionContent
                className="p-2"
                style={{
                  backgroundColor: navColors.card, // Use navColors
                  borderBottomLeftRadius: 7,
                  borderBottomRightRadius: 7,
                }}
              >
                <View className="flex-row flex-wrap justify-start">
                  {files.map((file, index) => {
                    const isImage = isImageFile(file.uri);
                    const displayName = getDisplayName(file);

                    return (
                      <View
                        key={`file-${index}-${file.uri}`}
                        className="m-1.5 relative p-1 rounded-md border items-center"
                        style={{
                          width: 80,
                          backgroundColor: navColors.background,
                          borderColor: navColors.border,
                        }} // Use navColors
                      >
                        <TouchableOpacity
                          onPress={() => {
                            /* Implement file preview or options */
                          }}
                          className="items-center"
                        >
                          {isImage ? (
                            <Avatar
                              alt={displayName}
                              className="h-12 w-12 rounded-md mb-1"
                            >
                              <AvatarImage
                                source={{ uri: file.uri }}
                                className="rounded-md"
                              />
                              <AvatarFallback
                                style={{
                                  backgroundColor: navColors.background,
                                }}
                              >
                                <Text
                                  style={{
                                    color: navColors.primary,
                                    fontFamily: "Staatliches",
                                  }}
                                >
                                  {displayName.substring(0, 1)}
                                </Text>
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <View
                              className="h-12 w-12 rounded-md mb-1 items-center justify-center"
                              style={{ backgroundColor: navColors.background }}
                            >
                              <Icon
                                name={
                                  file.type === "application/pdf"
                                    ? "file-pdf-box"
                                    : "file-outline"
                                }
                                size={28}
                                color={navColors.primary}
                              />
                            </View>
                          )}
                          <Text
                            numberOfLines={1}
                            ellipsizeMode="tail"
                            className="text-xs text-center"
                            style={{
                              color: navColors.text,
                              maxWidth: 70,
                              fontFamily: "Staatliches",
                            }}
                          >
                            {displayName}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => removeFile(file.uri)}
                          style={{
                            position: "absolute",
                            top: -5,
                            right: -5,
                            backgroundColor: navColors.border,
                            borderRadius: 10,
                            padding: 2,
                          }}
                        >
                          <Icon
                            name="close-circle"
                            size={18}
                            color={navColors.notification}
                          />
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}

      {isUploading && (
        <Animated.View
          entering={Platform.OS !== "web" ? FadeInUp : undefined}
          style={[
            styles.uploadProgressContainer,
            {
              backgroundColor: navColors.card,
              borderColor: navColors.border,
            },
          ]}
        >
          <View style={styles.uploadProgressContent}>
            <View style={styles.uploadProgressHeader}>
              <Icon
                name="cloud-upload-outline"
                size={22}
                color={navColors.primary}
                style={{ marginRight: 8 }}
              />
              <Text
                style={{
                  color: navColors.text,
                  fontFamily: "Staatliches",
                  fontSize: 18,
                }}
              >
                Téléchargement en cours...
              </Text>
            </View>

            <View style={styles.progressBarWithPercentage}>
              <Progress
                value={uploadProgress}
                className="flex-1 h-3"
                style={{ backgroundColor: `${navColors.background}80` }} // Semi-transparent background
                indicatorClassName="bg-primary"
              />
              <View style={styles.percentageContainer}>
                <Text
                  style={{
                    color: navColors.text,
                    fontFamily: "Staatliches",
                    fontSize: 16,
                  }}
                >
                  {uploadProgress}%
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16, // Uniform padding for the scroll content
    paddingBottom: 80, // Ensure space for progress bar if it's fixed at bottom
  },
  alertContainer: {
    width: "100%",
    alignItems: "center", // Center children horizontally
    marginBottom: 10,
  },
  uploadProgressContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    zIndex: 10,
  },
  uploadProgressContent: {
    width: "100%",
  },
  uploadProgressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    justifyContent: "center",
  },
  progressBarWithPercentage: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
  },
  percentageContainer: {
    marginLeft: 10,
    minWidth: 40,
    alignItems: "center",
  },
  // Removed card style from here as it's handled by Card component + inline styles
  modalContent: {
    // Kept for reference if Dialog styling needs direct StyleSheet
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    width: "90%",
    maxHeight: "80%",
  },
});

export default UploadStep;
