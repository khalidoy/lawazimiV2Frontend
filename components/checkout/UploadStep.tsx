import * as React from "react";
import {
  Platform,
  ScrollView,
  TouchableOpacity,
  View,
  StyleSheet,
} from "react-native";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "~/components/ui/card";
import {
  Search,
  FileText,
  List,
  Camera,
  ImageIcon,
  File,
  X,
  ChevronDown,
  UploadCloud,
  ShoppingCart,
} from "lucide-react-native";
import { Separator } from "~/components/ui/separator";
import * as ImagePicker from "expo-image-picker";
import * as DocumentPicker from "expo-document-picker";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { Avatar, AvatarImage } from "~/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import { useColorScheme } from "~/lib/useColorScheme";
import { THEME_COLORS } from "~/lib/constants";
import { useRouter } from "expo-router"; // Import useRouter

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
  // router?: any; // Optional: if direct navigation from here is needed, pass router instance
}

export default function UploadStep({
  onNext,
  onUploadImage,
  onSelectItems,
  selectedItems,
  uploadedImages,
  fileMetadata = {}, // Default to empty object if not provided
  onFileMetadataChange = () => {}, // Default to no-op if not provided
  onUploadStatusChange = () => {}, // Default to no-op if not provided
}: UploadStepProps) {
  const router = useRouter(); // Initialize router here
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? THEME_COLORS.dark : THEME_COLORS.light;
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showUploadOptions, setShowUploadOptions] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [uploadProgress, setUploadProgress] = React.useState(0);

  // Store a persistent mapping between URIs and file metadata
  const [fileMap, setFileMap] = React.useState<Map<string, FileItem>>(
    new Map()
  );

  // Helper function to create a file item from a URI
  const createFileItem = (uri: string): FileItem => {
    // First check if we already have this file in our map
    // This ensures we preserve the original name
    const existingFile = fileMap.get(uri);
    if (existingFile) {
      return existingFile;
    }

    // Otherwise, extract filename from URI (for new files)
    let filename = "file";
    try {
      // Get the last part of the path
      const parts = uri.split("/");
      if (parts.length > 0) {
        filename = parts[parts.length - 1].split("?")[0];
        filename = decodeURIComponent(filename);
      }
    } catch (e) {
      const ext = getFileExtension(uri);
      filename = `file-${Date.now()}.${ext || "unknown"}`;
    }

    return {
      uri,
      name: filename,
      type: getFileType(uri),
    };
  };

  // On component mount, create file objects for existing URIs
  React.useEffect(() => {
    if (uploadedImages.length > 0) {
      const newFileMap = new Map<string, FileItem>();

      uploadedImages.forEach((uri) => {
        newFileMap.set(uri, createFileItem(uri));
      });

      setFileMap(newFileMap);
    }
  }, []); // Empty dependency array - only run once on mount

  // Update fileMap when uploadedImages changes
  React.useEffect(() => {
    const currentUris = Array.from(fileMap.keys());
    const newUris = uploadedImages.filter((uri) => !currentUris.includes(uri));
    const removedUris = currentUris.filter(
      (uri) => !uploadedImages.includes(uri)
    );

    if (newUris.length > 0 || removedUris.length > 0) {
      const newFileMap = new Map(fileMap);

      // Add new URIs
      newUris.forEach((uri) => {
        newFileMap.set(uri, createFileItem(uri));
      });

      // Remove URIs that are no longer in uploadedImages
      removedUris.forEach((uri) => {
        newFileMap.delete(uri);
      });

      setFileMap(newFileMap);
    }
  }, [uploadedImages]); // Only depend on uploadedImages, not fileMap

  // Helper to get file extension from URI - not in a useEffect
  const getFileExtension = (uri: string) => {
    return uri.split(".").pop()?.toLowerCase() || "";
  };

  // Helper to determine if a file is an image - not in a useEffect
  const isImageFile = (uri: string) => {
    const ext = getFileExtension(uri);
    return ["jpg", "jpeg", "png", "gif", "bmp", "webp"].includes(ext);
  };

  // Helper to get file type - not in a useEffect
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

  // Request permissions on component mount
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

  // Upload functionality placeholder
  const handleUpload = () => {
    // In a real app, this would open the camera/gallery
    // For now, simulate adding an image URL
    const mockImage =
      "https://example.com/uploaded-image-" + Date.now() + ".jpg";
    onUploadImage([...uploadedImages, mockImage]);
  };

  // Mock product data
  const PRODUCTS = [
    {
      id: "1",
      name: "Math Textbook Grade 10",
      price: 25.99,
      category: "Books",
    },
    {
      id: "2",
      name: "Premium Notebook Set",
      price: 12.5,
      category: "Stationery",
    },
    { id: "3", name: "Student Backpack", price: 35.99, category: "Backpacks" },
    {
      id: "4",
      name: "Watercolor Paint Set",
      price: 18.75,
      category: "Art Supplies",
    },
  ];

  // Filter products based on search query
  const filteredProducts = PRODUCTS.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Toggle item selection
  const toggleItemSelection = (item: {
    id: string;
    name: string;
    price: number;
    category: string;
  }) => {
    if (selectedItems.some((i) => i.id === item.id)) {
      onSelectItems(selectedItems.filter((i) => i.id !== item.id));
    } else {
      onSelectItems([...selectedItems, item]);
    }
  };

  // Function to take a photo
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        // Process the image and add to uploadedImages
        onUploadImage([...uploadedImages, result.assets[0].uri]);
        setShowUploadOptions(false);
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      alert("Failed to take photo. Please try again.");
    }
  };

  // Function to simulate upload progress
  const simulateUploadProgress = (
    callback: (images: string[]) => void,
    images: string[]
  ) => {
    setIsUploading(true);
    setUploadProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);

      if (progress >= 100) {
        clearInterval(interval);
        setIsUploading(false);
        callback(images);
      }
    }, 150);
  };

  // Function to pick an image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false, // Disable editing to allow multiple selection
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newFileMap = new Map(fileMap);
        const newUris: string[] = [];

        result.assets.forEach((asset) => {
          const uri = asset.uri;
          newUris.push(uri);

          // Extract filename from URI
          let filename = uri.split("/").pop() || `image-${Date.now()}.jpg`;

          // Store in file map
          newFileMap.set(uri, {
            uri,
            name: filename,
            type: "image/jpeg",
          });
        });

        setShowUploadOptions(false);

        // Simulate upload with progress
        simulateUploadProgress(() => {
          setFileMap(newFileMap);
          onUploadImage([...uploadedImages, ...newUris]);
        }, newUris);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      alert("Failed to select image. Please try again.");
    }
  };

  // Store file metadata persistently in AsyncStorage
  React.useEffect(() => {
    // Load saved file metadata on component mount
    const loadSavedMetadata = async () => {
      try {
        // For debugging - check what files we're working with initially
        console.log("Initial uploadedImages:", uploadedImages);

        // Create a new file map with the metadata we have
        const newFileMap = new Map<string, FileItem>();

        // Process each uploaded image and try to use saved metadata or create new
        for (const uri of uploadedImages) {
          // First try to get from existing map
          if (fileMap.has(uri)) {
            newFileMap.set(uri, fileMap.get(uri)!);
            continue;
          }

          // For new URIs, we need to create fresh metadata
          // But FIRST, check if this is a document from a previous upload
          // Extract UUID from the URI which is more stable than the full path
          const uuidMatch = uri.match(
            /([0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12})/i
          );
          const fileId = uuidMatch ? uuidMatch[0] : null;

          // Use filename from the URI as fallback
          let filename = uri.split("/").pop() || "file";
          let fileType = getFileType(uri);

          // Add the file to our map
          newFileMap.set(uri, {
            uri,
            name: filename,
            type: fileType,
          });
        }

        // Update the file map state
        setFileMap(newFileMap);
      } catch (error) {
        console.error("Error loading file metadata:", error);
      }
    };

    loadSavedMetadata();
  }, []);

  // Use the persistent fileMetadata from props instead of a local ref
  const fileMetadataRef = React.useRef<Record<string, string>>(fileMetadata);

  // When fileMetadataRef changes, propagate to parent
  React.useEffect(() => {
    if (Object.keys(fileMetadataRef.current).length > 0) {
      onFileMetadataChange(fileMetadataRef.current);
    }
  }, [fileMetadataRef.current]);

  // Function to pick a document (PDF, etc.)
  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          "application/pdf",
          "image/*",
          "application/msword",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        copyToCacheDirectory: true,
        multiple: true, // Allow multiple file selection
      });

      if (
        result.canceled === false &&
        result.assets &&
        result.assets.length > 0
      ) {
        console.log("Picked documents:", JSON.stringify(result.assets));

        setShowUploadOptions(false);
        setIsUploading(true);
        setUploadProgress(0);

        // Create a temporary map for the files we're adding
        const tempFileMap = new Map(fileMap);
        const newUris: string[] = []; // Define newUris array here

        // Add document files to our lists
        result.assets.forEach((file) => {
          const uri = file.uri;
          newUris.push(uri);

          // Extract the filename part from the URI to use as a stable identifier
          const filenamePart = uri.split("/").pop() || "";

          // Store mapping from filename to original name - directly update both ref and parent
          if (file.name) {
            fileMetadataRef.current[filenamePart] = file.name;
            // Also update parent immediately
            onFileMetadataChange({ ...fileMetadataRef.current });
            console.log(
              `Stored filename mapping: ${filenamePart} → ${file.name}`
            );
          }

          // Ensure we preserve the original file name
          tempFileMap.set(uri, {
            uri: file.uri,
            name: file.name || "Unknown File",
            type: file.mimeType || getFileType(file.uri),
          });

          console.log(`Set file in map: ${uri} → ${file.name}`);
        });

        // Use a progress simulation
        let progress = 0;
        const interval = setInterval(() => {
          progress += 10;
          setUploadProgress(progress);

          if (progress >= 100) {
            clearInterval(interval);
            setIsUploading(false);

            // Set the file map with our temporary map that includes the original names
            setFileMap(tempFileMap);

            // Log the final state for debugging
            console.log(
              "Final fileMap entries:",
              Array.from(tempFileMap.entries())
            );

            onUploadImage([...uploadedImages, ...newUris]);
          }
        }, 150);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      alert("Failed to select document. Please try again.");
    }
  };

  // Function to remove an uploaded image
  const removeImage = (imageUri: string) => {
    onUploadImage(uploadedImages.filter((uri) => uri !== imageUri));
  };

  // Update remove function
  const removeFile = (uri: string) => {
    // Only update parent component - fileMap will be updated via useEffect
    onUploadImage(uploadedImages.filter((imgUri) => imgUri !== uri));
  };

  // Get files as array - derive from fileMap, don't set in state
  const files = React.useMemo(() => {
    return Array.from(fileMap.values());
  }, [fileMap]);

  // Get the actual count of unique files
  const uniqueFileCount = React.useMemo(() => {
    // Create a Set of all file URIs to eliminate duplicates
    const allUris = new Set([
      ...uploadedImages,
      ...files.map((file) => file.uri),
    ]);
    return allUris.size;
  }, [uploadedImages, files]);

  // Override file display name if original name is available
  const getDisplayName = (file: FileItem): string => {
    // First check if the name property is already not a UUID
    if (
      file.name &&
      !file.name.match(
        /^[0-9A-F]{8}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{4}-[0-9A-F]{12}/i
      )
    ) {
      return file.name;
    }

    // Get filename part from URI
    const filenamePart = file.uri.split("/").pop() || "";

    // Check if we have a stored mapping for this filename - check both ref and props
    if (fileMetadataRef.current[filenamePart] || fileMetadata[filenamePart]) {
      const storedName =
        fileMetadataRef.current[filenamePart] || fileMetadata[filenamePart];
      console.log(`Retrieved stored name for ${filenamePart}: ${storedName}`);
      return storedName;
    }

    // Fallback: return the stored name or extract from URI
    return file.name || filenamePart || "Unknown File";
  };

  // Update isUploading to notify parent component
  React.useEffect(() => {
    onUploadStatusChange(isUploading);
  }, [isUploading, onUploadStatusChange]);

  return (
    <ScrollView
      className="flex-1 p-1 bg-background"
      contentContainerStyle={{ paddingBottom: 80 }}
      alwaysBounceVertical={false}
    >
      {/* Option 1: Upload a list or photo */}
      <Card
        className="mb-4 bg-card border-border shadow-sm rounded-lg" // Changed shadow-md to shadow-sm
        style={{
          borderColor: colors.border,
          shadowColor: colors.foreground + "33",
        }} // Lighter shadow color
      >
        <CardHeader className="p-4 pb-2">
          {" "}
          // Reduced padding
          <View className="flex-row items-center">
            <View className="bg-primary/10 p-2 rounded-full mr-3">
              {" "}
              // Reduced padding, margin
              <UploadCloud size={28} color={colors.primary} /> // Reduced icon
              size
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                Importer votre Liste
              </Text>
              <Text className="text-xs text-muted-foreground">
                Rapide et facile
              </Text>
            </View>
          </View>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {" "}
          // Reduced padding
          <Text className="text-sm text-muted-foreground mb-3 leading-snug">
            Prenez une photo de votre liste de courses manuscrite, ou
            téléchargez un fichier (PDF, JPG, PNG).
          </Text>
          <Button
            variant="default"
            className="w-full py-2.5 bg-primary active:opacity-80" // Reduced py
            onPress={() => setShowUploadOptions(true)}
          >
            <ImageIcon
              size={20}
              color={colors["primary-foreground"]}
              className="mr-2"
            />
            <Text className="text-primary-foreground text-base font-semibold">
              Télécharger ou Photographier
            </Text>
          </Button>
        </CardContent>
      </Card>

      {/* Option 2: Choose items manually */}
      <Card
        className="mb-4 bg-card border-border shadow-sm rounded-lg" // Changed shadow-md to shadow-sm
        style={{
          borderColor: colors.border,
          shadowColor: colors.foreground + "33",
        }} // Lighter shadow color
      >
        <CardHeader className="p-4 pb-2">
          {" "}
          // Reduced padding
          <View className="flex-row items-center">
            <View className="bg-primary/10 p-2 rounded-full mr-3">
              {" "}
              // Reduced padding, margin
              <ShoppingCart size={28} color={colors.primary} /> // Reduced icon
              size
            </View>
            <View className="flex-1">
              <Text className="text-xl font-bold text-foreground">
                Sélection Manuelle
              </Text>
              <Text className="text-xs text-muted-foreground">
                Contrôle total
              </Text>
            </View>
          </View>
        </CardHeader>
        <CardContent className="p-4 pt-2">
          {" "}
          // Reduced padding
          <Text className="text-sm text-muted-foreground mb-3 leading-snug">
            Parcourez notre catalogue et ajoutez des articles un par un à votre
            panier.
          </Text>
          <Button
            variant="default" // Changed from outline to default
            className="w-full py-2.5 bg-primary active:opacity-80" // Added bg-primary
            onPress={() => router.push("/(main)/store")} // Changed to use simple path
          >
            <Search
              size={20}
              color={colors["primary-foreground"]} // Changed to primary-foreground
              className="mr-2"
            />
            <Text className="text-primary-foreground text-base font-semibold">
              Parcourir le Magasin
            </Text>
          </Button>
        </CardContent>
      </Card>

      {/* Upload Options Dialog */}
      <Dialog open={showUploadOptions} onOpenChange={setShowUploadOptions}>
        <DialogContent className="w-[90%] p-0 bg-card">
          <DialogHeader className="p-5 border-b border-border items-center">
            <DialogTitle className="text-xl text-center font-semibold text-foreground">
              Comment voulez-vous ajouter votre liste?
            </DialogTitle>
          </DialogHeader>
          <View className="p-5 space-y-3">
            {" "}
            {/* Adjusted padding and spacing */}
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-lg border border-border bg-background"
              onPress={() => {
                takePhoto();
                setShowUploadOptions(false); // Close dialog after action
              }}
            >
              <Camera size={30} color={colors.primary} className="mr-3" />
              <Text className="text-lg font-medium text-foreground">
                Prendre une photo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-lg border border-border bg-background"
              onPress={() => {
                pickImage();
                // setShowUploadOptions(false); // Decide if modal should close after picking multiple images
              }}
            >
              <ImageIcon size={30} color={colors.primary} className="mr-3" />
              <Text className="text-lg font-medium text-foreground">
                Choisir des images
              </Text>
              <Text className="text-xs ml-auto text-muted-foreground">
                (plusieurs)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="flex-row items-center p-4 rounded-lg border border-border bg-background"
              onPress={() => {
                pickDocument();
                // setShowUploadOptions(false); // Decide if modal should close after picking multiple documents
              }}
            >
              <File size={30} color={colors.primary} className="mr-3" />
              <Text className="text-lg font-medium text-foreground">
                Choisir un document
              </Text>
            </TouchableOpacity>
            <Button
              variant="outline"
              className="mt-4 w-full" // Added w-full for full width
              onPress={() => setShowUploadOptions(false)}
            >
              <Text className="text-center">Annuler</Text>
            </Button>
          </View>
        </DialogContent>
      </Dialog>

      {/* Display uploaded files section with proper theming */}
      {files.length > 0 && (
        <View className="mt-2">
          <Accordion type="single" collapsible defaultValue="files">
            <AccordionItem
              value="files"
              className="rounded-lg bg-card" // Removed border and border-primary from className
              style={{
                // Shadow properties for iOS
                shadowColor: "#000000",
                shadowOffset: { width: 0, height: 2 }, // Adjusted for visibility
                shadowOpacity: 0.15, // Slightly increased opacity
                shadowRadius: 4.84, // Adjusted radius
                // Elevation for Android
                elevation: 4, // Slightly increased elevation
                // Theme-aware background and border colors
                backgroundColor: colors.card,
                borderColor: colors.border, // Changed from colors.primary to colors.border
                borderWidth: 1, // Explicitly set borderWidth if not in className
              }}
            >
              <AccordionTrigger className="py-2 px-3 bg-primary/10">
                <View className="flex-row items-center">
                  <File size={18} className="text-primary" />
                  <Text className="ml-2 text-primary font-medium">
                    Fichiers téléchargés ({files.length})
                  </Text>
                </View>
              </AccordionTrigger>
              <AccordionContent className="p-2 bg-card">
                <View className="flex-row flex-wrap justify-start">
                  {files.map((file, index) => {
                    const isImage = isImageFile(file.uri);
                    const displayName = getDisplayName(file);

                    return (
                      <View key={`file-${index}`} className="m-1 relative">
                        {isImage ? (
                          <Avatar
                            alt="Uploaded image"
                            className="h-16 w-16 rounded-md"
                          >
                            <AvatarImage
                              source={{ uri: file.uri }}
                              className="rounded-md"
                            />
                          </Avatar>
                        ) : (
                          <View className="h-16 w-16 rounded-md bg-muted border border-border items-center justify-center p-1">
                            <File size={24} color={colors.primary} />
                            <Text
                              className="text-xs text-foreground text-center mt-1"
                              numberOfLines={1}
                            >
                              {displayName.length > 8
                                ? displayName.substring(0, 8) + " ..."
                                : displayName}
                            </Text>
                          </View>
                        )}
                        <Button
                          onPress={() => removeFile(file.uri)}
                          className="absolute -top-1 -right-1 bg-destructive rounded-full p-0 h-6 w-6 flex items-center justify-center"
                          size="icon"
                        >
                          <X
                            size={12}
                            color={colors["destructive-foreground"]}
                          />
                        </Button>
                      </View>
                    );
                  })}
                </View>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </View>
      )}

      {/* Upload progress indicator with theme colors */}
      {isUploading && (
        <View className="absolute bottom-0 left-0 right-0 bg-card p-3 border-t border-border z-10">
          <Text className="text-center font-medium mb-2 text-foreground">
            Téléchargement en cours...
          </Text>
          <View className="h-2 bg-muted rounded-full overflow-hidden">
            <View
              className="h-full bg-primary"
              style={{ width: `${uploadProgress}%` }}
            />
          </View>
          <Text className="text-right text-xs mt-1 text-muted-foreground">
            {uploadProgress}%
          </Text>
        </View>
      )}
    </ScrollView>
  );
}

// Update the StyleSheet to fully use theme variables
const styles = StyleSheet.create({
  cardContainerBase: {
    // Renamed from cardContainer
    // backgroundColor: "var(--color-card)", // Removed
    borderRadius: 12,
    borderWidth: 1.5,
    // borderColor: "var(--color-primary)", // Removed
    marginBottom: 15,
    elevation: 5, // Increased elevation for a bit more "pop" on Android
    // shadowColor: "var(--color-primary)", // Removed
    shadowOffset: { width: 0, height: 3 }, // Slightly increased offset
    shadowOpacity: 0.25, // Slightly increased opacity
    shadowRadius: 5, // Slightly increased radius
  },
  innerCardContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    minHeight: 90,
  },
  cardIconContainer: {
    // backgroundColor: "var(--color-primary-muted)", // Removed, handled by className="bg-primary/10"
    borderRadius: 16,
    padding: 12,
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center",
    width: 70,
    height: 70,
  },
});
