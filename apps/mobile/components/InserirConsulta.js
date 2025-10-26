import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function InserirConsulta({ onVoltar, onSetScreen }) {
  return (
    <LinearGradient
      colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#0a1a3f" barStyle="light-content" />

        {/* Barra superior */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={ onVoltar } style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Consultas</Text>
          <View style={{ width: 34 }} />
        </View>

        {/* Menu principal */}
        <View style={styles.menuContainer}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => onSetScreen("agendarConsulta")}
          >
            <Ionicons name="calendar-outline" size={24} color="#fff" />
            <Text style={styles.menuText}>Agendar Consulta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => onSetScreen("cancelarConsulta")}
          >
            <Ionicons name="close-circle-outline" size={24} color="#fff" />
            <Text style={styles.menuText}>Cancelar Consulta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => onSetScreen("visualizarConsulta")}
          >
            <Ionicons name="eye-outline" size={24} color="#fff" />
            <Text style={styles.menuText}>Visualizar Consultas</Text>
          </TouchableOpacity>
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

  menuContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    gap: 18,
    marginTop: 40,
  },
  menuButton: {
    width: "80%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
    paddingVertical: 14,
  },
  menuText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
