// App.js
import React, { useState } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  SafeAreaView,
  View,
  StyleSheet,
  Pressable,
  Text,
  Alert,
  ActivityIndicator,
  Platform,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Header } from "./src/components/Header";
import { Navigation } from "./src/components/Navigation";
import { ExerciseCard } from "./src/components/ExerciseCard";
import { CaloriesChart } from "./src/components/CaloriesChart";
import Svg, { Path } from "react-native-svg";
import ScanScreen from "./src/screens/Scanscreen";

const Stack = createNativeStackNavigator();

// API configuration
const API_URL = "http://192.168.1.15:5001";

// Sample data for the chart
const chartData = [
  { day: "Mon", calories: 1000 },
  { day: "Tue", calories: 1200 },
  { day: "Wed", calories: 1100 },
  { day: "Thu", calories: 1300 },
  { day: "Fri", calories: 1100 },
];

// Results Screen Component
const ResultsScreen = ({ route, navigation }) => {
  const { result } = route.params || { result: { text: "", messages: [] } };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Text style={styles.backButtonText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Exercise Analysis</Text>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Analysis</Text>
          <View style={styles.card}>
            <Text style={styles.analysisText}>{result.text}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Form Check</Text>
          <View style={styles.card}>
            <Text style={styles.formText}>
              {result.messages[result.messages.length - 1]?.content ||
                "No form analysis available"}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

// Home Screen Component
const HomeScreen = ({ navigation }) => {
  const [activeTab, setActiveTab] = React.useState("Food");
  const [showOptions, setShowOptions] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handlePress = () => {
    setShowOptions(!showOptions);
  };

  const requestPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Please grant permission to access your media library"
      );
      return false;
    }
    return true;
  };

  // Update the uploadFile function to use this URL
  const uploadFile = async () => {
    try {
      setIsUploading(true);

      const hasPermission = await requestPermission();
      if (!hasPermission) return;

      console.log("Starting video picker...");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        quality: 1,
      });

      if (result.canceled) {
        console.log("Video selection cancelled");
        return;
      }

      const videoAsset = result.assets[0];
      console.log("Selected video:", videoAsset);

      // Get file extension from uri
      const fileExtension = videoAsset.uri.split(".").pop();
      const fileName = `video.${fileExtension}`;

      const formData = new FormData();
      formData.append("video", {
        uri:
          Platform.OS === "ios"
            ? videoAsset.uri.replace("file://", "")
            : videoAsset.uri,
        type: videoAsset.mimeType || "video/quicktime",
        name: fileName,
      });

      console.log("Uploading to:", `${API_URL}/api/process-video`);
      console.log("Form data:", formData);

      const response = await fetch(`${API_URL}/api/process-video`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response:", errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      console.log("Success response:", data);

      Alert.alert("Success", "Video analyzed successfully");
      navigation.navigate("Results", { result: data });
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Error", "Failed to upload video. Please try again.");
    } finally {
      setIsUploading(false);
      setShowOptions(false);
    }
  };

  // Add this test function to verify server connectivity
  const testConnection = async () => {
    try {
      const response = await fetch(`${API_URL}/test`);
      const data = await response.json();
      console.log("Server response:", data);
      Alert.alert("Success", "Connected to server successfully!");
    } catch (error) {
      console.error("Connection test failed:", error);
      Alert.alert("Error", "Could not connect to server");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Header
          name="Nelson"
          avatar="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
        />
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
        <View style={styles.cards}>
          <View style={styles.cardContainer}>
            <ExerciseCard
              name="Running"
              calories={320}
              duration={30}
              variant="primary"
            />
            <ExerciseCard
              name="HIIT"
              calories={280}
              duration={25}
              variant="secondary"
            />
          </View>
        </View>
        <CaloriesChart data={chartData} />

        {/* Scan Button with Loading State */}
        <Pressable
          onPress={handlePress}
          style={[styles.scanButton, isUploading && styles.scanButtonDisabled]}
          disabled={isUploading}
        >
          {isUploading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              stroke="white"
              strokeWidth={1.5}
              fill="none"
            >
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <Path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z"
              />
            </Svg>
          )}
        </Pressable>

        {/* Options Menu */}
        {showOptions && !isUploading && (
          <View style={styles.optionsMenu}>
            <Pressable
              onPress={() => {
                setShowOptions(false);
                uploadFile();
              }}
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>Upload Video</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                setShowOptions(false);
                navigation.navigate("Scan");
              }}
              style={styles.optionButton}
            >
              <Text style={styles.optionText}>Record Live</Text>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

// Main App Component
const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Scan" component={ScanScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  cards: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },
  cardContainer: {
    flex: 1,
  },
  scanButton: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    backgroundColor: "#3B82F6",
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    zIndex: 99999,
  },
  scanButtonDisabled: {
    backgroundColor: "#93C5FD",
  },
  optionsMenu: {
    position: "absolute",
    bottom: 100,
    right: 24,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 8,
    elevation: 5,
    zIndex: 99999,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  optionButton: {
    padding: 12,
    borderRadius: 8,
  },
  optionText: {
    fontSize: 16,
    color: "#374151",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: "#3B82F6",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 12,
    color: "#111827",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  analysisText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
  formText: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
  },
});

export default App;
