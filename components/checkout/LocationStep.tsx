import * as React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView,
  Linking,
  Alert as RNAlert,
  Dimensions,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInUp,
  FadeInDown,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Alert, AlertDescription } from "~/components/ui/alert";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Interface for Google Places suggestions
interface PlaceSuggestion {
  latitude: number;
  longitude: number;
  formattedAddress?: string;
  placeId?: string;
  addressComponents?: any[];
}

// Union type for suggestions
type SuggestionType = ExpoLocation.LocationGeocodedLocation | PlaceSuggestion;

// Helper function to format address from Google Places or ExpoLocation
const formatAddress = (
  location: ExpoLocation.LocationGeocodedAddress | PlaceSuggestion
): string => {
  if (!location) return "Unknown location";

  console.log("🏠 Formatting address for:", location);

  // Handle Google Places formatted address
  if ("formattedAddress" in location && location.formattedAddress) {
    console.log("✅ Using Google Places formatted address");
    return location.formattedAddress;
  }

  // Handle ExpoLocation format
  if ("name" in location || "city" in location || "region" in location) {
    const addressParts: string[] = [];

    // Try different properties that might contain address info
    if (location.name && typeof location.name === "string") {
      const isCoordinates = /^[\d\.-]+,\s*[\d\.-]+$/.test(location.name);
      if (!isCoordinates) {
        addressParts.push(location.name);
        console.log("📍 Added name:", location.name);
      }
    }

    let streetAddress = "";
    if (location.streetNumber && typeof location.streetNumber === "string") {
      streetAddress += location.streetNumber + " ";
    }
    if (location.street && typeof location.street === "string") {
      streetAddress += location.street;
    }
    if (streetAddress.trim()) {
      addressParts.push(streetAddress.trim());
      console.log("🛣️ Added street:", streetAddress.trim());
    }

    if (location.city && typeof location.city === "string") {
      addressParts.push(location.city);
      console.log("🏙️ Added city:", location.city);
    }
    if (
      location.district &&
      typeof location.district === "string" &&
      location.district !== location.city
    ) {
      addressParts.push(location.district);
      console.log("🏘️ Added district:", location.district);
    }
    if (location.region && typeof location.region === "string") {
      addressParts.push(location.region);
      console.log("🗺️ Added region:", location.region);
    }
    if (location.postalCode && typeof location.postalCode === "string") {
      addressParts.push(location.postalCode);
      console.log("📮 Added postal code:", location.postalCode);
    }
    if (location.country && typeof location.country === "string") {
      addressParts.push(location.country);
      console.log("🌍 Added country:", location.country);
    }

    // Also try some additional properties that ExpoLocation might have
    if (location.subregion && typeof location.subregion === "string") {
      addressParts.push(location.subregion);
      console.log("📍 Added subregion:", location.subregion);
    }

    const uniqueAddressParts = [
      ...new Set(addressParts.filter((part) => part && part.trim() !== "")),
    ];

    console.log("📋 Final address parts:", uniqueAddressParts);

    if (uniqueAddressParts.length > 0) {
      const formattedAddress = uniqueAddressParts.join(", ");
      console.log("✅ Formatted address:", formattedAddress);
      return formattedAddress;
    }
  }

  // If we get here, try to show coordinates as a last resort
  if ("latitude" in location && "longitude" in location) {
    const coordsText = `📍 Lat: ${location.latitude.toFixed(
      5
    )}, Lng: ${location.longitude.toFixed(5)}`;
    console.log("🎯 Using coordinates:", coordsText);
    return coordsText;
  }

  console.log("❌ No address details available");
  return "Address details not available";
};

// Debounce function
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<F>): Promise<ReturnType<F>> =>
    new Promise((resolve) => {
      if (timeout) {
        clearTimeout(timeout);
      }
      timeout = setTimeout(() => resolve(func(...args)), waitFor);
    });
}

interface LocationStepProps {
  onNext: () => void;
  onLocationSelected: (location: {
    latitude: number;
    longitude: number;
  }) => void;
  position: { latitude: number | null; longitude: number | null };
}

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY; // Ensure you have this in your .env

// Define styles as a function that takes colors
const createStyles = (colors: typeof NAV_THEME.light) =>
  StyleSheet.create({
    mapContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
      marginHorizontal: 0, // Changed from 16 to 0 for 100% width
      marginBottom: 16,
      minHeight: 320,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
    mapContainerDeniedError: {
      height: 220,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 12,
      overflow: "hidden",
      marginVertical: 16,
      marginHorizontal: 0, // Changed from 16 to 0 for 100% width
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 6,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "30",
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      marginRight: 8,
      color: colors.text,
      fontSize: 16,
      height: 48,
    },
    clearButton: {
      padding: 6,
      borderRadius: 20,
      backgroundColor: colors.border + "20",
    },
    suggestionsContainer: {
      backgroundColor: colors.card,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border + "40",
      maxHeight: 220,
      marginHorizontal: 16,
      marginBottom: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      zIndex: 10,
    },
    suggestionItem: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "30",
    },
    suggestionText: {
      fontSize: 15,
      color: colors.text,
      lineHeight: 20,
    },
    currentLocationButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.25,
      shadowRadius: 8,
      elevation: 6,
      padding: 12,
      borderRadius: 8,
      marginHorizontal: 16,
      marginBottom: 16,
      // backgroundColor will be set by Button's variant via className
    },
    currentLocationButtonText: {
      marginLeft: 8,
      fontSize: 16,
      fontWeight: "500",
      // color will be set by Button's variant or explicitly
    },
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    contentContainer: {
      paddingBottom: 20,
    },
  });

