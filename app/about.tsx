import * as React from "react";
import { View, ScrollView, Linking } from "react-native";
import { Text } from "~/components/ui/text";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Button } from "~/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useTheme } from "@react-navigation/native";

export default function AboutScreen() {
  const { colors } = useTheme();
  const openMap = () => {
    Linking.openURL("https://maps.google.com/?q=Your+Store+Location");
  };

  const callPhone = () => {
    Linking.openURL("tel:+123456789");
  };

  const sendEmail = () => {
    Linking.openURL("mailto:support@lawazimi.com");
  };

  return (
    <ScrollView
      className="flex-1"
      style={{ backgroundColor: colors.background }}
    >
      <View className="p-4">
        {/* About Us Section */}
        <Card className="mb-6" style={{ backgroundColor: colors.card }}>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: colors.text }}>
              About Lawazimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-center mb-4" style={{ color: colors.text }}>
              We deliver school tools and books directly to your home, making
              education accessible to everyone.
            </Text>

            <View className="items-center mb-4">
              <Avatar alt="Lawazimi logo" className="w-24 h-24 mb-4">
                <AvatarImage source={{ uri: "https://example.com/logo.jpg" }} />
                <AvatarFallback>LW</AvatarFallback>
              </Avatar>
              <Text
                className="text-sm text-muted-foreground"
                style={{ color: colors.text }}
              >
                Founded in 2023
              </Text>
            </View>

            <Text className="mb-2" style={{ color: colors.text }}>
              Lawazimi is dedicated to providing high-quality educational
              materials and school supplies with convenience and reliability.
              Our mission is to support students and educators by delivering the
              tools they need right to their doorstep.
            </Text>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6" style={{ backgroundColor: colors.card }}>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: colors.text }}>
              Contact Us
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="map-marker-outline"
                className="mr-2"
                size={20}
                color={colors.text}
              />
              <Text className="flex-1" style={{ color: colors.text }}>
                123 Education Street, School District, City
              </Text>
              <Button variant="ghost" onPress={openMap}>
                <MaterialCommunityIcons
                  name="map-marker-outline"
                  size={18}
                  color={colors.primary} // Assuming Button ghost variant handles text color correctly or this is an icon-only button
                />
              </Button>
            </View>

            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="phone-outline"
                className="mr-2"
                size={20}
                color={colors.text}
              />
              <Text className="flex-1" style={{ color: colors.text }}>
                +1 234 567 890
              </Text>
              <Button variant="ghost" onPress={callPhone}>
                <MaterialCommunityIcons
                  name="phone-outline"
                  size={18}
                  color={colors.primary}
                />
              </Button>
            </View>

            <View className="flex-row items-center">
              <MaterialCommunityIcons
                name="email-outline"
                className="mr-2"
                size={20}
                color={colors.text}
              />
              <Text className="flex-1" style={{ color: colors.text }}>
                support@lawazimi.com
              </Text>
              <Button variant="ghost" onPress={sendEmail}>
                <MaterialCommunityIcons
                  name="email-outline"
                  size={18}
                  color={colors.primary}
                />
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-6" style={{ backgroundColor: colors.card }}>
          <CardHeader>
            <CardTitle className="text-center" style={{ color: colors.text }}>
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <Text style={{ color: colors.text }}>
                    What payment methods do you accept?
                  </Text>
                </AccordionTrigger>
                <AccordionContent>
                  <Text style={{ color: colors.text }}>
                    We accept cash on delivery, and soon major credit cards and
                    mobile payments.
                  </Text>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <Text style={{ color: colors.text }}>
                    What is your return policy?
                  </Text>
                </AccordionTrigger>
                <AccordionContent>
                  <Text style={{ color: colors.text }}>
                    Items can be returned within 7 days of purchase, provided
                    they are in their original condition.
                  </Text>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <Text style={{ color: colors.text }}>
                    How long does delivery take?
                  </Text>
                </AccordionTrigger>
                <AccordionContent>
                  <Text style={{ color: colors.text }}>
                    Delivery typically takes 1-2 business days within the city.
                  </Text>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Team Section - Optional */}
        {/* You can add a team section here if desired */}

        <View className="items-center mt-8 mb-4">
          <Text
            className="text-sm text-muted-foreground"
            style={{ color: colors.text }}
          >
            Lawazimi © {new Date().getFullYear()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
