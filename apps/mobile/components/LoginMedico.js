import React from "react";
import { View, Text, Pressable, StyleSheet, Platform, KeyboardAvoidingView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function LoginMedico({ onBack }) {
  return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <View style={styles.center}>
          <Text style={styles.title}>Login Médico – teste</Text>
          {onBack && (
            <Pressable style={styles.backBtn} onPress={onBack}>
              <Text style={styles.backTxt}>Voltar</Text>
            </Pressable>
          )}
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  title: {
    color: "#eaf1ff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  backBtn: {
    marginTop: 16,
    backgroundColor: "rgba(47,110,219,0.9)",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
  },
  backTxt: { color: "#fff", fontWeight: "700" },
});
