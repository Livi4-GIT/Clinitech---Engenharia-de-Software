import React from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function VisualizarConsulta({ consultas = [], onVoltar }) {
  return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} style={{ flex: 1 }}>
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={onVoltar} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Minhas Consultas</Text>
        <View style={{ width: 34 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {consultas.length === 0 ? (
          <Text style={styles.emptyTxt}>Nenhuma consulta agendada.</Text>
        ) : (
          consultas.map((c, idx) => (
            <View key={idx} style={styles.consultaCard}>
              <Text style={styles.consultaTxt}><Text style={styles.label}>Especialidade:</Text> {c.especialidade}</Text>
              <Text style={styles.consultaTxt}><Text style={styles.label}>Doutor(a):</Text> {c.medico}</Text>
              <Text style={styles.consultaTxt}><Text style={styles.label}>Localidade:</Text> {c.localidade}</Text>
              <Text style={styles.consultaTxt}><Text style={styles.label}>Data:</Text> {c.dia}/{c.mes}/{c.ano} às {c.horario}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  container: { padding: 20, gap: 16 },
  emptyTxt: { color: "#eaf1ff", fontSize: 16, fontWeight: "600", textAlign: "center", marginTop: 50 },

  consultaCard: { backgroundColor: "rgba(255,255,255,0.1)", padding: 14, borderRadius: 10, marginBottom: 12 },
  consultaTxt: { color: "#eaf1ff", marginBottom: 4 },
  label: { fontWeight: "700" }
});
