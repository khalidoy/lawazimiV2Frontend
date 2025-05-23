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
import { MapPin, Phone, Mail, ExternalLink } from "lucide-react-native";

export default function AboutScreen() {
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
    <ScrollView className="flex-1 bg-background">
      <View className="p-4">
        {/* About Us Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">About Lawazimi</CardTitle>
          </CardHeader>
          <CardContent>
            <Text className="text-center mb-4">
              We deliver school tools and books directly to your home, making
              education accessible to everyone.
            </Text>

            <View className="items-center mb-4">
              <Avatar alt="Lawazimi logo" className="w-24 h-24 mb-4">
                <AvatarImage source={{ uri: "https://example.com/logo.jpg" }} />
                <AvatarFallback>LW</AvatarFallback>
              </Avatar>
              <Text className="text-sm text-muted-foreground">
                Founded in 2023
              </Text>
            </View>

            <Text className="mb-2">
              Lawazimi is dedicated to providing high-quality educational
              materials and school supplies with convenience and reliability.
              Our mission is to support students and educators by delivering the
              tools they need right to their doorstep.
            </Text>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <View className="flex-row items-center">
              <MapPin className="mr-2" size={20} />
              <Text className="flex-1">
                123 Education Street, School District, City
              </Text>
              <Button variant="ghost" onPress={openMap}>
                <MapPin size={18} />
              </Button>
            </View>

            <View className="flex-row items-center">
              <Phone className="mr-2" size={20} />
              <Text className="flex-1">+1 234 567 890</Text>
              <Button variant="ghost" onPress={callPhone}>
                <Phone size={18} />
              </Button>
            </View>

            <View className="flex-row items-center">
              <Mail className="mr-2" size={20} />
              <Text className="flex-1">support@lawazimi.com</Text>
              <Button variant="ghost" onPress={sendEmail}>
                <Mail size={18} />
              </Button>
            </View>
          </CardContent>
        </Card>

        {/* FAQ Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-center">
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible>
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <Text>How long does delivery take?</Text>
                </AccordionTrigger>
                <AccordionContent>
                  <View>
                    <Text>
                      We typically deliver within 24-48 hours of placing your
                      order, depending on your location and the availability of
                      items.
                    </Text>
                  </View>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <Text>What payment methods do you accept?</Text>
                </AccordionTrigger>
                <AccordionContent>
                  <View>
                    <Text>
                      We accept cash on delivery, credit/debit cards, and mobile
                      payment options for your convenience.
                    </Text>
                  </View>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <Text>Can I return items?</Text>
                </AccordionTrigger>
                <AccordionContent>
                  <View>
                    <Text>
                      Yes, unused items in original packaging can be returned
                      within 14 days of delivery. Please contact our customer
                      service for the return process.
                    </Text>
                  </View>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

        {/* Version Information */}
        <View className="items-center mb-8">
          <Text className="text-sm text-muted-foreground">
            App Version 1.0.0
          </Text>
          <Button
            variant="link"
            onPress={() => Linking.openURL("https://lawazimi.com")}
            className="flex-row items-center"
          >
            <Text className="text-primary mr-1">Visit our website</Text>
            <ExternalLink size={14} />
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}
