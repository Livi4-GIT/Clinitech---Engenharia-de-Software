import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

const DIAS = Array.from({ length: 30 }, (_, i) => i + 1); // Simulando dias 1-30
const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function EscolherHorario({ onVoltar, medicoFiltrar }) {
  const [diaSelecionado, setDiaSelecionado] = useState(null);

  const horariosDisponiveis = HORARIOS; // Aqui você pode filtrar pelo médico se quiser

  return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onVoltar} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escolher Dia e Horário</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.sectionTitle}>Selecione o dia</Text>
          <View style={styles.diasContainer}>
            {DIAS.map(dia => (
              <TouchableOpacity
                key={dia}
                style={[styles.diaBtn, diaSelecionado === dia && styles.diaBtnSelecionado]}
                onPress={() => setDiaSelecionado(dia)}
              >
                <Text style={[styles.diaText, diaSelecionado === dia && styles.diaTextSelecionado]}>{dia}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {diaSelecionado && (
            <>
              <Text style={styles.sectionTitle}>Horários disponíveis</Text>
              <View style={styles.horariosContainer}>
                {horariosDisponiveis.map(h => (
                  <TouchableOpacity key={h} style={styles.horarioBtn}>
                    <Text style={styles.horarioText}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  container: { padding: 20, gap: 16 },

  sectionTitle: { color: "#eaf1ff", fontWeight: "700", fontSize: 16, marginBottom: 8 },

  diasContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  diaBtn: { width: 40, height: 40, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  diaBtnSelecionado: { backgroundColor: "#3E1B83" },
  diaText: { color: "#eaf1ff", fontWeight: "600" },
  diaTextSelecionado: { color: "#fff" },

  horariosContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  horarioBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  horarioText: { color: "#eaf1ff", fontWeight: "600" },
});
