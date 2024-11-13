// src/screens/LiveExerciseScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import io from "socket.io-client";
import * as Speech from "expo-speech";

const API_URL = Platform.select({
  ios: "http://192.168.1.15:5001",
  android: "http://10.0.2.2:5001",
});

const LiveExerciseScreen = ({ navigation }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState("");
  const socketRef = useRef(null);

  // Initialize Socket.IO connection
  useEffect(() => {
    connectSocket();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  const connectSocket = () => {
    socketRef.current = io(API_URL);

    socketRef.current.on("connect", () => {
      console.log("Connected to analysis server");
    });

    socketRef.current.on("exercise_feedback", handleRealtimeFeedback);

    socketRef.current.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    socketRef.current.on("disconnect", () => {
      console.log("Disconnected from server");
    });
  };

  const handleRealtimeFeedback = async (data) => {
    try {
      setFeedback(data.text);
      // Provide audio feedback
      await Speech.speak(data.text, {
        language: "en",
        pitch: 1,
        rate: 1,
      });
    } catch (error) {
      console.error("Error handling feedback:", error);
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Camera permission is required for exercise analysis"
      );
      return false;
    }
    return true;
  };

  const startRecording = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 1,
        videoMaxDuration: 30,
      });

      if (!result.canceled) {
        const video = result.assets[0];
        processVideo(video);
      }
    } catch (error) {
      console.error("Error recording video:", error);
      Alert.alert("Error", "Failed to record video");
    }
  };

  const processVideo = async (video) => {
    try {
      setIsAnalyzing(true);

      // Notify server about starting analysis
      socketRef.current?.emit("start_exercise", { type: "analysis" });

      // Create form data
      const formData = new FormData();
      formData.append("video", {
        uri: video.uri,
        type: "video/mp4",
        name: "exercise.mp4",
      });

      // Upload to your server
      const response = await fetch(`${API_URL}/api/process-video`, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();

      // Final feedback
      if (data.text) {
        await Speech.speak(data.text, {
          language: "en",
          pitch: 1,
          rate: 1,
        });
      }

      // Navigate to results screen
      navigation.navigate("Results", { result: data });
    } catch (error) {
      console.error("Error processing video:", error);
      Alert.alert("Error", "Failed to process video");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Exercise Icon/Placeholder */}
        <View style={styles.iconContainer}>
          <Ionicons name="fitness-outline" size={100} color="#3B82F6" />
          <Text style={styles.headerText}>Exercise Analysis</Text>
        </View>

        {/* Feedback Display */}
        {feedback && (
          <View style={styles.feedbackContainer}>
            <Text style={styles.feedbackText}>{feedback}</Text>
          </View>
        )}

        {/* Instructions */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionText}>
            1. Position yourself in frame
          </Text>
          <Text style={styles.instructionText}>
            2. Record your exercise (max 30 seconds)
          </Text>
          <Text style={styles.instructionText}>
            3. Get instant form feedback
          </Text>
        </View>

        {/* Record Button */}
        <TouchableOpacity
          style={[styles.recordButton, isAnalyzing && styles.disabledButton]}
          onPress={startRecording}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <Ionicons name="videocam" size={30} color="white" />
          )}
          <Text style={styles.buttonText}>
            {isAnalyzing ? "Analyzing..." : "Record Exercise"}
          </Text>
        </TouchableOpacity>

        {/* Connection Status */}
        {socketRef.current?.connected && (
          <Text style={styles.statusText}>Connected to analysis server</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
    padding: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginTop: 40,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 20,
  },
  feedbackContainer: {
    backgroundColor: "#EBF5FF",
    padding: 15,
    borderRadius: 8,
    width: "100%",
    marginVertical: 10,
  },
  feedbackText: {
    fontSize: 16,
    color: "#1E40AF",
    textAlign: "center",
  },
  instructionsContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  instructionText: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 15,
    lineHeight: 24,
  },
  recordButton: {
    backgroundColor: "#3B82F6",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    gap: 10,
  },
  disabledButton: {
    backgroundColor: "#93C5FD",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  statusText: {
    fontSize: 14,
    color: "#059669",
    marginTop: 10,
  },
});

export default LiveExerciseScreen;
