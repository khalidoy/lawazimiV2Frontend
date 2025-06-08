import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import {
  PanGestureHandler,
  State,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
import { useColorScheme } from "~/lib/useColorScheme";
import { NAV_THEME } from "~/lib/constants";
import { Text } from "~/components/ui/text";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "~/components/ui/card";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
  FadeInUp,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInDown,
  SlideOutDown,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

// Enhanced sample data with more realistic products
const CATEGORIES = [
  {
    id: "all",
    name: "Tout",
    icon: "view-grid-outline",
    color: "#6366f1",
  },
  {
    id: "fruits",
    name: "Fruits",
    icon: "food-apple-outline",
    color: "#10b981",
  },
  {
    id: "vegetables",
    name: "Légumes",
    icon: "carrot",
    color: "#f59e0b",
  },
  {
    id: "bakery",
    name: "Boulangerie",
    icon: "bread-slice-outline",
    color: "#8b5cf6",
  },
  {
    id: "dairy",
    name: "Produits Laitiers",
    icon: "cow",
    color: "#06b6d4",
  },
  {
    id: "meat",
    name: "Viande",
    icon: "food-steak",
    color: "#ef4444",
  },
];

const PRODUCTS = [
  // Fruits
  {
    id: "p1",
    categoryId: "fruits",
    name: "Pommes Rouges",
    price: "15.90",
    originalPrice: "18.50",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 245,
    description: "Pommes rouges fraîches et croquantes",
    inStock: true,
    isOffer: true,
  },
  {
    id: "p2",
    categoryId: "fruits",
    name: "Bananes",
    price: "8.99",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop",
    rating: 4.6,
    reviews: 189,
    description: "Bananes mûres et sucrées",
    inStock: true,
  },
  {
    id: "p3",
    categoryId: "fruits",
    name: "Oranges",
    price: "12.50",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=300&h=300&fit=crop",
    rating: 4.7,
    reviews: 156,
    description: "Oranges juteuses et vitaminées",
    inStock: true,
  },
  // Vegetables
  {
    id: "p4",
    categoryId: "vegetables",
    name: "Carottes",
    price: "6.99",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=300&h=300&fit=crop",
    rating: 4.5,
    reviews: 98,
    description: "Carottes biologiques fraîches",
    inStock: true,
  },
  {
    id: "p5",
    categoryId: "vegetables",
    name: "Tomates",
    price: "18.99",
    originalPrice: "22.99",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1546470427-e212b6935463?w=300&h=300&fit=crop",
    rating: 4.9,
    reviews: 312,
    description: "Tomates rouges bien mûres",
    inStock: true,
    isOffer: true,
  },
  {
    id: "p6",
    categoryId: "vegetables",
    name: "Poivrons",
    price: "14.50",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&h=300&fit=crop",
    rating: 4.4,
    reviews: 87,
    description: "Mélange de poivrons colorés",
    inStock: false,
  },
  // Bakery
  {
    id: "p7",
    categoryId: "bakery",
    name: "Pain Complet",
    price: "4.50",
    unit: "pièce",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 201,
    description: "Pain complet artisanal",
    inStock: true,
  },
  {
    id: "p8",
    categoryId: "bakery",
    name: "Croissants",
    price: "2.50",
    unit: "pièce",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=300&h=300&fit=crop",
    rating: 4.9,
    reviews: 445,
    description: "Croissants frais du matin",
    inStock: true,
  },
  // Dairy
  {
    id: "p9",
    categoryId: "dairy",
    name: "Lait Frais",
    price: "5.99",
    unit: "litre",
    image:
      "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop",
    rating: 4.6,
    reviews: 234,
    description: "Lait frais entier",
    inStock: true,
  },
  {
    id: "p10",
    categoryId: "dairy",
    name: "Fromage Blanc",
    price: "8.50",
    unit: "500g",
    image:
      "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=300&h=300&fit=crop",
    rating: 4.7,
    reviews: 156,
    description: "Fromage blanc onctueux",
    inStock: true,
  },
  // Meat
  {
    id: "p11",
    categoryId: "meat",
    name: "Bœuf Haché",
    price: "35.99",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1588347818481-9d03e1b6d87e?w=300&h=300&fit=crop",
    rating: 4.8,
    reviews: 289,
    description: "Bœuf haché frais 15% MG",
    inStock: true,
  },
  {
    id: "p12",
    categoryId: "meat",
    name: "Poulet Fermier",
    price: "28.50",
    unit: "kg",
    image:
      "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=300&h=300&fit=crop",
    rating: 4.9,
    reviews: 198,
    description: "Poulet fermier de qualité",
    inStock: true,
  },
];

interface StoreBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  onSelectItems: (items: any[]) => void;
  selectedItems: any[];
}

