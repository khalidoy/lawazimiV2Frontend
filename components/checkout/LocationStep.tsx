import * as React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Platform,
  ScrollView, // Added ScrollView
} from "react-native";
import { Text } from "~/components/ui/text";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";
import * as ExpoLocation from "expo-location";
import { useColorScheme } from "~/lib/useColorScheme";
import { THEME_COLORS } from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { MapPin, Navigation, Search, X } from "lucide-react-native";

// Helper function to format address
const formatAddress = (
  location: ExpoLocation.LocationGeocodedLocation
): string => {
  if (!location) return "Unknown location";

  // Cast to `any` to bypass strict TypeScript checks for properties
  // that might exist on the object at runtime but are not in the declared type.
  const loc = location as any;

  const addressParts: string[] = [];

  // Attempt to access common address properties
  // Check for existence and type before using them

  if (
    loc.name &&
    typeof loc.name === "string" &&
    loc.name !== `${loc.latitude},${loc.longitude}`
  ) {
    addressParts.push(loc.name);
  }

  let streetAddress = "";
  if (loc.streetNumber && typeof loc.streetNumber === "string") {
    streetAddress += loc.streetNumber + " ";
  }
  if (loc.street && typeof loc.street === "string") {
    streetAddress += loc.street;
  }
  if (streetAddress.trim()) {
    addressParts.push(streetAddress.trim());
  }

  if (loc.city && typeof loc.city === "string") {
    addressParts.push(loc.city);
  }

  // You can add more fields like district, region, postalCode, country if needed, e.g.:
  // if (loc.district && typeof loc.district === 'string') { addressParts.push(loc.district); }
  // if (loc.region && typeof loc.region === 'string') { addressParts.push(loc.region); }
  if (loc.postalCode && typeof loc.postalCode === "string") {
    addressParts.push(loc.postalCode);
  }
  if (loc.country && typeof loc.country === "string") {
    addressParts.push(loc.country);
  }

  // Filter out any empty strings and join unique parts
  const uniqueAddressParts = [
    ...new Set(
      addressParts.filter(
        (part) => typeof part === "string" && part.trim() !== ""
      )
    ),
  ];

  if (uniqueAddressParts.length > 0) {
    return uniqueAddressParts.join(", ");
  }

  // Fallback to coordinates if no other address parts are found
  if (loc.latitude != null && loc.longitude != null) {
    return `Lat: ${loc.latitude.toFixed(5)}, Lng: ${loc.longitude.toFixed(5)}`;
  }

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
const createStyles = (colors: any) =>
  StyleSheet.create({
    mapContainer: {
      flex: 1,
      borderWidth: 1,
      borderColor: colors.border, // Use theme color
      borderRadius: 8,
      overflow: "hidden",
      marginHorizontal: 16,
      marginBottom: 16,
      minHeight: 300, // Ensure map has a decent height
    },
    mapContainerDeniedError: {
      height: 200,
      width: "100%",
      borderWidth: 1,
      borderColor: colors.border, // Use theme color
      borderRadius: 8,
      overflow: "hidden",
      marginVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    map: {
      ...StyleSheet.absoluteFillObject,
    },
  });

export default function LocationStep({
  onNext,
  onLocationSelected,
  position,
}: LocationStepProps) {
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? THEME_COLORS.dark : THEME_COLORS.light;

  // Create dynamic styles based on theme
  const styles = React.useMemo(() => createStyles(colors), [colors]);

  const [status, setStatus] = React.useState<
    "waiting" | "denied" | "granted" | "error"
  >("waiting");
  const [mapRegion, setMapRegion] = React.useState<Region | undefined>(
    undefined
  );
  const [searchText, setSearchText] = React.useState("");
  const [suggestions, setSuggestions] = React.useState<
    ExpoLocation.LocationGeocodedLocation[]
  >([]);
  const [additionalInfo, setAdditionalInfo] = React.useState("");

  const mapRef = React.useRef<MapView>(null);

  React.useEffect(() => {
    (async () => {
      let { status: permissionStatus } =
        await ExpoLocation.requestForegroundPermissionsAsync();
      if (permissionStatus !== "granted") {
        setStatus("denied");
        // Set a default location if permission is denied (e.g., a central point of your service area)
        const defaultLocation = {
          latitude: 36.778259,
          longitude: -119.417931,
        }; // Example: California
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
        let location = await ExpoLocation.getCurrentPositionAsync({});
        const currentPos = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        };
        onLocationSelected(currentPos);
        setMapRegion({
          ...currentPos,
          latitudeDelta: 0.005, // Zoom in closer
          longitudeDelta: 0.005,
        });
      } catch (error) {
        console.error("Error getting current position:", error);
        setStatus("error");
        // Fallback to a default location on error
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
      setMapRegion(newRegion);
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 1000);
      }
    }
  }, [position, mapRegion?.latitudeDelta, mapRegion?.longitudeDelta]); // Added dependencies

  const handleMapPress = (e: any) => {
    const newPos = e.nativeEvent.coordinate;
    onLocationSelected(newPos);
  };

  const debouncedGeocode = React.useCallback(
    debounce(async (address: string) => {
      if (address.length < 3) {
        setSuggestions([]);
        return;
      }
      try {
        const geocodedLocations = await ExpoLocation.geocodeAsync(address);
        console.log(
          "Geocoded Locations API Response:",
          JSON.stringify(geocodedLocations, null, 2)
        ); // Log the API response
        setSuggestions(geocodedLocations);
      } catch (error) {
        console.error("Geocoding error:", error);
        setSuggestions([]);
      }
    }, 1000),
    []
  );

  const handleSearchTextChange = (text: string) => {
    setSearchText(text);
    if (Platform.OS === "web" && !GOOGLE_MAPS_API_KEY) {
      // console.warn("Google Maps API Key not configured for web search suggestions.");
      // For web, direct geocoding without suggestions might be the only option without Places API
      if (text.length > 3) debouncedGeocode(text);
      // Or call a simpler geocode if suggestions are hard
      else setSuggestions([]);
      return;
    }
    // If API key is available (even if not used by ExpoLocation.geocodeAsync directly for suggestions)
    // or on native, proceed with debounced geocoding.
    if (text.length > 3) debouncedGeocode(text);
    else setSuggestions([]);
  };

  const handleSuggestionPress = (
    suggestion: ExpoLocation.LocationGeocodedLocation
  ) => {
    Keyboard.dismiss();
    const newPos = {
      latitude: suggestion.latitude,
      longitude: suggestion.longitude,
    };
    onLocationSelected(newPos);

    const displayName = formatAddress(suggestion); // Use the formatter
    setSearchText(displayName); // Update search input with the formatted address
    setSuggestions([]);
  };

  const renderMapMarker = () => {
    if (position && position.latitude && position.longitude) {
      return (
        <Marker
          coordinate={{
            latitude: position.latitude,
            longitude: position.longitude,
          }}
          title="Delivery Location"
          pinColor={colors.primary}
        />
      );
    }
    return null;
  };

  if (status === "waiting") {
    return (
      <View className="flex-1 justify-center items-center bg-background p-4">
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-foreground">Detecting your position...</Text>
      </View>
    );
  }

  if (status === "denied") {
    return (
      <View className="items-center justify-center p-4">
        <Text className="text-center text-destructive mb-4">
          Permission d'accès à la localisation refusée. Veuillez l'activer dans
          les paramètres de votre appareil.
        </Text>
        <View style={styles.mapContainerDeniedError}>
          <Text className="text-muted-foreground">Carte non disponible</Text>
        </View>
        <Button
          onPress={async () => {
            const { status: newStatus } =
              await ExpoLocation.requestForegroundPermissionsAsync();
            if (newStatus === "granted") {
              setStatus("granted");
              // Attempt to get current location again
              try {
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
              } catch (error) {
                console.error(
                  "Error getting current position after retry:",
                  error
                );
                setStatus("error"); // Fallback to error state if still fails
              }
            } else {
              setStatus("denied");
            }
          }}
          className="mt-4 bg-primary"
        >
          <Text className="text-primary-foreground">Retry Permission</Text>
        </Button>
      </View>
    );
  }

  if (status === "error") {
    return (
      <View className="items-center justify-center p-4">
        <Text className="text-center text-destructive mb-4">
          Impossible d'obtenir la localisation actuelle. Veuillez réessayer.
        </Text>
        <View style={styles.mapContainerDeniedError}>
          <Text className="text-muted-foreground">Carte non disponible</Text>
        </View>
        <Button
          onPress={async () => {
            try {
              let location = await ExpoLocation.getCurrentPositionAsync({});
              const currentPos = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              onLocationSelected(currentPos);
              // Animate to new location
              if (mapRef.current) {
                mapRef.current.animateToRegion(
                  {
                    ...currentPos,
                    latitudeDelta: 0.005,
                    longitudeDelta: 0.005,
                  },
                  1000
                );
              }
            } catch (error) {
              console.error("Error getting current position:", error);
              // Optionally set status to error or show a toast message
              alert(
                "Could not fetch your current location. Please try again or search manually."
              );
            }
          }}
          className="mt-4 bg-primary"
        >
          <Text className="text-primary-foreground">Retry Location</Text>
        </Button>
      </View>
    );
  }

  return (
    <View className="p-4 flex-1">
      <Text className="text-lg font-semibold mb-2 text-foreground">
        Adresse de livraison
      </Text>
      <Input
        placeholder="Rechercher une adresse..."
        value={searchText}
        onChangeText={handleSearchTextChange}
        className="mb-2 bg-card border-border text-foreground placeholder:text-muted-foreground"
      />
      {suggestions.length > 0 && (
        <ScrollView
          style={{ maxHeight: 150 }}
          className="mb-2 border border-border rounded-md bg-card"
        >
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleSuggestionPress(item)}
            >
              <Card className="mb-1 bg-card border-transparent shadow-none">
                <CardContent className="p-3">
                  <Text className="text-foreground">
                    {formatAddress(item)} {/* Display formatted address */}
                  </Text>
                </CardContent>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      <View style={styles.mapContainer}>
        {mapRegion ? (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={mapRegion}
            onRegionChangeComplete={setMapRegion} // Keep map region in sync with user interaction
            onPress={handleMapPress}
            showsUserLocation={status === "granted"}
            showsMyLocationButton={status === "granted"}
            provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
          >
            {renderMapMarker()}
          </MapView>
        ) : (
          <View className="flex-1 justify-center items-center bg-muted">
            <ActivityIndicator size="large" color={colors.primary} />
            <Text className="mt-2 text-muted-foreground">Loading map...</Text>
          </View>
        )}
      </View>
      <Button
        variant="outline"
        className="m-4 border-primary"
        onPress={async () => {
          try {
            let location = await ExpoLocation.getCurrentPositionAsync({});
            const currentPos = {
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            };
            onLocationSelected(currentPos);
            // Animate to new location
            if (mapRef.current) {
              mapRef.current.animateToRegion(
                {
                  ...currentPos,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                },
                1000
              );
            }
          } catch (error) {
            console.error("Error getting current position:", error);
            // Optionally set status to error or show a toast message
            alert(
              "Could not fetch your current location. Please try again or search manually."
            );
          }
        }}
      >
        <View className="flex-row items-center justify-center">
          <Navigation size={16} color={colors.primary} className="mr-2" />
          <Text className="text-primary font-semibold">
            Use My Current Location
          </Text>
        </View>
      </Button>
    </View>
  );
}
