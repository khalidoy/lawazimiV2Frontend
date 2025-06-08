import * as React from "react";
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
  Modal,
  Platform,
} from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withDelay,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  BounceIn,
  ZoomIn,
  SlideInDown,
  interpolate,
  Extrapolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import * as ExpoLocation from "expo-location";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import MapView, { Marker, Region, PROVIDER_GOOGLE } from "react-native-maps";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ReviewStepProps {
  onComplete: () => void;
  customerInfo: {
    name: string;
    phone: string;
  };
  deliveryLocation: {
    latitude: number | null;
    longitude: number | null;
  };
  items: any[];
  images: string[];
  orderType?: "store" | "upload"; // Add order type to distinguish between store orders and uploads
}

export default function ReviewStep({
  onComplete,
  customerInfo,
  deliveryLocation,
  items,
  images,
  orderType = "upload", // Default to upload if not specified
}: ReviewStepProps) {
  const { isDarkColorScheme } = useColorScheme();
  const colors = NAV_THEME[isDarkColorScheme ? "dark" : "light"];
  // Animation values
  const headerScale = useSharedValue(0.8);
  const headerOpacity = useSharedValue(0);
  const cardScale = useSharedValue(0.9);
  const cardOpacity = useSharedValue(0);
  const totalPulse = useSharedValue(1);
  // Modal state for image viewing
  const [selectedImageIndex, setSelectedImageIndex] = React.useState<
    number | null
  >(null);
  const [imageModalVisible, setImageModalVisible] = React.useState(false);

  // State for delivery location and address
  const [currentDeliveryLocation, setCurrentDeliveryLocation] =
    React.useState(deliveryLocation);
  const [deliveryAddress, setDeliveryAddress] = React.useState<string>("");

  // Initialize animations
  React.useEffect(() => {
    // Staggered entrance animations
    headerScale.value = withSpring(1, { damping: 20, stiffness: 200 });
    headerOpacity.value = withTiming(1, { duration: 800 });
    cardScale.value = withDelay(
      200,
      withSpring(1, { damping: 18, stiffness: 180 })
    );
    cardOpacity.value = withDelay(200, withTiming(1, { duration: 600 }));

    // Subtle pulse animation for total
    totalPulse.value = withSpring(1.02, { damping: 10, stiffness: 100 });
    setTimeout(() => {
      totalPulse.value = withSpring(1, { damping: 15, stiffness: 120 });
    }, 800);
  }, []);

  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
    opacity: headerOpacity.value,
  }));
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
    opacity: cardOpacity.value,
  }));

  const totalAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: totalPulse.value }],
  })); // Generate order summary based on props
  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => {
      const price = Number(item.price) || 0;
      const quantity = Number(item.quantity) || 1;
      return sum + price * quantity;
    }, 0);
    const deliveryFee = 5.0;
    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee,
    };
  };

  const totals = calculateTotals();
  // Format address based on coordinates
  const formatAddress = () => {
    if (deliveryAddress) {
      return deliveryAddress;
    }
    if (
      !currentDeliveryLocation.latitude ||
      !currentDeliveryLocation.longitude
    ) {
      return "Address not set";
    }
    return "Loading address...";
  };

  // Function to reverse geocode coordinates to get address
  const reverseGeocodeAddress = async (latitude: number, longitude: number) => {
    try {
      const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

      if (GOOGLE_MAPS_API_KEY) {
        // Try Google Places reverse geocoding first
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}&language=en`
        );
        const data = await response.json();

        if (data.results && data.results.length > 0) {
          setDeliveryAddress(data.results[0].formatted_address);
          return;
        }
      }

      // Fallback to ExpoLocation
      const reverseGeocoded = await ExpoLocation.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocoded.length > 0) {
        const location = reverseGeocoded[0];
        const addressParts = [];

        if (location.name) addressParts.push(location.name);
        if (location.street) addressParts.push(location.street);
        if (location.city) addressParts.push(location.city);
        if (location.region) addressParts.push(location.region);
        if (location.country) addressParts.push(location.country);

        const formattedAddress = addressParts.join(", ");
        setDeliveryAddress(formattedAddress || "Address not available");
      } else {
        setDeliveryAddress("Address not available");
      }
    } catch (error) {
      console.error("Error reverse geocoding:", error);
      setDeliveryAddress("Address not available");
    }
  };

  // Handle map press to update delivery location
  const handleMapPress = (event: any) => {
    const { coordinate } = event.nativeEvent;
    setCurrentDeliveryLocation(coordinate);
    reverseGeocodeAddress(coordinate.latitude, coordinate.longitude);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  // Effect to fetch address when component mounts or location changes
  React.useEffect(() => {
    if (currentDeliveryLocation.latitude && currentDeliveryLocation.longitude) {
      reverseGeocodeAddress(
        currentDeliveryLocation.latitude,
        currentDeliveryLocation.longitude
      );
    }
  }, []);
  // Handle image press
  const handleImagePress = (index: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedImageIndex(index);
    setImageModalVisible(true);
  };

  // Create styles
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <Animated.View
          style={[headerAnimatedStyle]}
          entering={FadeInUp.duration(800)}
        >
          <View style={styles.header}>
            <Icon name="clipboard-check" size={32} color={colors.primary} />
            <Text style={styles.headerTitle}>Review Your Order</Text>
            <Text style={styles.headerSubtitle}>
              Please verify all details before confirming
            </Text>
          </View>
        </Animated.View>
        {/* Uploaded Documents Section */}
        {images.length > 0 && (
          <Animated.View entering={FadeInLeft.delay(200).duration(600)}>
            <Card style={[styles.card, cardAnimatedStyle]}>
              <CardHeader style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Icon
                    name="image-multiple"
                    size={24}
                    color={colors.primary}
                  />
                  <CardTitle style={styles.cardTitle}>
                    Uploaded Documents
                  </CardTitle>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{images.length}</Text>
                  </View>
                </View>
              </CardHeader>
              <CardContent style={styles.cardContent}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.imagesContainer}
                >
                  {images.map((image, index) => (
                    <Animated.View
                      key={index}
                      entering={ZoomIn.delay(300 + index * 100).duration(500)}
                    >
                      <TouchableOpacity
                        style={styles.imageContainer}
                        onPress={() => handleImagePress(index)}
                        activeOpacity={0.8}
                      >
                        <Image
                          source={{ uri: image }}
                          style={styles.thumbnailImage}
                        />
                        <View style={styles.imageOverlay}>
                          <Icon name="eye" size={20} color="white" />
                        </View>
                        <View style={styles.imageNumber}>
                          <Text style={styles.imageNumberText}>
                            {index + 1}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </Animated.View>
                  ))}
                </ScrollView>
                <Text style={styles.documentsNote}>
                  Tap any image to view in full screen
                </Text>
              </CardContent>
            </Card>
          </Animated.View>
        )}{" "}
        {/* Store Items Section */}
        {items.length > 0 && (
          <Animated.View entering={FadeInRight.delay(300).duration(600)}>
            <Card style={[styles.card, cardAnimatedStyle]}>
              <CardHeader style={styles.cardHeader}>
                <View style={styles.cardTitleContainer}>
                  <Icon name="store" size={24} color={colors.primary} />
                  <CardTitle style={styles.cardTitle}>Selected Items</CardTitle>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{items.length}</Text>
                  </View>
                </View>
              </CardHeader>
              <CardContent style={styles.cardContent}>
                {items.map((item, index) => (
                  <Animated.View
                    key={item.id || index}
                    entering={SlideInDown.delay(400 + index * 50).duration(400)}
                    style={styles.itemRow}
                  >
                    <View style={styles.itemDetails}>
                      {/* Item Image if available */}
                      {item.image && (
                        <Image
                          source={{ uri: item.image }}
                          style={styles.itemImage}
                        />
                      )}
                      <View style={styles.itemInfo}>
                        <Text style={styles.itemName}>
                          {item.name || "Unnamed Item"}
                        </Text>
                        {item.description && (
                          <Text
                            style={styles.itemDescription}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        )}
                        <View style={styles.itemMeta}>
                          <Text style={styles.itemQuantity}>
                            Qty: {item.quantity || 1}
                          </Text>
                          {item.category && (
                            <Text style={styles.itemCategory}>
                              {item.category}
                            </Text>
                          )}
                        </View>
                      </View>
                    </View>{" "}
                    <View style={styles.itemPricing}>
                      {item.originalPrice &&
                        typeof item.originalPrice === "number" &&
                        item.originalPrice > (Number(item.price) || 0) && (
                          <Text style={styles.itemOriginalPrice}>
                            ${item.originalPrice.toFixed(2)}
                          </Text>
                        )}
                      <Text style={styles.itemPrice}>
                        ${(Number(item.price) || 0).toFixed(2)}
                      </Text>
                      {item.quantity && item.quantity > 1 && (
                        <Text style={styles.itemTotal}>
                          Total: $
                          {(
                            (Number(item.price) || 0) *
                            (Number(item.quantity) || 1)
                          ).toFixed(2)}
                        </Text>
                      )}
                    </View>
                  </Animated.View>
                ))}

                {/* Store Items Summary */}
                <View style={styles.itemsSummary}>
                  <Icon
                    name="package-variant"
                    size={20}
                    color={colors.primary}
                  />
                  <Text style={styles.itemsSummaryText}>
                    {items.length} item{items.length !== 1 ? "s" : ""} selected
                    from store
                  </Text>
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        )}
        {/* Delivery Information */}
        <Animated.View entering={FadeInLeft.delay(400).duration(600)}>
          <Card style={[styles.card, cardAnimatedStyle]}>
            <CardHeader style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Icon name="truck-delivery" size={24} color={colors.primary} />
                <CardTitle style={styles.cardTitle}>Delivery Details</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <Animated.View
                entering={FadeInUp.delay(500).duration(400)}
                style={styles.deliveryRow}
              >
                <Icon
                  name="account"
                  size={20}
                  color={colors.primary}
                  style={styles.deliveryIcon}
                />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Customer</Text>
                  <Text style={styles.deliveryValue}>
                    {customerInfo.name || "Name not provided"}
                  </Text>
                  <Text style={styles.deliverySubvalue}>
                    {customerInfo.phone || "Phone not provided"}
                  </Text>
                </View>
              </Animated.View>{" "}
              <Animated.View
                entering={FadeInUp.delay(550).duration(400)}
                style={styles.deliveryRow}
              >
                <Icon
                  name="map-marker"
                  size={20}
                  color={colors.primary}
                  style={styles.deliveryIcon}
                />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Delivery Address</Text>
                  <Text style={styles.deliveryValue}>{formatAddress()}</Text>
                </View>
              </Animated.View>{" "}
              {/* Delivery Map */}
              {currentDeliveryLocation.latitude &&
                currentDeliveryLocation.longitude && (
                  <Animated.View
                    entering={FadeInUp.delay(575).duration(400)}
                    style={styles.mapContainer}
                  >
                    <MapView
                      style={styles.deliveryMap}
                      provider={PROVIDER_GOOGLE}
                      region={{
                        latitude: currentDeliveryLocation.latitude,
                        longitude: currentDeliveryLocation.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                      onPress={handleMapPress}
                      scrollEnabled={true}
                      zoomEnabled={true}
                      rotateEnabled={false}
                      pitchEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude: currentDeliveryLocation.latitude,
                          longitude: currentDeliveryLocation.longitude,
                        }}
                        title="Delivery Location"
                        description="Your order will be delivered here"
                        draggable={true}
                        onDragEnd={handleMapPress}
                      >
                        <View style={styles.customMarker}>
                          <Icon
                            name="map-marker"
                            size={30}
                            color={colors.primary}
                          />
                        </View>
                      </Marker>
                    </MapView>
                    <View style={styles.mapOverlay}>
                      <Icon
                        name="crosshairs-gps"
                        size={16}
                        color={colors.text + "60"}
                      />
                      <Text style={styles.mapOverlayText}>
                        Tap to adjust location
                      </Text>
                    </View>
                  </Animated.View>
                )}
              <Animated.View
                entering={FadeInUp.delay(600).duration(400)}
                style={styles.deliveryRow}
              >
                <Icon
                  name="clock"
                  size={20}
                  color={colors.primary}
                  style={styles.deliveryIcon}
                />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Estimated Delivery</Text>
                  <Text style={styles.deliveryValue}>Tomorrow, 2-4 PM</Text>
                </View>
              </Animated.View>
              <Animated.View
                entering={FadeInUp.delay(650).duration(400)}
                style={styles.deliveryRow}
              >
                <Icon
                  name="cash"
                  size={20}
                  color={colors.primary}
                  style={styles.deliveryIcon}
                />
                <View style={styles.deliveryInfo}>
                  <Text style={styles.deliveryLabel}>Payment Method</Text>
                  <Text style={styles.deliveryValue}>Cash on Delivery</Text>
                </View>
              </Animated.View>
            </CardContent>
          </Card>
        </Animated.View>
        {/* Order Summary */}
        <Animated.View entering={BounceIn.delay(500).duration(800)}>
          <Card style={[styles.summaryCard, cardAnimatedStyle]}>
            <CardHeader style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Icon name="calculator" size={24} color={colors.primary} />
                <CardTitle style={styles.cardTitle}>Order Summary</CardTitle>
              </View>
            </CardHeader>
            <CardContent style={styles.cardContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>
                  ${totals.subtotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Fee</Text>
                <Text style={styles.summaryValue}>
                  ${totals.deliveryFee.toFixed(2)}
                </Text>
              </View>
              <Separator style={styles.separator} />
              <Animated.View style={[styles.totalRow, totalAnimatedStyle]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${totals.total.toFixed(2)}
                </Text>
              </Animated.View>{" "}
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>

      {/* Image Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setImageModalVisible(false)}
            activeOpacity={1}
          >
            <View style={styles.modalContent}>
              {selectedImageIndex !== null && (
                <Image
                  source={{ uri: images[selectedImageIndex] }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
              )}
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setImageModalVisible(false)}
              >
                <Icon name="close" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

// Create styles function
const createStyles = (colors: typeof NAV_THEME.light) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContainer: {
      flex: 1,
    },
    scrollContent: {
      paddingBottom: 24,
    },
    header: {
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 24,
      marginBottom: 16,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: "700",
      color: colors.text,
      marginTop: 12,
      textAlign: "center",
      lineHeight: 32,
      maxWidth: screenWidth - 40,
    },
    headerSubtitle: {
      fontSize: 16,
      color: colors.text + "80",
      marginTop: 8,
      textAlign: "center",
    },
    card: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.border + "30",
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    summaryCard: {
      backgroundColor: colors.card,
      marginHorizontal: 16,
      marginBottom: 16,
      borderRadius: 20,
      borderWidth: 2,
      borderColor: colors.primary + "20",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.25,
      shadowRadius: 20,
      elevation: 12,
    },
    cardHeader: {
      paddingBottom: 8,
    },
    cardTitleContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: "600",
      color: colors.text,
      flex: 1,
    },
    cardContent: {
      paddingTop: 8,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
      minWidth: 24,
      alignItems: "center",
    },
    badgeText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    imagesContainer: {
      paddingVertical: 8,
      gap: 12,
    },
    imageContainer: {
      position: "relative",
      borderRadius: 16,
      overflow: "hidden",
      marginRight: 12,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 6,
    },
    thumbnailImage: {
      width: 120,
      height: 160,
      borderRadius: 16,
    },
    imageOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "rgba(0,0,0,0.3)",
      alignItems: "center",
      justifyContent: "center",
      opacity: 0.8,
    },
    imageNumber: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: colors.primary,
      borderRadius: 12,
      width: 24,
      height: 24,
      alignItems: "center",
      justifyContent: "center",
    },
    imageNumberText: {
      color: "white",
      fontSize: 12,
      fontWeight: "600",
    },
    documentsNote: {
      fontSize: 14,
      color: colors.text + "60",
      textAlign: "center",
      marginTop: 12,
      fontStyle: "italic",
    },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "20",
    },
    itemDetails: {
      flexDirection: "row",
      alignItems: "flex-start",
      flex: 1,
      marginRight: 12,
    },
    itemImage: {
      width: 60,
      height: 60,
      borderRadius: 12,
      marginRight: 12,
      borderWidth: 1,
      borderColor: colors.border + "40",
    },
    itemInfo: {
      flex: 1,
    },
    itemName: {
      fontSize: 16,
      fontWeight: "600",
      color: colors.text,
      marginBottom: 4,
    },
    itemDescription: {
      fontSize: 14,
      color: colors.text + "70",
      marginBottom: 6,
      lineHeight: 18,
    },
    itemMeta: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    itemQuantity: {
      fontSize: 14,
      fontWeight: "500",
      color: colors.primary,
      borderWidth: 1,
      borderColor: colors.primary + "40",
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 6,
    },
    itemCategory: {
      fontSize: 12,
      color: colors.text + "60",
      borderWidth: 1,
      borderColor: colors.border + "40",
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    itemPricing: {
      alignItems: "flex-end",
    },
    itemOriginalPrice: {
      fontSize: 14,
      color: colors.text + "50",
      textDecorationLine: "line-through",
      marginBottom: 2,
    },
    itemPrice: {
      fontSize: 18,
      fontWeight: "700",
      color: "#2D7D32",
      marginBottom: 2,
    },
    itemTotal: {
      fontSize: 12,
      color: colors.text + "60",
      fontWeight: "500",
    },
    itemsSummary: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.primary + "30",
      borderRadius: 12,
      gap: 8,
    },
    itemsSummaryText: {
      fontSize: 14,
      fontWeight: "600",
      color: colors.primary,
    },
    deliveryRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: colors.border + "15",
    },
    deliveryIcon: {
      marginRight: 16,
      marginTop: 2,
    },
    deliveryInfo: {
      flex: 1,
    },
    deliveryLabel: {
      fontSize: 14,
      color: colors.text + "70",
      marginBottom: 4,
    },
    deliveryValue: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
      marginBottom: 2,
    },
    deliverySubvalue: {
      fontSize: 14,
      color: colors.text + "60",
    },
    mapContainer: {
      marginVertical: 16,
      borderRadius: 16,
      overflow: "hidden",
      height: 200,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 6,
      position: "relative",
    },
    deliveryMap: {
      flex: 1,
      borderRadius: 16,
    },
    customMarker: {
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: "white",
      borderRadius: 20,
      padding: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      elevation: 5,
    },
    mapOverlay: {
      position: "absolute",
      top: 12,
      right: 12,
      backgroundColor: "rgba(0,0,0,0.6)",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    mapOverlayText: {
      color: "white",
      fontSize: 12,
      fontWeight: "500",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 12,
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.text + "80",
    },
    summaryValue: {
      fontSize: 16,
      fontWeight: "500",
      color: colors.text,
    },
    separator: {
      backgroundColor: colors.border,
      marginVertical: 8,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 16,
      paddingHorizontal: 8,
      borderWidth: 2,
      borderColor: colors.primary + "30",
      borderRadius: 12,
      marginTop: 8,
    },
    totalLabel: {
      fontSize: 20,
      fontWeight: "700",
      color: colors.text,
    },
    totalValue: {
      fontSize: 24,
      fontWeight: "800",
      color: "#2D5A27", // Elegant dark green instead of bright primary
    },
    buttonContainer: {
      paddingHorizontal: 16,
      paddingTop: 8,
      paddingBottom: 24,
    },
    completeButton: {
      backgroundColor: colors.primary,
      borderRadius: 16,
      paddingVertical: 18,
      paddingHorizontal: 24,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.3,
      shadowRadius: 16,
      elevation: 8,
    },
    buttonIcon: {
      marginRight: 12,
    },
    completeButtonText: {
      color: "white",
      fontSize: 18,
      fontWeight: "600",
      flex: 1,
      textAlign: "center",
    },
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
