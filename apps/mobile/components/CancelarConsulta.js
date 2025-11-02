import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Modal, Pressable, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function CancelarConsulta({ consultas = [], setConsultas, onVoltar }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [consultaSelecionada, setConsultaSelecionada] = useState(null);

  const abrirModal = (consulta) => {
    setConsultaSelecionada(consulta);
    setModalVisible(true);
  };

  const confirmarCancelamento = () => {
    if (consultaSelecionada) {
      const novaLista = consultas.filter(c => c !== consultaSelecionada);
      setConsultas(novaLista);

      Alert.alert("Consulta cancelada", "Sua consulta foi cancelada com sucesso.");
    }
    setModalVisible(false);
    setConsultaSelecionada(null);
  };

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
          {consultas.length === 0 ? (
            <Text style={styles.text}>Nenhuma consulta agendada.</Text>
          ) : (
            consultas.map((c, idx) => (
              <View key={idx} style={styles.consultaCard}>
                <Text style={styles.consultaTxt}><Text style={styles.label}>Especialidade:</Text> {c.especialidade}</Text>
                <Text style={styles.consultaTxt}><Text style={styles.label}>Doutor(a):</Text> {c.medico}</Text>
                <Text style={styles.consultaTxt}><Text style={styles.label}>Localidade:</Text> {c.localidade}</Text>
                <Text style={styles.consultaTxt}><Text style={styles.label}>Data:</Text> {c.dia}/{c.mes}/{c.ano} às {c.horario}</Text>

                {/* Ícone de lixeira */}
                <TouchableOpacity style={styles.trashBtn} onPress={() => abrirModal(c)}>
                  <Ionicons name="trash" size={22} color="#ff4d4d" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Modal de confirmação */}
        <Modal
          transparent={true}
          visible={modalVisible}
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Deseja realmente cancelar esta consulta?</Text>
              <View style={styles.modalBtns}>
                <Pressable style={[styles.modalBtn, { backgroundColor: "#ccc" }]} onPress={() => setModalVisible(false)}>
                  <Text>Voltar</Text>
                </Pressable>
                <Pressable style={[styles.modalBtn, { backgroundColor: "#ff4d4d" }]} onPress={confirmarCancelamento}>
                  <Text style={{ color: "#fff" }}>Confirmar</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  content: { flex: 1, padding: 20, gap: 16 },
  text: { color: "#fff", fontSize: 16 },

  consultaCard: { backgroundColor: "rgba(255,255,255,0.1)", padding: 14, borderRadius: 10, marginBottom: 12, position: "relative" },
  consultaTxt: { color: "#eaf1ff", marginBottom: 4 },
  label: { fontWeight: "700" },

  trashBtn: { position: "absolute", top: 10, right: 10 },

  modalOverlay: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)" },
  modalContent: { backgroundColor: "#fff", padding: 20, borderRadius: 10, width: "80%" },
  modalText: { fontSize: 16, marginBottom: 20, textAlign: "center" },
  modalBtns: { flexDirection: "row", justifyContent: "space-between" },
  modalBtn: { padding: 10, borderRadius: 6, width: "48%", alignItems: "center" }
});
