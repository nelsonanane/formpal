import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

const { width } = Dimensions.get("window");
const FRAME_SIZE = width * 0.8;

export const ScanningOverlay = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.scanningText}>Scanning...</Text>
      <View style={styles.frame}>
        <Svg width={FRAME_SIZE} height={FRAME_SIZE} viewBox="0 0 100 100">
          <Path
            d="M 10 0 L 0 0 L 0 10"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M 90 0 L 100 0 L 100 10"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M 0 90 L 0 100 L 10 100"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
          <Path
            d="M 90 100 L 100 100 L 100 90"
            stroke="white"
            strokeWidth="2"
            fill="none"
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
  },
  scanningText: {
    color: "white",
    fontSize: 24,
    fontWeight: "600",
    marginBottom: 20,
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 5,
  },
  frame: {
    width: FRAME_SIZE,
    height: FRAME_SIZE,
    justifyContent: "center",
    alignItems: "center",
  },
});
