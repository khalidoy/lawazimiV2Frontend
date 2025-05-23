import { useTheme } from "@react-navigation/native";
import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";
import { View, type ViewProps, TouchableOpacity } from "react-native";
import { cn } from "~/lib/utils";
import { Text } from "~/components/ui/text";
import RNVIcon from "react-native-vector-icons/MaterialCommunityIcons";
import { getThemeValues } from "~/lib/theme"; // Import getThemeValues

const alertVariants = cva(
  "relative bg-background w-full rounded-md border border-border p-2 shadow shadow-foreground/10", // Reduced padding, rounded-md
  {
    variants: {
      variant: {
        default: "border-border",
        destructive: "border-destructive bg-destructive/10",
        warning: "", // Will be handled dynamically using theme colors
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Alert({
  className,
  variant,
  children,
  icon,
  onDismiss,
  ...props
}: ViewProps &
  VariantProps<typeof alertVariants> & {
    ref?: React.RefObject<View>;
    icon?: React.ReactNode;
    onDismiss?: () => void;
  }) {
  const { colors: navColors, dark: isDark } = useTheme(); // from @react-navigation/native, uses NAV_THEME
  const appThemeColors = getThemeValues(isDark); // Get app-specific theme colors

  // Determine dynamic styles based on variant and theme
  let variantClassName = "";
  let iconColor = navColors.text; // Default icon color from navTheme
  let closeIconColor = navColors.text; // Default close icon color from navTheme

  if (variant === "destructive") {
    // Destructive uses notification color from navTheme, which is typically red
    variantClassName = "border-destructive bg-destructive/10"; // This uses Tailwind's pre-defined destructive color based on navColors.destructive
    iconColor = navColors.notification;
    closeIconColor = navColors.notification;
  } else if (variant === "warning") {
    // Warning uses primary color from appTheme (orange)
    variantClassName = `border-[${appThemeColors.primary}] bg-[${appThemeColors.primary}]/10`; // Tailwind JIT for dynamic colors
    iconColor = appThemeColors.primary;
    closeIconColor = appThemeColors.primary;
  }

  return (
    <View
      role="alert"
      className={cn(alertVariants({ variant }), variantClassName, className)} // Apply base, then dynamic variant, then custom
      {...props}
    >
      {icon && (
        <View className="absolute left-2.5 top-2.5">
          {" "}
          {/* Adjusted positioning for p-2 */}
          {React.isValidElement(icon) && icon.type === RNVIcon
            ? React.cloneElement(
                icon as React.ReactElement<{ size?: number; color?: string }>,
                {
                  color: iconColor,
                  size: (icon.props as any)?.size
                    ? (icon.props as any).size * 0.875
                    : 16 * 0.875, // Type assertion for size
                }
              )
            : icon}
        </View>
      )}
      {onDismiss && (
        <TouchableOpacity
          onPress={onDismiss}
          className="absolute right-2 top-2 p-0.5" // Adjusted positioning for p-2
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} // Adjusted hitSlop
        >
          <RNVIcon name="close" size={16} color={closeIconColor} />{" "}
          {/* Reduced close icon size */}
        </TouchableOpacity>
      )}
      {/* Adjust child layout based on icon/dismiss presence */}
      <View
        className={cn(icon ? "pl-7" : "", onDismiss ? "pr-7" : "", "w-full")}
      >
        {children}
      </View>
    </View>
  );
}

function AlertTitle({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "mb-0.5 font-medium text-sm leading-tight tracking-tight", // Reduced font size, margin, leading
        className
      )}
      {...props}
    />
  );
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "text-xs leading-snug", // Reduced font size, leading
        className
      )}
      {...props}
    />
  );
}

export { Alert, AlertDescription, AlertTitle };