export default function LocationStep({
  onNext,
  onLocationSelected,
  position,
}: LocationStepProps) {
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;
  const primaryButtonTextColor = NAV_THEME.dark.text; // hsl(0 0% 98%) - for primary buttons
  const styles = React.useMemo(() => createStyles(colors), [colors]); // Get screen dimensions for proper full-screen calculations
  const screenHeight = Dimensions.get("window").height;

  // Animation values
  const headerScale = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const mapScale = useSharedValue(0.9);
  const mapOpacity = useSharedValue(0);
  // Bottom sheet animation values
  const bottomSheetHeight = useSharedValue(100); // Much smaller initial collapsed height
  const bottomSheetOpacity = useSharedValue(1);
  const arrowRotation = useSharedValue(0); // Arrow rotation animation
  const expandedHeight = screenHeight * 0.6; // Only 60% of screen height instead of full
  const collapsedHeight = 100; // Much smaller collapsed height

  const [status, setStatus] = React.useState<
    "waiting" | "denied" | "granted" | "error"
  >("waiting");
  const [mapRegion, setMapRegion] = React.useState<Region | undefined>(
    undefined
  );
  const [searchText, setSearchText] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<SuggestionType[]>([]);
  const [additionalInfo, setAdditionalInfo] = React.useState("");
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] =
    React.useState(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] =
    React.useState(false);

  const mapRef = React.useRef<MapView>(null);
  // Initialize animations
  React.useEffect(() => {
    headerScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    headerOpacity.value = withTiming(1, { duration: 800 });
    mapScale.value = withSpring(1, { damping: 18, stiffness: 180 });
    mapOpacity.value = withTiming(1, { duration: 1000 });
  }, []); // Keyboard listeners for better UX
  React.useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      "keyboardDidShow",
      (event) => {
        // Adjust bottom sheet height based on keyboard height
        const keyboardHeight = event.endCoordinates.height;
        if (isBottomSheetExpanded) {
          // Reduce height when keyboard is visible
          const adjustedHeight = Math.max(
            expandedHeight - keyboardHeight + 100,
            400
          );
          bottomSheetHeight.value = withSpring(adjustedHeight, {
            damping: 20,
            stiffness: 400,
          });
        }
      }
    );

    const keyboardDidHideListener = Keyboard.addListener(
      "keyboardDidHide",
      () => {
        // Reset bottom sheet height when keyboard hides
        if (isBottomSheetExpanded) {
          bottomSheetHeight.value = withSpring(expandedHeight, {
            damping: 20,
            stiffness: 400,
          });
        }
      }
    );

    return () => {
      keyboardDidShowListener?.remove();
      keyboardDidHideListener?.remove();
    };
  }, [isBottomSheetExpanded]);
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));
  const mapAnimatedStyle = useAnimatedStyle(() => {
    // Create subtle map response to bottom sheet animation
    const bottomSheetProgress = interpolate(
      bottomSheetHeight.value,
      [collapsedHeight, expandedHeight],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { scale: mapScale.value },
        {
          // Subtle zoom effect when bottom sheet expands
          scale: interpolate(
            bottomSheetProgress,
            [0, 0.3, 1],
            [1, 0.998, 0.995],
            Extrapolate.CLAMP
          ),
        },
        {
          // Minimal Y translation for connection feel
          translateY: interpolate(
            bottomSheetProgress,
            [0, 1],
            [0, -2],
            Extrapolate.CLAMP
          ),
        },
      ],
      opacity: mapOpacity.value,
    };
  }); // Enhanced animated styles with ultra-smooth interpolation
  const bottomSheetAnimatedStyle = useAnimatedStyle(() => {
    const progress = interpolate(
      bottomSheetHeight.value,
      [collapsedHeight, expandedHeight],
      [0, 1],
      Extrapolate.CLAMP
    );

    return {
      height: bottomSheetHeight.value,
      opacity: bottomSheetOpacity.value,
      // Multi-axis transform for maximum fluidity
      transform: [
        {
          scaleX: interpolate(
            progress,
            [0, 0.5, 1],
            [0.985, 0.992, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          scaleY: interpolate(
            progress,
            [0, 0.3, 1],
            [0.995, 0.998, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          translateY: interpolate(
            progress,
            [0, 0.2, 1],
            [2, 1, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      // Dynamic shadow with smooth curves
      shadowOpacity: interpolate(
        progress,
        [0, 0.4, 0.8, 1],
        [0.12, 0.18, 0.25, 0.35],
        Extrapolate.CLAMP
      ),
      shadowRadius: interpolate(progress, [0, 1], [12, 24], Extrapolate.CLAMP),
      elevation: interpolate(
        progress,
        [0, 0.6, 1],
        [6, 12, 22],
        Extrapolate.CLAMP
      ),
      // Subtle border radius animation
      borderTopLeftRadius: interpolate(
        progress,
        [0, 1],
        [20, 24],
        Extrapolate.CLAMP
      ),
      borderTopRightRadius: interpolate(
        progress,
        [0, 1],
        [20, 24],
        Extrapolate.CLAMP
      ),
    };
  });
  const arrowAnimatedStyle = useAnimatedStyle(() => {
    const rotationProgress = interpolate(
      arrowRotation.value,
      [0, 90, 180],
      [0, 0.5, 1],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        {
          rotate: `${arrowRotation.value}deg`,
        },
        {
          // Enhanced scale animation with bounce effect
          scale: interpolate(
            rotationProgress,
            [0, 0.3, 0.6, 1],
            [1, 1.15, 1.05, 1],
            Extrapolate.CLAMP
          ),
        },
        {
          // Subtle Y translation for organic feel
          translateY: interpolate(
            rotationProgress,
            [0, 0.5, 1],
            [0, -1, 0],
            Extrapolate.CLAMP
          ),
        },
      ],
      // Dynamic opacity with smooth curves
      opacity: interpolate(
        rotationProgress,
        [0, 0.2, 0.5, 0.8, 1],
        [1, 0.9, 0.75, 0.9, 1],
        Extrapolate.CLAMP
      ),
    };
  }); // Bottom sheet animation functions with ultra-fluid spring physics
  const expandBottomSheet = () => {
    setIsBottomSheetExpanded(true);

    // Add gentle haptic feedback for expansion
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Sequenced animation for maximum fluidity
    // First: Quick prep animation
    bottomSheetOpacity.value = withTiming(0.95, { duration: 50 });

    // Main expansion with perfect spring physics
    bottomSheetHeight.value = withSpring(expandedHeight, {
      damping: 8, // Even lower damping for beautiful bounce
      stiffness: 220, // Reduced stiffness for smoother motion
      mass: 0.4, // Lighter mass for more responsive feel
    });

    // Arrow rotation with slight delay for staggered effect
    arrowRotation.value = withDelay(
      20,
      withSpring(180, {
        damping: 6, // Ultra-smooth arrow rotation
        stiffness: 180,
        mass: 0.3, // Ultra-light for instant response
      })
    );

    // Subtle map response animation
    mapScale.value = withDelay(
      30,
      withSpring(0.995, {
        damping: 20,
        stiffness: 300,
        mass: 0.5,
      })
    );

    // Restore opacity with perfect timing
    bottomSheetOpacity.value = withDelay(100, withTiming(1, { duration: 300 }));
  };
  const collapseBottomSheet = () => {
    setIsBottomSheetExpanded(false);

    // Add subtle haptic feedback for collapse
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Soft);

    // Sequenced collapse for smooth transition
    // First: Slight opacity reduction for visual feedback
    bottomSheetOpacity.value = withTiming(0.98, { duration: 50 });

    // Snappy but smooth collapse with perfect timing
    bottomSheetHeight.value = withSpring(collapsedHeight, {
      damping: 14, // Balanced damping for clean collapse
      stiffness: 280, // Crisp collapse motion
      mass: 0.5, // Controlled descent
    });

    // Arrow rotation back with slight anticipation
    arrowRotation.value = withSpring(0, {
      damping: 8,
      stiffness: 200,
      mass: 0.35,
    });

    // Return map to original scale
    mapScale.value = withSpring(1, {
      damping: 18,
      stiffness: 250,
      mass: 0.6,
    });

    // Restore full opacity after collapse
    bottomSheetOpacity.value = withDelay(150, withTiming(1, { duration: 200 }));
  };
  const handleInputFocus = () => {
    expandBottomSheet();
  };

  const handleInputBlur = () => {
    // Delay collapse to allow user to interact with expanded content
    setTimeout(() => {
      if (!isBottomSheetExpanded) return; // Don't collapse if already collapsed
      collapseBottomSheet();
    }, 300); // Longer delay for better UX
  };
  const getCurrentLocation = async () => {
    setIsFetchingCurrentLocation(true);
    try {
      let { status: permissionStatus } =
        await ExpoLocation.requestForegroundPermissionsAsync();
      if (permissionStatus !== "granted") {
        setStatus("denied");
        setIsFetchingCurrentLocation(false);
        // Optionally, guide user to settings
        // Linking.openSettings();
        return;
      }
      setStatus("granted");
      let location = await ExpoLocation.getCurrentPositionAsync({});
      const currentPos = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      onLocationSelected(currentPos);
      const newRegion = {
        ...currentPos,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };
      setMapRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }

      // Try Google reverse geocoding first
      try {
        if (GOOGLE_MAPS_API_KEY) {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentPos.latitude},${currentPos.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
          );
          const data = await response.json();

          if (data.results && data.results.length > 0) {
            setSearchText(data.results[0].formatted_address);
            setIsFetchingCurrentLocation(false);
            return;
          }
        }
      } catch (error) {
        console.error("Google reverse geocoding error:", error);
      }

      // Fallback to ExpoLocation
      const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync(
        currentPos
      );
      if (reverseGeocoded.length > 0) {
        setSearchText(formatAddress(reverseGeocoded[0]));
      }
    } catch (error) {
      console.error("Error getting current location:", error);
      setStatus("error");
    } finally {
      setIsFetchingCurrentLocation(false);
    }
  };

  React.useEffect(() => {
    (async () => {
      let { status: permissionStatus } =
        await ExpoLocation.requestForegroundPermissionsAsync();
      if (permissionStatus !== "granted") {
        setStatus("denied");
        const defaultLocation = {
          latitude: 36.778259,
          longitude: -119.417931,
        };
        onLocationSelected(defaultLocation);
        setMapRegion({
          ...defaultLocation,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        return;
      }
      setStatus("granted");
      try {
        if (position && position.latitude && position.longitude) {
          setMapRegion({
            latitude: position.latitude,
            longitude: position.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });

          // Try Google reverse geocoding first
          try {
            if (GOOGLE_MAPS_API_KEY) {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${position.latitude},${position.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
              );
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                setSearchText(data.results[0].formatted_address);
                return;
              }
            }
          } catch (error) {
            console.error("Google reverse geocoding error:", error);
          }

          // Fallback to ExpoLocation
          const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync({
            latitude: position.latitude,
            longitude: position.longitude,
          });
          if (reverseGeocoded.length > 0) {
            setSearchText(formatAddress(reverseGeocoded[0]));
          }
        } else {
          let location = await ExpoLocation.getCurrentPositionAsync({});
          const currentPos = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          onLocationSelected(currentPos);
          setMapRegion({
            ...currentPos,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });

          // Try Google reverse geocoding first
          try {
            if (GOOGLE_MAPS_API_KEY) {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${currentPos.latitude},${currentPos.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
              );
              const data = await response.json();

              if (data.results && data.results.length > 0) {
                setSearchText(data.results[0].formatted_address);
                return;
              }
            }
          } catch (error) {
            console.error("Google reverse geocoding error:", error);
          }

          // Fallback to ExpoLocation
          const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync(
            currentPos
          );
          if (reverseGeocoded.length > 0) {
            setSearchText(formatAddress(reverseGeocoded[0]));
          }
        }
      } catch (error) {
        console.error("Error getting initial position:", error);
        setStatus("error");
        const defaultLocationOnError = {
          latitude: 36.778259,
          longitude: -119.417931,
        };
        onLocationSelected(defaultLocationOnError);
        setMapRegion({
          ...defaultLocationOnError,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      }
    })();
  }, [onLocationSelected]);

  React.useEffect(() => {
    if (position && position.latitude && position.longitude) {
      const newRegion = {
        latitude: position.latitude,
        longitude: position.longitude,
        latitudeDelta: mapRegion?.latitudeDelta || 0.005,
        longitudeDelta: mapRegion?.longitudeDelta || 0.005,
      };
      if (
        mapRegion?.latitude !== newRegion.latitude ||
        mapRegion?.longitude !== newRegion.longitude ||
        mapRegion?.latitudeDelta !== newRegion.latitudeDelta || // also check zoom
        mapRegion?.longitudeDelta !== newRegion.longitudeDelta
      ) {
        setMapRegion(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 1000);
        }
      }
    }
  }, [position]);
  const handleMapPress = (e: any) => {
    const newPos = e.nativeEvent.coordinate;
    onLocationSelected(newPos);
    (async () => {
      try {
        let addressText = "";

        // Try Google Places reverse geocoding first if API key is available
        if (GOOGLE_MAPS_API_KEY) {
          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/geocode/json?latlng=${newPos.latitude},${newPos.longitude}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
            );
            const data = await response.json();

            if (data.results && data.results.length > 0) {
              addressText = data.results[0].formatted_address;
            }
          } catch (error) {
            console.error("Google reverse geocoding error:", error);
          }
        }

        // Fallback to ExpoLocation if Google API didn't work
        if (!addressText) {
          const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync(
            newPos
          );
          if (reverseGeocoded.length > 0) {
            addressText = formatAddress(reverseGeocoded[0]);
          }
        }

        if (addressText) {
          setSearchText(addressText);
          setSuggestions([]);
        }
      } catch (error) {
        console.error("Reverse geocoding error on map press:", error);
      }
    })();
  };
  const debouncedGeocode = React.useCallback(
    debounce(async (address: string) => {
      if (address.length < 3) {
        setSuggestions([]);
        return;
      }

      console.log("🔍 Starting geocode search for:", address);

      try {
        // Try Google Places Find Place from Text API first (like your old working version)
        if (
          GOOGLE_MAPS_API_KEY &&
          Platform.OS !== "web" &&
          address.length >= 3
        ) {
          console.log(
            "🏛️ Using Find Place from Text API for restaurants/monuments/businesses..."
          );
          try {
            const findPlaceResponse = await fetch(
              `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
                address
              )}&inputtype=textquery&fields=formatted_address,name,geometry,place_id,types&key=${GOOGLE_MAPS_API_KEY}`
            );
            const findPlaceData = await findPlaceResponse.json();

            if (
              findPlaceData.status === "OK" &&
              findPlaceData.candidates &&
              findPlaceData.candidates.length > 0
            ) {
              console.log("✅ Find Place results:", findPlaceData.candidates);

              const findPlaceSuggestions = findPlaceData.candidates
                .slice(0, 5)
                .map((candidate: any) => ({
                  latitude: candidate.geometry.location.lat,
                  longitude: candidate.geometry.location.lng,
                  formattedAddress: candidate.name
                    ? `${candidate.name} - ${candidate.formatted_address}`
                    : candidate.formatted_address,
                  placeId:
                    candidate.place_id ||
                    `findplace_${candidate.geometry.location.lat}_${candidate.geometry.location.lng}`,
                  types: candidate.types || [],
                }));

              setSuggestions(findPlaceSuggestions);
              return;
            }
          } catch (error) {
            console.error("❌ Find Place API request failed:", error);
          }
        }

        // Fallback to Google Places Autocomplete API for general address/city suggestions
        if (GOOGLE_MAPS_API_KEY && Platform.OS !== "web") {
          console.log("🌍 Fallback to Google Places Autocomplete API...");

          try {
            const response = await fetch(
              `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
                address
              )}&key=${GOOGLE_MAPS_API_KEY}&language=fr`
            );
            const data = await response.json();

            if (
              data.status === "OK" &&
              data.predictions &&
              data.predictions.length > 0
            ) {
              console.log("✅ Google Places predictions:", data.predictions);

              // Get place details for each prediction to get coordinates
              const detailedSuggestions = await Promise.all(
                data.predictions.slice(0, 5).map(async (prediction: any) => {
                  try {
                    const detailResponse = await fetch(
                      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry,formatted_address`
                    );
                    const detailData = await detailResponse.json();

                    if (
                      detailData.status === "OK" &&
                      detailData.result &&
                      detailData.result.geometry
                    ) {
                      return {
                        latitude: detailData.result.geometry.location.lat,
                        longitude: detailData.result.geometry.location.lng,
                        formattedAddress: prediction.description,
                        placeId: prediction.place_id,
                      } as PlaceSuggestion;
                    }
                  } catch (error) {
                    console.error("❌ Place details error:", error);
                  }
                  return null;
                })
              );

              const validSuggestions = detailedSuggestions.filter(
                (s) => s !== null
              );
              if (validSuggestions.length > 0) {
                console.log("🎯 Valid Google suggestions:", validSuggestions);
                setSuggestions(validSuggestions);
                return;
              }
            } else if (data.status !== "OK") {
              console.warn(
                "⚠️ Google Places API error:",
                data.status,
                data.error_message
              );
            }
          } catch (error) {
            console.error("❌ Google Places API request failed:", error);
          }
        }

        // Fallback to ExpoLocation with enhanced formatting
        console.log("📍 Fallback to ExpoLocation...");
        const geocodedLocations = await ExpoLocation.geocodeAsync(address);
        console.log("📋 ExpoLocation results:", geocodedLocations);

        if (geocodedLocations && geocodedLocations.length > 0) {
          console.log("✅ Found", geocodedLocations.length, "locations");

          // For each location, try to get a better formatted address using reverse geocoding
          const enhancedSuggestions = await Promise.all(
            geocodedLocations.slice(0, 5).map(async (location) => {
              try {
                // Use reverse geocoding to get better formatted address
                const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync({
                  latitude: location.latitude,
                  longitude: location.longitude,
                });

                if (reverseGeocoded && reverseGeocoded.length > 0) {
                  const reverseResult = reverseGeocoded[0];
                  console.log("🔄 Reverse geocoded result:", reverseResult);

                  // Create a better formatted address
                  const addressParts = [];

                  // Add city first (most important)
                  if (reverseResult.city) {
                    addressParts.push(reverseResult.city);
                  }

                  // Add region/state
                  if (
                    reverseResult.region &&
                    reverseResult.region !== reverseResult.city
                  ) {
                    addressParts.push(reverseResult.region);
                  }

                  // Add country
                  if (reverseResult.country) {
                    addressParts.push(reverseResult.country);
                  }

                  // If we have street address, add it at the beginning
                  if (reverseResult.name && !reverseResult.name.includes(",")) {
                    addressParts.unshift(reverseResult.name);
                  }

                  const formattedAddress =
                    addressParts.length > 0
                      ? addressParts.join(", ")
                      : `${reverseResult.city || "Unknown"}, ${
                          reverseResult.country || "Unknown"
                        }`;

                  console.log("✅ Enhanced address:", formattedAddress);

                  return {
                    latitude: location.latitude,
                    longitude: location.longitude,
                    formattedAddress: formattedAddress,
                    // Keep original data as backup
                    originalData: reverseResult,
                  };
                }

                // Fallback to original location data
                return {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  formattedAddress: `Location (${location.latitude.toFixed(
                    3
                  )}, ${location.longitude.toFixed(3)})`,
                  originalData: location,
                };
              } catch (error) {
                console.error("Error enhancing location:", error);
                return {
                  latitude: location.latitude,
                  longitude: location.longitude,
                  formattedAddress: `Location (${location.latitude.toFixed(
                    3
                  )}, ${location.longitude.toFixed(3)})`,
                  originalData: location,
                };
              }
            })
          );

          console.log("📋 Enhanced suggestions:", enhancedSuggestions);
          setSuggestions(enhancedSuggestions);
        } else {
          console.log("❌ No results from ExpoLocation");
          setSuggestions([]);
        }
      } catch (error) {
        console.error("❌ Geocoding error:", error);
        setSuggestions([]);
      }
    }, 800), // Reduced debounce time for better UX
    []
  );

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (Platform.OS === "web" && !GOOGLE_MAPS_API_KEY) {
      if (text.length > 2) debouncedGeocode(text);
      else setSuggestions([]);
      return;
    }
    if (text.length > 2) debouncedGeocode(text);
    else setSuggestions([]);
  };
  const handleSuggestionPress = (suggestion: SuggestionType) => {
    Keyboard.dismiss();
    const newPos = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };
    onLocationSelected(newPos);

    const newRegion = {
      ...newPos,
      latitudeDelta: 0.005,
      longitudeDelta: 0.005,
    };
    setMapRegion(newRegion);
    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 1000);
    }

    // If it's a Google Places suggestion with formatted address, use that directly
    if ("formattedAddress" in suggestion && suggestion.formattedAddress) {
      setSearchText(suggestion.formattedAddress);
      setSuggestions([]);
      return;
    }

    // Otherwise, fallback to reverse geocoding
    (async () => {
      try {
        const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync(newPos);
        if (reverseGeocoded.length > 0) {
          setSearchText(formatAddress(reverseGeocoded[0]));
        } else {
          setSearchText(
            `Lat: ${newPos.latitude.toFixed(
              5
            )}, Lng: ${newPos.longitude.toFixed(5)}`
          );
        }
      } catch (e) {
        console.error("Error reverse geocoding suggestion:", e);
        setSearchText(
          `Lat: ${newPos.latitude.toFixed(5)}, Lng: ${newPos.longitude.toFixed(
            5
          )}`
        );
      }
    })();
    setSuggestions([]);
  };
  return (
    <View style={styles.container}>
      {/* Fixed Header */}
      <Animated.View
        entering={FadeInUp.duration(400).springify().damping(18)}
        style={{
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: 8,
          backgroundColor: colors.background,
          borderBottomWidth: 1,
          borderBottomColor: colors.border + "20",
          zIndex: 100,
        }}
      >
        <Text
          style={{
            color: colors.text,
            fontFamily: "Staatliches",
            fontSize: 16,
            fontWeight: "600",
            textAlign: "center",
          }}
        >
          📍 Sélectionnez votre adresse
        </Text>
      </Animated.View>
      {/* Main Map Container */}
      <Animated.View
        style={[
          {
            flex: 1,
            position: "relative",
          },
          mapAnimatedStyle,
        ]}
        entering={FadeInUp.duration(600).delay(100).springify().damping(18)}
      >
        {" "}
        <View
          style={
            status === "denied" || status === "error"
              ? [styles.mapContainerDeniedError, { flex: 1 }]
              : [
                  styles.mapContainer,
                  { flex: 1, margin: 0, borderRadius: 0, borderWidth: 0 },
                ] // Remove border and radius for full width
          }
        >
          {status === "waiting" && (
            <View
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
              }}
            >
              <ActivityIndicator size="large" color={colors.primary} />
              <Text
                style={{
                  color: colors.text,
                  marginTop: 12,
                  fontFamily: "Staatliches",
                  fontSize: 14,
                }}
              >
                Chargement de la carte...
              </Text>
            </View>
          )}
          {(status === "denied" || status === "error") && mapRegion && (
            <Animated.View
              entering={FadeInUp.duration(500)}
              style={{
                alignItems: "center",
                justifyContent: "center",
                flex: 1,
                padding: 20,
              }}
            >
              <Icon
                name={
                  status === "denied" ? "alert-circle-outline" : "alert-outline"
                }
                size={52}
                color={colors.notification}
              />
              <Text
                style={{
                  color: colors.notification,
                  textAlign: "center",
                  marginBottom: 8,
                  marginTop: 12,
                  fontFamily: "Staatliches",
                  fontSize: 16,
                  fontWeight: "600",
                }}
              >
                {status === "denied"
                  ? "Permission de Localisation Refusée"
                  : "Erreur de Chargement de la Carte"}
              </Text>
              <Text
                style={{
                  color: colors.text,
                  textAlign: "center",
                  marginBottom: 20,
                  fontSize: 13,
                  lineHeight: 18,
                  opacity: 0.8,
                }}
              >
                {status === "denied"
                  ? "Pour utiliser la carte et sélectionner votre emplacement, veuillez accorder les permissions de localisation."
                  : "Nous n'avons pas pu charger la carte. Vérifiez votre connexion ou réessayez."}
              </Text>
              {status === "denied" && (
                <Button
                  variant="outline"
                  onPress={() => Linking.openSettings()}
                  style={{
                    borderColor: colors.border,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                    elevation: 3,
                  }}
                >
                  <Text
                    style={{ color: colors.primary, fontFamily: "Staatliches" }}
                  >
                    Ouvrir les Paramètres
                  </Text>
                </Button>
              )}
            </Animated.View>
          )}
          {status === "granted" && mapRegion && (
            <MapView
              ref={mapRef}
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={mapRegion}
              onRegionChangeComplete={setMapRegion}
              onPress={handleMapPress}
              showsUserLocation={false}
              showsMyLocationButton={false}
              mapType={isDarkColorScheme ? "mutedStandard" : "standard"}
            >
              {position && position.latitude && position.longitude && (
                <Marker
                  coordinate={{
                    latitude: position.latitude,
                    longitude: position.longitude,
                  }}
                  pinColor={colors.primary}
                />
              )}
            </MapView>
          )}
        </View>{" "}
        {/* Floating Search Bar */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(200).springify().damping(18)}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            right: 16,
            zIndex: 10,
          }}
        >
          <View
            style={{
              backgroundColor: colors.card,
              borderRadius: 20, // Reduced from 25 to 20
              paddingHorizontal: 12, // Reduced from 16 to 12
              paddingVertical: 6, // Reduced from 8 to 6
              flexDirection: "row",
              alignItems: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 }, // Reduced shadow
              shadowOpacity: 0.2, // Reduced from 0.25
              shadowRadius: 12, // Reduced from 16
              elevation: 8, // Reduced from 12
              borderWidth: 1,
              borderColor: colors.border + "30",
            }}
          >
            <Icon name="magnify" size={16} color={colors.text + "60"} />{" "}
            {/* Reduced from 18 to 16 */}
            <Input
              style={{
                flex: 1,
                marginLeft: 10, // Reduced from 12 to 10
                backgroundColor: "transparent",
                color: colors.text,
                borderWidth: 0,
                height: 32, // Reduced from 36 to 32
                fontSize: 14, // Reduced from 15 to 14
                fontWeight: "500",
              }}
              placeholder="Rechercher une adresse..."
              placeholderTextColor={colors.text + "50"}
              value={searchText}
              onChangeText={handleSearchTextChange}
              autoCorrect={false}
              spellCheck={false}
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText("");
                  setSuggestions([]);
                }}
                style={{
                  padding: 5, // Reduced from 6 to 5
                  borderRadius: 12, // Reduced from 15 to 12
                  backgroundColor: colors.border + "20",
                }}
              >
                <Icon name="close" size={12} color={colors.text + "60"} />{" "}
                {/* Reduced from 14 to 12 */}
              </TouchableOpacity>
            )}
          </View>

          {/* Floating Suggestions */}
          {suggestions.length > 0 && (
            <Animated.View
              entering={FadeInDown.duration(300)}
              style={{
                backgroundColor: colors.card,
                borderRadius: 16,
                marginTop: 8,
                maxHeight: 200,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 12,
                borderWidth: 1,
                borderColor: colors.border + "30",
              }}
            >
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator={false}
              >
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={
                      item.latitude?.toString() +
                      item.longitude?.toString() +
                      index
                    }
                    style={{
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      borderBottomWidth: index < suggestions.length - 1 ? 1 : 0,
                      borderBottomColor: colors.border + "20",
                    }}
                    onPress={() => handleSuggestionPress(item)}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: colors.text,
                        lineHeight: 18,
                      }}
                    >
                      {(() => {
                        const address = formatAddress(item as any);
                        return address.length > 60
                          ? address.substring(0, 60) + "..."
                          : address;
                      })()}
                    </Text>
                  </TouchableOpacity>
                ))}{" "}
              </ScrollView>
            </Animated.View>
          )}
        </Animated.View>{" "}
        {/* Floating Current Location Button */}
        <Animated.View
          entering={FadeInUp.duration(600).delay(300).springify().damping(18)}
          style={{
            position: "absolute",
            bottom: 120, // Position above the smaller bottom sheet
            right: 16,
            zIndex: 10,
          }}
        >
          <TouchableOpacity
            onPress={getCurrentLocation}
            disabled={isFetchingCurrentLocation}
            style={{
              width: 50,
              height: 50,
              borderRadius: 25,
              backgroundColor: colors.primary,
              alignItems: "center",
              justifyContent: "center",
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.3,
              shadowRadius: 16,
              elevation: 12,
              borderWidth: 2,
              borderColor: colors.background,
            }}
          >
            {isFetchingCurrentLocation ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Icon name="crosshairs-gps" size={24} color="white" />
            )}
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>{" "}
      {/* Bottom Sheet for Additional Info */}
      <Animated.View
        entering={FadeInUp.duration(600).delay(400).springify().damping(18)}
        style={[
          {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: colors.card,
            borderTopLeftRadius: 20, // Smaller border radius
            borderTopRightRadius: 20,
            paddingHorizontal: 16, // Less padding
            paddingTop: 8, // Much less top padding
            paddingBottom: 16, // Less bottom padding
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -8 }, // Stronger shadow
            shadowOpacity: 0.25,
            shadowRadius: 20,
            elevation: 15, // Higher elevation
            borderTopWidth: 1,
            borderTopColor: colors.border + "20",
            minHeight: collapsedHeight, // Ensure minimum height
            maxHeight: "80%", // Reduced max height
          },
          bottomSheetAnimatedStyle,
        ]}
      >
        {" "}
        {/* Handle Bar with Arrow Icon */}
        <TouchableOpacity
          onPress={() => {
            if (isBottomSheetExpanded) {
              collapseBottomSheet();
            } else {
              expandBottomSheet();
            }
          }}
          style={{
            alignSelf: "center",
            paddingVertical: 6, // Much smaller touch area
            paddingHorizontal: 16, // Less horizontal padding
            marginBottom: 8, // Less margin
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <View
            style={{
              width: 40, // Shorter handle bar
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              opacity: 0.5,
              marginRight: 12,
            }}
          />
          <Animated.View style={arrowAnimatedStyle}>
            <Icon
              name="chevron-up"
              size={20}
              color={colors.text}
              style={{ opacity: 0.7 }}
            />
          </Animated.View>
          <View
            style={{
              width: 40, // Shorter handle bar
              height: 4,
              backgroundColor: colors.border,
              borderRadius: 2,
              opacity: 0.5,
              marginLeft: 12,
            }}
          />
        </TouchableOpacity>
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={false}
        >
          {" "}
          <Text
            style={{
              color: colors.text,
              fontFamily: "Staatliches",
              fontSize: 16, // Keep text size
              fontWeight: "600",
              marginBottom: 8, // Less space below title
              textAlign: "center",
            }}
          >
            🏠 Informations complémentaires
          </Text>
          {/* More compact input area */}
          <View
            style={{
              backgroundColor: colors.background,
              borderRadius: 12, // Smaller border radius
              borderWidth: 1,
              borderColor: colors.border + "30",
              paddingHorizontal: 12, // Less padding
              paddingVertical: 2, // Less vertical padding
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.08,
              shadowRadius: 8,
              elevation: 4,
              minHeight: 45, // Smaller minimum height
            }}
          >
            <Input
              placeholder="Appartement, étage, code d'accès..."
              value={additionalInfo}
              onChangeText={setAdditionalInfo}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onSubmitEditing={() => {
                Keyboard.dismiss();
                collapseBottomSheet();
              }}
              returnKeyType="done"
              blurOnSubmit={true}
              placeholderTextColor={colors.text + "50"}
              multiline={true} // Allow multiple lines              numberOfLines={isBottomSheetExpanded ? 3 : 1} // Fewer lines
              style={{
                backgroundColor: "transparent",
                borderWidth: 0,
                color: colors.text,
                fontSize: 16, // Keep font size
                fontWeight: "500",
                minHeight: isBottomSheetExpanded ? 60 : 35, // Much smaller height
                textAlignVertical: "top", // Align text to top for multiline
                paddingTop: 8, // Less vertical padding
                paddingBottom: 8,
              }}
            />
          </View>
          {/* Additional content shown when expanded */}
          {isBottomSheetExpanded && (
            <Animated.View
              entering={FadeInUp.duration(400).delay(200)}
              style={{
                marginTop: 16, // Less space when expanded
                flex: 1,
              }}
            >
              <Text
                style={{
                  color: colors.text,
                  fontSize: 16, // Keep text size
                  lineHeight: 22, // Smaller line height
                  textAlign: "center",
                  opacity: 0.8,
                  marginBottom: 12, // Less space
                  fontWeight: "500",
                }}
              >
                💡 Ajoutez des détails pour faciliter la livraison
              </Text>

              {/* Examples section with compact styling */}
              <View
                style={{
                  backgroundColor: colors.background + "80",
                  borderRadius: 12, // Smaller border radius
                  padding: 12, // Less padding
                  marginTop: 8, // Less margin
                  borderWidth: 1,
                  borderColor: colors.border + "20",
                }}
              >
                {" "}
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 15, // Keep font size
                    fontWeight: "600",
                    marginBottom: 8, // Less space
                    opacity: 0.8,
                    textAlign: "center",
                  }}
                >
                  📝 Exemples d'informations utiles :
                </Text>
                <Text
                  style={{
                    color: colors.text,
                    fontSize: 14, // Keep font size
                    lineHeight: 20, // Smaller line height
                    opacity: 0.7,
                  }}
                >
                  • Appartement 3B, 2ème étage{"\n"}• Bâtiment C, Résidence Al
                  Majd{"\n"}• Porte bleue, sonnette à gauche{"\n"}• Code d'accès
                  : 1234{"\n"}• Interphone : Nom de famille{"\n"}• Près du
                  café/épicerie XYZ{" "}
                </Text>
              </View>
            </Animated.View>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
