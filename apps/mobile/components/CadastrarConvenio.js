import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StatusBar, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
  SafeAreaView, Modal, Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const BANDEIRAS = ["Unimed", "Amil", "SulAmérica", "Bradesco", "Hapvida", "Allianz Saúde", "Outra"];

export default function CadastrarConvenio({ navigation, onVoltar, onSaved, onGoAtualizarConvenio }) {
  const [bandeira, setBandeira] = useState(BANDEIRAS[0]);
  const [bandeiraOutra, setBandeiraOutra] = useState("");
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [tempBandeira, setTempBandeira] = useState(bandeira);

  const bandeiraValue = bandeira === "Outra" ? bandeiraOutra.trim() : bandeira;

  const submit = () => {
    if (!bandeiraValue || !numero.trim() || !nome.trim()) {
      Alert.alert("Atenção", "Preencha todos os campos.");
      return;
    }
    if (!/^\d{4,}$/.test(numero.trim())) {
      Alert.alert("Atenção", "Número do convênio deve ter pelo menos 4 dígitos.");
      return;
    }
    Alert.alert("Sucesso", "Convênio cadastrado!", [{ text: "OK", onPress: () => onSaved?.() }]);
  };

  const openPicker = () => {
    setTempBandeira(bandeira);
    setPickerOpen(true);
  };

  const confirmPicker = () => {
    setBandeira(tempBandeira);
    setPickerOpen(false);
  };

  const goAtualizar = () => {
    if (typeof onGoAtualizarConvenio === "function") {
      onGoAtualizarConvenio();
    } else if (navigation?.navigate) {
      navigation.navigate("AtualizarConvenio");
    }
  };

  return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#0a1a3f" barStyle="light-content" />
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={() => onVoltar?.()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cadastrar Convênio</Text>
          <View style={{ width: 34 }} />
        </View>

        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <ScrollView contentContainerStyle={styles.formWrap}>
            <Text style={styles.sectionLabel}>Bandeira do convênio</Text>

            <Pressable style={[styles.input, styles.selectInput]} onPress={openPicker}>
              <Text style={styles.selectText}>{bandeira}</Text>
              <Ionicons name="chevron-down" size={18} color="#eaf1ff" style={{ opacity: 0.9 }} />
            </Pressable>

            {bandeira === "Outra" && (
              <TextInput
                style={styles.input}
                placeholder="Digite a bandeira"
                placeholderTextColor="#cfe0ff"
                value={bandeiraOutra}
                onChangeText={setBandeiraOutra}
                autoCapitalize="words"
                returnKeyType="next"
              />
            )}

            <TextInput
              style={styles.input}
              placeholder="Número do convênio"
              placeholderTextColor="#cfe0ff"
              value={numero}
              onChangeText={(v) => setNumero(v.replace(/\D+/g, ""))}
              keyboardType="number-pad"
              returnKeyType="next"
              maxLength={20}
            />

            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#cfe0ff"
              value={nome}
              onChangeText={setNome}
              autoCapitalize="words"
              returnKeyType="done"
              onSubmitEditing={submit}
            />

            {/* Botões OUTLINE (iguais) */}
            <TouchableOpacity style={styles.btnOutline} onPress={submit}>
              <Text style={styles.btnOutlineText}>Cadastrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutline} onPress={goAtualizar}>
              <Text style={styles.btnOutlineText}>Atualizar Convênio</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>

      {/* Modal com Picker */}
      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Selecione a bandeira</Text>
            <View style={styles.modalPickerWrap}>
              <Picker selectedValue={tempBandeira} onValueChange={setTempBandeira}>
                {BANDEIRAS.map((opt) => (
                  <Picker.Item key={opt} label={opt} value={opt} />
                ))}
              </Picker>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setPickerOpen(false)} style={[styles.modalBtn, styles.btnGhost]}>
                <Text style={styles.modalBtnText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirmPicker} style={[styles.modalBtn, styles.btnPrimary]}>
                <Text style={[styles.modalBtnText, styles.modalBtnTextStrong]}>Selecionar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBar: {
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  formWrap: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, gap: 12 },
  sectionLabel: { color: "#eaf1ff", fontSize: 14, fontWeight: "700", marginBottom: 4 },

  input: {
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: "#eaf1ff", fontSize: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: "#eaf1ff", fontSize: 14, fontWeight: "600" },

  /* Botão outline compartilhado */
  btnOutline: {
    alignSelf: "center",
    marginTop: 10,
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  btnOutlineText: { color: "#eaf1ff", fontSize: 14, fontWeight: "700" },

  /* Modal */
  modalOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center", justifyContent: "center", padding: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.98)",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0a1a3f", marginBottom: 8 },
  modalPickerWrap: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
  },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnGhost: { backgroundColor: "transparent" },
  btnPrimary: { backgroundColor: "#3E1B83" },
  modalBtnText: { color: "#0a1a3f", fontWeight: "700" },
  modalBtnTextStrong: { color: "#fff" },
});
