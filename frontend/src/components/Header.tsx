import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { Svg, Path } from "react-native-svg";

interface HeaderProps {
  name: string;
  avatar: string;
}

export const Header: React.FC<HeaderProps> = ({ name, avatar }) => {
  return (
    <View style={styles.container}>
      <View style={styles.profile}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <Text style={styles.title}>Hello, {name}</Text>
      </View>
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button}>
          <Svg width={24} height={24} fill="none" stroke="#000">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button}>
          <Svg width={24} height={24} fill="none" stroke="#000">
            <Path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </Svg>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  buttons: {
    flexDirection: "row",
    gap: 16,
  },
  button: {
    padding: 8,
  },
});
