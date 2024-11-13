import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ExerciseCardProps {
  name: string;
  calories: number;
  duration: number;
  variant?: "primary" | "secondary";
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  name,
  calories,
  duration,
  variant = "primary",
}) => {
  const isPrimary = variant === "primary";

  return (
    <View
      style={[
        styles.container,
        isPrimary ? styles.primaryBg : styles.secondaryBg,
      ]}
    >
      <Text style={[styles.title, isPrimary && styles.whiteText]}>{name}</Text>
      <View style={styles.stats}>
        <View style={styles.stat}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressBar,
                isPrimary
                  ? styles.primaryProgressBar
                  : styles.secondaryProgressBar,
                { width: `${(calories / 500) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.statLabels}>
            <Text style={[styles.statText, isPrimary && styles.whiteText]}>
              {calories}
            </Text>
            <Text style={[styles.statText, isPrimary && styles.whiteText]}>
              Calories
            </Text>
          </View>
        </View>
        <View style={styles.stat}>
          <View style={styles.progressBg}>
            <View
              style={[
                styles.progressBar,
                isPrimary
                  ? styles.yellowProgressBar
                  : styles.secondaryProgressBar,
                { width: `${(duration / 60) * 100}%` },
              ]}
            />
          </View>
          <View style={styles.statLabels}>
            <Text style={[styles.statText, isPrimary && styles.whiteText]}>
              {duration}min
            </Text>
            <Text style={[styles.statText, isPrimary && styles.whiteText]}>
              Duration
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    padding: 16,
    gap: 16,
  },
  primaryBg: {
    backgroundColor: "#2563EB",
  },
  secondaryBg: {
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  whiteText: {
    color: "#FFFFFF",
  },
  stats: {
    gap: 12,
  },
  stat: {
    gap: 4,
  },
  progressBg: {
    height: 6,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
  primaryProgressBar: {
    backgroundColor: "#60A5FA",
  },
  secondaryProgressBar: {
    backgroundColor: "#BFDBFE",
  },
  yellowProgressBar: {
    backgroundColor: "#FBBF24",
  },
  statLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statText: {
    fontSize: 14,
  },
});
