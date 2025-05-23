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
} from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

// Helper function to format address
const formatAddress = (
  location: ExpoLocation.LocationGeocodedAddress // Consistent type
): string => {
  if (!location) return "Unknown location";

  const addressParts: string[] = [];

  if (location.name && typeof location.name === "string") {
    const isCoordinates = /^[\\d\\.-]+,\\s*[\\d\\.-]+$/.test(location.name);
    if (!isCoordinates) {
      addressParts.push(location.name);
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
  }

  if (location.city && typeof location.city === "string") {
    addressParts.push(location.city);
  }
  if (
    location.district &&
    typeof location.district === "string" &&
    location.district !== location.city
  ) {
    addressParts.push(location.district);
  }
  if (location.region && typeof location.region === "string") {
    addressParts.push(location.region);
  }
  if (location.postalCode && typeof location.postalCode === "string") {
    addressParts.push(location.postalCode);
  }
  if (location.country && typeof location.country === "string") {
    addressParts.push(location.country);
  }

  const uniqueAddressParts = [
    ...new Set(addressParts.filter((part) => part && part.trim() !== "")),
  ];

  if (uniqueAddressParts.length > 0) {
    return uniqueAddressParts.join(", ");
  }

  // Removed fallback to lat/lng as LocationGeocodedAddress doesn't have them at root
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
      borderRadius: 8,
      overflow: "hidden",
      marginHorizontal: 16,
      marginBottom: 16,
      minHeight: 300,
    },
    mapContainerDeniedError: {
      height: 200,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
      overflow: "hidden",
      marginVertical: 16,
      marginHorizontal: 16,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: colors.card,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      // Removed marginHorizontal as CardContent will provide padding
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      marginRight: 8,
      color: colors.text, // Ensure text color is applied
      // Height will be controlled by NativeWind's `h-12` or similar
    },
    clearButton: {
      padding: 4,
    },
    suggestionsContainer: {
      backgroundColor: colors.card,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border,
      maxHeight: 200,
      marginHorizontal: 16,
      marginBottom: 8,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      // Added zIndex to ensure it appears above other elements if not in direct flow
      zIndex: 10,
    },
    suggestionItem: {
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    suggestionText: {
      fontSize: 16,
      color: colors.text,
    },
    currentLocationButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
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

  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [status, setStatus] = React.useState<
    "waiting" | "denied" | "granted" | "error"
  >("waiting");
  const [mapRegion, setMapRegion] = React.useState<Region | undefined>(
    undefined
  );
  const [searchText, setSearchText] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<
    ExpoLocation.LocationGeocodedLocation[] // Changed type
  >([]);
  const [additionalInfo, setAdditionalInfo] = React.useState("");
  const [isFetchingCurrentLocation, setIsFetchingCurrentLocation] =
    React.useState(false);

  const mapRef = React.useRef<MapView>(null);

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
        const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync(newPos);
        if (reverseGeocoded.length > 0) {
          setSearchText(formatAddress(reverseGeocoded[0]));
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
      try {
        // ExpoLocation.geocodeAsync does not take region biasing options directly.
        const geocodedLocations = await ExpoLocation.geocodeAsync(address); // Removed options
        setSuggestions(geocodedLocations);
      } catch (error) {
        console.error("Geocoding error:", error);
        setSuggestions([]);
      }
    }, 1000),
    [] // Removed mapRegion dependency as it's not used in geocodeAsync options
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

  const handleSuggestionPress = (
    suggestion: ExpoLocation.LocationGeocodedLocation // Changed type
  ) => {
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

  const handleNextPress = () => {
    // Here, you might want to pass additionalInfo along with the location
    // For now, just calling onNext as per original structure
    onNext();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      <Card
        className="mb-4 mx-4 native:mx-0"
        style={{ backgroundColor: colors.card, borderColor: colors.border }}
      >
        <CardHeader className="pb-2">
          <CardTitle style={{ color: colors.text, fontFamily: "Staatliches" }}>
            <Icon name="map-search-outline" size={24} color={colors.text} />{" "}
            Search Location
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-0">
          {/* searchContainer style already uses colors.card for background and colors.border for borderBottomColor */}
          <View style={styles.searchContainer}>
            <Icon name="magnify" size={24} color={colors.text} />
            <Input
              style={[
                styles.searchInput,
                {
                  backgroundColor: colors.card,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]} // Explicitly set input colors
              placeholder="Search for an address"
              placeholderTextColor={colors.border} // Using border color for placeholder
              value={searchText}
              onChangeText={handleSearchTextChange}
              autoCorrect={false}
              spellCheck={false}
              className="h-12"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                onPress={() => {
                  setSearchText("");
                  setSuggestions([]);
                }}
                style={styles.clearButton}
              >
                <Icon name="close-circle" size={20} color={colors.text} />
              </TouchableOpacity>
            )}
          </View>
          {suggestions.length > 0 && (
            // suggestionsContainer style already uses colors.card for background and colors.border for border
            <View style={styles.suggestionsContainer}>
              <ScrollView nestedScrollEnabled>
                {suggestions.map((item, index) => (
                  <TouchableOpacity
                    key={
                      item.latitude?.toString() +
                      item.longitude?.toString() +
                      index
                    }
                    // suggestionItem style already uses colors.border for borderBottomColor
                    style={styles.suggestionItem}
                    onPress={() => handleSuggestionPress(item)}
                  >
                    {/* suggestionText style already uses colors.text */}
                    <Text style={styles.suggestionText}>
                      {formatAddress(item as any)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
        </CardContent>
      </Card>

      <View
        style={
          status === "denied" || status === "error"
            ? styles.mapContainerDeniedError // Uses colors.border, colors.card
            : styles.mapContainer // Uses colors.border
        }
      >
        {status === "waiting" && (
          <ActivityIndicator size="large" color={colors.primary} />
        )}
        {(status === "denied" || status === "error") && mapRegion && (
          <>
            <Icon
              name={
                status === "denied" ? "alert-circle-outline" : "alert-outline"
              }
              size={48}
              color={colors.notification}
            />
            <Text
              style={{
                color: colors.notification,
                textAlign: "center",
                marginBottom: 8,
                marginTop: 8,
                fontFamily: "Staatliches",
              }}
            >
              {status === "denied"
                ? "Location Permission Denied"
                : "Error Loading Map"}
            </Text>
            <Text
              style={{
                color: colors.text,
                textAlign: "center",
                marginBottom: 16,
                marginHorizontal: 10,
              }}
            >
              {status === "denied"
                ? "To use the map and select your location, please grant location permissions."
                : "We couldn't load the map. Please check your connection or try again."}
            </Text>
            {status === "denied" && (
              <Button
                variant="outline"
                onPress={() => Linking.openSettings()}
                style={{ borderColor: colors.border }}
              >
                <Text
                  style={{ color: colors.primary, fontFamily: "Staatliches" }}
                >
                  Open Settings
                </Text>
              </Button>
            )}
          </>
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
      </View>

      <Button
        onPress={getCurrentLocation}
        disabled={isFetchingCurrentLocation}
        variant="default" // Changed from "primary"
        style={[
          styles.currentLocationButton,
          { backgroundColor: colors.primary },
        ]}
        className="mx-4"
      >
        {isFetchingCurrentLocation ? (
          <ActivityIndicator size="small" color={primaryButtonTextColor} />
        ) : (
          <Icon
            name="crosshairs-gps"
            size={20}
            color={primaryButtonTextColor}
          />
        )}
        <Text
          style={[
            styles.currentLocationButtonText,
            { color: primaryButtonTextColor, fontFamily: "Staatliches" },
          ]}
        >
          Use Current Location
        </Text>
      </Button>

      <View className="px-4">
        <Text
          style={{
            color: colors.text,
            marginBottom: 8,
            fontFamily: "Staatliches",
            fontSize: 16,
          }}
        >
          Additional Location Information (Optional)
        </Text>
        <Input
          placeholder="Apartment, suite, or floor number"
          value={additionalInfo}
          onChangeText={setAdditionalInfo}
          placeholderTextColor={colors.border} // Using border for placeholder text
          style={{
            backgroundColor: colors.card, // Using card for input background
            borderColor: colors.border,
            color: colors.text,
            borderWidth: 1,
            fontFamily: "Staatliches",
          }}
          className="h-12 rounded-md px-3 mb-4 native:h-14 native:leading-[1.25]"
        />
      </View>
    </ScrollView>
  );
}