interface CartItem {
  id: string;
  quantity: number;
}

const StoreBottomSheet: React.FC<StoreBottomSheetProps> = ({
  visible,
  onClose,
  onSelectItems,
  selectedItems,
}) => {
  const { isDarkColorScheme } = useColorScheme();
  const colors = isDarkColorScheme ? NAV_THEME.dark : NAV_THEME.light;

  // Animation values
  const translateY = useSharedValue(screenHeight);
  const opacity = useSharedValue(0);
  const backdropOpacity = useSharedValue(0);

  // States
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  // Animation values for components
  const headerScale = useSharedValue(0.9);
  const searchScale = useSharedValue(0.9);
  const categoriesScale = useSharedValue(0.9);

  useEffect(() => {
    if (visible) {
      // Show animation
      translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      opacity.value = withTiming(1, { duration: 300 });
      backdropOpacity.value = withTiming(0.5, { duration: 300 });

      // Staggered entrance animations
      headerScale.value = withSpring(1, { damping: 18, stiffness: 200 });
      searchScale.value = withSpring(1, { damping: 16, stiffness: 180 });
      categoriesScale.value = withSpring(1, { damping: 14, stiffness: 160 });
    } else {
      // Hide animation
      translateY.value = withSpring(screenHeight, {
        damping: 20,
        stiffness: 300,
      });
      opacity.value = withTiming(0, { duration: 300 });
      backdropOpacity.value = withTiming(0, { duration: 300 });

      // Reset scales
      headerScale.value = 0.9;
      searchScale.value = 0.9;
      categoriesScale.value = 0.9;
    }
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value,
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  const searchAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: searchScale.value }],
  }));

  const categoriesAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: categoriesScale.value }],
  }));
  // Gesture handler for swipe down to close
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, context: any) => {
      context.startY = translateY.value;
    },
    onActive: (event, context: any) => {
      if (event.translationY > 0) {
        translateY.value = (context.startY as number) + event.translationY;
      }
    },
    onEnd: (event) => {
      if (event.translationY > 100 || event.velocityY > 500) {
        translateY.value = withSpring(screenHeight, {
          damping: 20,
          stiffness: 300,
        });
        opacity.value = withTiming(0, { duration: 300 });
        backdropOpacity.value = withTiming(0, { duration: 300 });
        runOnJS(onClose)();
      } else {
        translateY.value = withSpring(0, { damping: 20, stiffness: 300 });
      }
    },
  });

  // Filter products based on category and search
  const filteredProducts = PRODUCTS.filter((product) => {
    const matchesCategory =
      selectedCategory === "all" || product.categoryId === selectedCategory;
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Cart functionality
  const addToCart = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { id: productId, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setCart((prev) => {
      const existing = prev.find((item) => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        );
      } else {
        return prev.filter((item) => item.id !== productId);
      }
    });
  };

  const getCartItemQuantity = (productId: string) => {
    return cart.find((item) => item.id === productId)?.quantity || 0;
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };
  const getTotalPrice = () => {
    return cart.reduce((total, cartItem) => {
      const product = PRODUCTS.find((p) => p.id === cartItem.id);
      return (
        total + (product ? parseFloat(product.price) * cartItem.quantity : 0)
      );
    }, 0);
  };

  const handleCheckout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const selectedProducts = cart.map((cartItem) => {
      const product = PRODUCTS.find((p) => p.id === cartItem.id);
      return { ...product, quantity: cartItem.quantity };
    });
    onSelectItems(selectedProducts);
    onClose();
  };

  const renderProduct = ({ item, index }: { item: any; index: number }) => {
    const quantity = getCartItemQuantity(item.id);

    return (
      <Animated.View
        entering={FadeInUp.delay(index * 50)
          .duration(500)
          .springify()}
        style={{ marginBottom: 16 }}
      >
        <Card
          style={{
            backgroundColor: colors.card,
            borderColor: colors.border + "40",
            borderWidth: 1,
            borderRadius: 16,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 6,
            overflow: "hidden",
          }}
        >
          <View style={{ position: "relative" }}>
            <Image
              source={{ uri: item.image }}
              style={{
                width: "100%",
                height: 200,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
              }}
              resizeMode="cover"
            />

            {/* Offer badge */}
            {item.isOffer && (
              <View
                style={{
                  position: "absolute",
                  top: 12,
                  left: 12,
                  backgroundColor: "#ef4444",
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 12, fontWeight: "600" }}
                >
                  Promo
                </Text>
              </View>
            )}

            {/* Stock status */}
            {!item.inStock && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  justifyContent: "center",
                  alignItems: "center",
                  borderTopLeftRadius: 16,
                  borderTopRightRadius: 16,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "600" }}
                >
                  Rupture de stock
                </Text>
              </View>
            )}
          </View>

          <CardContent style={{ padding: 16 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 8,
              }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "600",
                    color: colors.text,
                    fontFamily: "Staatliches",
                  }}
                >
                  {item.name}
                </Text>
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    opacity: 0.7,
                    marginTop: 4,
                  }}
                >
                  {item.description}
                </Text>
              </View>
            </View>

            {/* Rating */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <MaterialCommunityIcons name="star" size={16} color="#fbbf24" />
              <Text style={{ fontSize: 14, color: colors.text, marginLeft: 4 }}>
                {item.rating} ({item.reviews} avis)
              </Text>
            </View>

            {/* Price */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: colors.primary,
                    fontFamily: "Staatliches",
                  }}
                >
                  {item.price} DH
                </Text>
                {item.originalPrice && (
                  <Text
                    style={{
                      fontSize: 16,
                      color: colors.text,
                      opacity: 0.5,
                      marginLeft: 8,
                      textDecorationLine: "line-through",
                    }}
                  >
                    {item.originalPrice} DH
                  </Text>
                )}
                <Text
                  style={{
                    fontSize: 14,
                    color: colors.text,
                    opacity: 0.7,
                    marginLeft: 4,
                  }}
                >
                  /{item.unit}
                </Text>
              </View>

              {/* Add to cart controls */}
              {item.inStock && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {quantity > 0 ? (
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <TouchableOpacity
                        onPress={() => removeFromCart(item.id)}
                        style={{
                          backgroundColor: colors.border,
                          borderRadius: 8,
                          padding: 8,
                          marginRight: 12,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="minus"
                          size={20}
                          color={colors.text}
                        />
                      </TouchableOpacity>

                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "600",
                          color: colors.text,
                          minWidth: 30,
                          textAlign: "center",
                        }}
                      >
                        {quantity}
                      </Text>

                      <TouchableOpacity
                        onPress={() => addToCart(item.id)}
                        style={{
                          backgroundColor: colors.primary,
                          borderRadius: 8,
                          padding: 8,
                          marginLeft: 12,
                        }}
                      >
                        <MaterialCommunityIcons
                          name="plus"
                          size={20}
                          color="#fff"
                        />
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => addToCart(item.id)}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        paddingHorizontal: 16,
                        paddingVertical: 8,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="cart-plus"
                        size={20}
                        color="#fff"
                      />
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 14,
                          fontWeight: "600",
                          marginLeft: 8,
                        }}
                      >
                        Ajouter
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </CardContent>
        </Card>
      </Animated.View>
    );
  };

  const renderCategory = ({ item, index }: { item: any; index: number }) => {
    const isSelected = selectedCategory === item.id;

    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100)
          .duration(500)
          .springify()}
      >
        <TouchableOpacity
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            setSelectedCategory(item.id);
          }}
          style={{
            backgroundColor: isSelected ? item.color : colors.card,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginRight: 12,
            marginBottom: 8,
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1,
            borderColor: isSelected ? item.color : colors.border + "40",
            shadowColor: isSelected ? item.color : "#000",
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: isSelected ? 0.3 : 0.1,
            shadowRadius: 4,
            elevation: isSelected ? 6 : 2,
          }}
        >
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={isSelected ? "#fff" : colors.text}
          />
          <Text
            style={{
              color: isSelected ? "#fff" : colors.text,
              fontSize: 14,
              fontWeight: isSelected ? "600" : "500",
              marginLeft: 8,
            }}
          >
            {item.name}
          </Text>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  if (!visible) return null;

  return (
    <Modal transparent visible={visible} statusBarTranslucent>
      <GestureHandlerRootView style={{ flex: 1 }}>
        {/* Backdrop */}
        <Animated.View
          style={[
            {
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "#000",
            },
            backdropStyle,
          ]}
        />

        {/* Bottom Sheet */}
        <PanGestureHandler onGestureEvent={gestureHandler}>
          <Animated.View
            style={[
              {
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: screenHeight * 0.9,
                backgroundColor: colors.background,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: -4 },
                shadowOpacity: 0.25,
                shadowRadius: 16,
                elevation: 16,
              },
              animatedStyle,
            ]}
          >
            {/* Handle */}
            <View
              style={{
                width: 40,
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                alignSelf: "center",
                marginTop: 12,
                marginBottom: 8,
              }}
            />
            {/* Header */}
            <Animated.View style={[headerAnimatedStyle]}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border + "20",
                }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <View
                    style={{
                      backgroundColor: colors.primary + "20",
                      borderRadius: 12,
                      padding: 8,
                      marginRight: 12,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="store-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </View>
                  <View>
                    <Text
                      style={{
                        fontSize: 20,
                        fontWeight: "700",
                        color: colors.text,
                        fontFamily: "Staatliches",
                      }}
                    >
                      Lawazimi Store
                    </Text>
                    <Text
                      style={{
                        fontSize: 14,
                        color: colors.text,
                        opacity: 0.7,
                      }}
                    >
                      {filteredProducts.length} produits disponibles
                    </Text>
                  </View>
                </View>

                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {/* Cart button */}
                  {getTotalItems() > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowCart(!showCart);
                      }}
                      style={{
                        backgroundColor: colors.primary,
                        borderRadius: 12,
                        padding: 8,
                        marginRight: 12,
                        position: "relative",
                      }}
                    >
                      <MaterialCommunityIcons
                        name="cart-outline"
                        size={20}
                        color="#fff"
                      />
                      {getTotalItems() > 0 && (
                        <View
                          style={{
                            position: "absolute",
                            top: -4,
                            right: -4,
                            backgroundColor: "#ef4444",
                            borderRadius: 10,
                            minWidth: 20,
                            height: 20,
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Text
                            style={{
                              color: "#fff",
                              fontSize: 12,
                              fontWeight: "600",
                            }}
                          >
                            {getTotalItems()}
                          </Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      onClose();
                    }}
                    style={{
                      backgroundColor: colors.border + "40",
                      borderRadius: 12,
                      padding: 8,
                    }}
                  >
                    <MaterialCommunityIcons
                      name="close"
                      size={20}
                      color={colors.text}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </Animated.View>
            {/* Search Bar */}
            <Animated.View
              style={[
                searchAnimatedStyle,
                { paddingHorizontal: 20, paddingVertical: 12 },
              ]}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: colors.card,
                  borderRadius: 16,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderWidth: 1,
                  borderColor: colors.border + "40",
                  shadowColor: "#000",
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <MaterialCommunityIcons
                  name="magnify"
                  size={20}
                  color={colors.text}
                  style={{ opacity: 0.6, marginRight: 12 }}
                />
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Rechercher des produits..."
                  placeholderTextColor={colors.text + "60"}
                  style={{
                    flex: 1,
                    fontSize: 16,
                    color: colors.text,
                    fontWeight: "500",
                  }}
                />
                {searchTerm.length > 0 && (
                  <TouchableOpacity
                    onPress={() => {
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      setSearchTerm("");
                    }}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color={colors.text}
                      style={{ opacity: 0.6 }}
                    />
                  </TouchableOpacity>
                )}
              </View>
            </Animated.View>{" "}
            {/* Categories */}
            <Animated.View
              style={[categoriesAnimatedStyle, { paddingBottom: 12 }]}
            >
              <FlatList
                data={CATEGORIES}
                renderItem={renderCategory}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingHorizontal: 20 }}
              />
            </Animated.View>
            {/* Cart View */}
            {showCart ? (
              <Animated.View
                entering={FadeInRight.duration(300)}
                exiting={FadeInLeft.duration(300)}
                style={{ flex: 1 }}
              >
                {" "}
                {/* Cart Header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingHorizontal: 20,
                    paddingVertical: 16,
                    borderBottomWidth: 1,
                    borderBottomColor: colors.border + "20",
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <TouchableOpacity
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        setShowCart(false);
                      }}
                      style={{
                        backgroundColor: colors.border + "40",
                        borderRadius: 12,
                        padding: 8,
                        marginRight: 12,
                      }}
                    >
                      <MaterialCommunityIcons
                        name="arrow-left"
                        size={20}
                        color={colors.text}
                      />
                    </TouchableOpacity>
                    <MaterialCommunityIcons
                      name="cart"
                      size={24}
                      color={colors.primary}
                    />
                    <Text
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: colors.text,
                        marginLeft: 12,
                        fontFamily: "Staatliches",
                      }}
                    >
                      Mon Panier ({getTotalItems()})
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "700",
                      color: colors.primary,
                      fontFamily: "Staatliches",
                    }}
                  >
                    {getTotalPrice().toFixed(2)} DH
                  </Text>
                </View>{" "}
                {/* Cart Items */}
                <View style={{ flex: 1 }}>
                  <FlatList
                    data={cart}
                    renderItem={({ item, index }) => {
                      const product = PRODUCTS.find((p) => p.id === item.id);
                      if (!product) return null;

                      return (
                        <Animated.View
                          entering={FadeInUp.delay(index * 100).duration(400)}
                          style={{
                            marginHorizontal: 20,
                            marginVertical: 8,
                          }}
                        >
                          <Card
                            style={{
                              backgroundColor: colors.card,
                              borderColor: colors.border + "40",
                              borderWidth: 1,
                              borderRadius: 16,
                              shadowColor: "#000",
                              shadowOffset: { width: 0, height: 2 },
                              shadowOpacity: 0.1,
                              shadowRadius: 8,
                              elevation: 4,
                            }}
                          >
                            <CardContent style={{ padding: 16 }}>
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                }}
                              >
                                <Image
                                  source={{ uri: product.image }}
                                  style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 12,
                                    marginRight: 16,
                                  }}
                                  resizeMode="cover"
                                />

                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={{
                                      fontSize: 16,
                                      fontWeight: "600",
                                      color: colors.text,
                                      marginBottom: 4,
                                    }}
                                  >
                                    {product.name}
                                  </Text>
                                  <Text
                                    style={{
                                      fontSize: 14,
                                      color: colors.text,
                                      opacity: 0.7,
                                      marginBottom: 8,
                                    }}
                                  >
                                    {product.price} DH / {product.unit}
                                  </Text>

                                  <View
                                    style={{
                                      flexDirection: "row",
                                      alignItems: "center",
                                      justifyContent: "space-between",
                                    }}
                                  >
                                    {/* Quantity Controls */}
                                    <View
                                      style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                      }}
                                    >
                                      <TouchableOpacity
                                        onPress={() =>
                                          removeFromCart(product.id)
                                        }
                                        style={{
                                          backgroundColor: colors.border + "60",
                                          borderRadius: 8,
                                          padding: 6,
                                          marginRight: 12,
                                        }}
                                      >
                                        <MaterialCommunityIcons
                                          name="minus"
                                          size={16}
                                          color={colors.text}
                                        />
                                      </TouchableOpacity>

                                      <Text
                                        style={{
                                          fontSize: 16,
                                          fontWeight: "600",
                                          color: colors.text,
                                          minWidth: 30,
                                          textAlign: "center",
                                        }}
                                      >
                                        {item.quantity}
                                      </Text>

                                      <TouchableOpacity
                                        onPress={() => addToCart(product.id)}
                                        style={{
                                          backgroundColor: colors.primary,
                                          borderRadius: 8,
                                          padding: 6,
                                          marginLeft: 12,
                                        }}
                                      >
                                        <MaterialCommunityIcons
                                          name="plus"
                                          size={16}
                                          color="#fff"
                                        />
                                      </TouchableOpacity>
                                    </View>

                                    {/* Total Price for this item */}
                                    <Text
                                      style={{
                                        fontSize: 16,
                                        fontWeight: "700",
                                        color: colors.primary,
                                        fontFamily: "Staatliches",
                                      }}
                                    >
                                      {(
                                        parseFloat(product.price) *
                                        item.quantity
                                      ).toFixed(2)}{" "}
                                      DH
                                    </Text>
                                  </View>
                                </View>
                              </View>
                            </CardContent>
                          </Card>
                        </Animated.View>
                      );
                    }}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{
                      paddingBottom: 20,
                    }}
                    showsVerticalScrollIndicator={false}
                  />

                  {/* Fixed Cart Summary at Bottom of Cart View */}
                  <View
                    style={{
                      backgroundColor: colors.background,
                      borderTopWidth: 1,
                      borderTopColor: colors.border + "20",
                      paddingHorizontal: 20,
                      paddingTop: 16,
                      paddingBottom: 100, // Space for checkout button
                    }}
                  >
                    <View
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: 16,
                        padding: 20,
                        borderWidth: 1,
                        borderColor: colors.border + "40",
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: -2 },
                        shadowOpacity: 0.1,
                        shadowRadius: 8,
                        elevation: 8,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 12,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 16,
                            color: colors.text,
                            opacity: 0.7,
                          }}
                        >
                          Total des articles ({getTotalItems()})
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            color: colors.text,
                          }}
                        >
                          {getTotalPrice().toFixed(2)} DH
                        </Text>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          justifyContent: "space-between",
                          alignItems: "center",
                          paddingTop: 12,
                          borderTopWidth: 1,
                          borderTopColor: colors.border + "20",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: colors.text,
                            fontFamily: "Staatliches",
                          }}
                        >
                          Total
                        </Text>
                        <Text
                          style={{
                            fontSize: 20,
                            fontWeight: "700",
                            color: colors.primary,
                            fontFamily: "Staatliches",
                          }}
                        >
                          {getTotalPrice().toFixed(2)} DH
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            ) : (
              /* Products List */
              <FlatList
                data={filteredProducts}
                renderItem={renderProduct}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{
                  paddingHorizontal: 20,
                  paddingBottom: getTotalItems() > 0 ? 100 : 20,
                }}
                showsVerticalScrollIndicator={false}
              />
            )}{" "}
            {/* Checkout Button */}
            {getTotalItems() > 0 && (
              <Animated.View
                entering={SlideInDown.duration(400).springify()}
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  backgroundColor: colors.background,
                  borderTopWidth: 1,
                  borderTopColor: colors.border + "20",
                  paddingHorizontal: 20,
                  paddingVertical: 16,
                  paddingBottom: 24,
                }}
              >
                <TouchableOpacity
                  onPress={handleCheckout}
                  style={{
                    backgroundColor: colors.primary,
                    borderRadius: 16,
                    paddingVertical: 16,
                    flexDirection: "row",
                    justifyContent: "center",
                    alignItems: "center",
                    shadowColor: colors.primary,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                    elevation: 8,
                  }}
                >
                  <MaterialCommunityIcons
                    name="cart-check"
                    size={24}
                    color="#fff"
                  />
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: 18,
                      fontWeight: "700",
                      marginLeft: 12,
                      fontFamily: "Staatliches",
                    }}
                  >
                    {showCart
                      ? "Valider la commande"
                      : `Commander (${getTotalItems()} articles)`}
                  </Text>
                  {showCart && (
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: "600",
                        marginLeft: 8,
                        opacity: 0.9,
                      }}
                    >
                      • {getTotalPrice().toFixed(2)} DH
                    </Text>
                  )}
                </TouchableOpacity>
              </Animated.View>
            )}{" "}
          </Animated.View>
        </PanGestureHandler>
      </GestureHandlerRootView>
    </Modal>
  );
};

export default StoreBottomSheet;
