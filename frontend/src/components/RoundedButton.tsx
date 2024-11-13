import React from "react";
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
} from "react-native";

const RoundedButton = ({
  title,
  onPress,
  backgroundColor = "#007AFF",
  textColor = "#FFFFFF",
  width = "80%",
  height = 50,
  isLoading = false,
  disabled = false,
  style,
  textStyle,
}) => {
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: disabled ? "#A9A9A9" : backgroundColor,
            width: width,
            height: height,
          },
          style,
        ]}
        onPress={onPress}
        disabled={disabled || isLoading}
        activeOpacity={0.7}
      >
        {isLoading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <Text style={[styles.buttonText, { color: textColor }, textStyle]}>
            {title}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    position: "relative", // Add this
    zIndex: 999, // Add this
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default RoundedButton;
