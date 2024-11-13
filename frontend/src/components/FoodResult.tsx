import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

interface FoodResultProps {
  category: string;
  name: string;
  onPress: () => void;
}

export const FoodResult: React.FC<FoodResultProps> = ({
  category,
  name,
  onPress,
}) => {
  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <TouchableOpacity style={styles.content} onPress={onPress}>
        <View style={styles.textContainer}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.name}>{name}</Text>
        </View>
        <View style={styles.arrow}>
          <Text style={styles.arrowText}>→</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  textContainer: {
    flex: 1,
  },
  category: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
  },
  arrow: {
    width: 40,
    height: 40,
    backgroundColor: "#2563EB",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  arrowText: {
    color: "white",
    fontSize: 20,
  },
});
