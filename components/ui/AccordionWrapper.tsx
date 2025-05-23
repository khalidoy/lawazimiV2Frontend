import * as React from "react";
import { View } from "react-native";
import { Text } from "./text";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";

export const SafeAccordionContent = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => {
  // Ensure all direct string children are wrapped in Text
  const safeChildren = React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return <Text>{child}</Text>;
    }
    return child;
  });

  return (
    <AccordionContent {...props}>
      <View>{safeChildren}</View>
    </AccordionContent>
  );
};

export const SafeAccordionTrigger = ({
  children,
  ...props
}: {
  children: React.ReactNode;
  [key: string]: any;
}) => {
  // Ensure all direct string children are wrapped in Text
  const safeChildren = React.Children.map(children, (child) => {
    if (typeof child === "string") {
      return <Text>{child}</Text>;
    }
    return child;
  });

  return <AccordionTrigger {...props}>{safeChildren}</AccordionTrigger>;
};

// Other components remain the same
export { Accordion, AccordionItem };
