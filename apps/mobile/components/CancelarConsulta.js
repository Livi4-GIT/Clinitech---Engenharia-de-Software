import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function CancelarConsulta({ onVoltar }) {
  return (
    <LinearGradient
      colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#0a1a3f" barStyle="light-content" />

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onVoltar} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cancelar Consulta</Text>
          <View style={{ width: 34 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.text}>Aqui você pode cancelar uma consulta.</Text>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  content: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 40,
  },
  text: {
    color: "#fff",
    fontSize: 16,
  },
});
