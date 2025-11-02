import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, StatusBar, SafeAreaView, Modal, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";

const ESPECIALIDADES = [
  "Cardiologia", "Clínico Geral", "Dermatologia", "Endocrinologia", "Gastroenterologia",
  "Ginecologia", "Neurologia", "Nutrição", "Oftalmologia", "Ortopedia",
  "Otorrinolaringologia", "Pediatria", "Psiquiatria", "Outra"
];

const PROCEDIMENTOS = [
  "Consulta de rotina - Presencial", "Consulta de rotina - Virtual", "Retorno", "Outra"
];

const LOCALIDADES = [
  "Unidade Alfa", "Unidade Beta", "Unidade Charlie", "Unidade Delta", "Unidade Echo", "Outra"
];

const MEDICOS_PADRAO = ["Todos", "Dr. João Dias", "Dra. Maria Pereira", "Dr. Pedro Souza", "Dra. Cássia de Almeida", "Dra. Gabriela Rocha"];

export default function AgendarConsulta({ onVoltar, onContinuar, listaMedicos }) {
  const [especialidade, setEspecialidade] = useState("");
  const [procedimento, setProcedimento] = useState("");
  const [localidade, setLocalidade] = useState("");
  const [medicoFiltrar, setMedicoFiltrar] = useState("");

  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerType, setPickerType] = useState(""); // "especialidade", "procedimento", "localidade", "medico"
  const [tempValue, setTempValue] = useState("");

  const medicosFinal = React.useMemo(() => [
    "Todos",
    ...MEDICOS_PADRAO.slice(1),
    ...(listaMedicos?.map(m => {
      const g = m.genero?.toLowerCase() || "masculino";
      const prefixo = g === "feminino" ? "Dra." : g === "outro" ? "Dr./Dra." : "Dr.";
      return `${prefixo} ${m.nome}`;
    }) || [])
  ], [listaMedicos]);

 const openPicker = (type, currentValue) => {
  setPickerType(type);

  let options;
  if (type === "especialidade") options = ESPECIALIDADES;
  else if (type === "procedimento") options = PROCEDIMENTOS;
  else if (type === "localidade") options = LOCALIDADES;
  else if (type === "medico") options = medicosFinal;
  else options = [];

  let initialValue = currentValue;

  // Para médico: se não estiver no array, default para "Todos"
  if (type === "medico" && !options.includes(currentValue)) initialValue = "Todos";

  setTempValue(initialValue || options[0] || "");
  setPickerOpen(true);
};

  const confirmPicker = () => {
    if (pickerType === "especialidade") setEspecialidade(tempValue);
    if (pickerType === "procedimento") setProcedimento(tempValue);
    if (pickerType === "localidade") setLocalidade(tempValue);
    if (pickerType === "medico") setMedicoFiltrar(tempValue);
    setPickerOpen(false);
  };

  const continuar = async () => {
    if (!(especialidade && procedimento && localidade)) return;

    const dadosConsulta = {
      especialidade,
      procedimento,
      localidade,
      medicoFiltrar,
      listaMedicos: medicosFinal
    };

    try {
      await AsyncStorage.setItem("especialidade", especialidade);
      await AsyncStorage.setItem("procedimento", procedimento);
      await AsyncStorage.setItem("localidade", localidade);
      if (medicoFiltrar) await AsyncStorage.setItem("medicoFiltrar", medicoFiltrar);

      onContinuar?.(dadosConsulta);
    } catch (err) {
      console.log(err);
    }
  };

  const getOptions = () => {
    if (pickerType === "especialidade") return ESPECIALIDADES;
    if (pickerType === "procedimento") return PROCEDIMENTOS;
    if (pickerType === "localidade") return LOCALIDADES;
    if (pickerType === "medico") return medicosFinal;
    return [];
  };

  const getLabel = () => {
    if (pickerType === "especialidade") return "Selecione a especialidade";
    if (pickerType === "procedimento") return "Selecione o procedimento";
    if (pickerType === "localidade") return "Selecione a localidade";
    if (pickerType === "medico") return "Selecione o médico (opcional)";
    return "";
  };

  const voltar = () => {
    setEspecialidade("");
    setProcedimento("");
    setLocalidade("");
    onVoltar?.();
  };

  return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#0a1a3f" barStyle="light-content" />

        {/* Header */}
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={voltar} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Agendar Consulta</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={styles.formWrap}>
          {/* Especialidade */}
          <Text style={styles.label}>Especialidade</Text>
          <TouchableOpacity style={[styles.input, styles.selectInput]} onPress={() => openPicker("especialidade", especialidade)}>
            <Text style={styles.selectText}>{especialidade || "Selecione..."}</Text>
            <Ionicons name="chevron-down" size={18} color="#eaf1ff" style={{ opacity: 0.9 }} />
          </TouchableOpacity>

          {/* Procedimento */}
          <Text style={styles.label}>Procedimento</Text>
          <TouchableOpacity style={[styles.input, styles.selectInput]} onPress={() => openPicker("procedimento", procedimento)}>
            <Text style={styles.selectText}>{procedimento || "Selecione..."}</Text>
            <Ionicons name="chevron-down" size={18} color="#eaf1ff" style={{ opacity: 0.9 }} />
          </TouchableOpacity>

          {/* Localidade */}
          <Text style={styles.label}>Localidade</Text>
          <TouchableOpacity style={[styles.input, styles.selectInput]} onPress={() => openPicker("localidade", localidade)}>
            <Text style={styles.selectText}>{localidade || "Selecione..."}</Text>
            <Ionicons name="chevron-down" size={18} color="#eaf1ff" style={{ opacity: 0.9 }} />
          </TouchableOpacity>

          {/* Médico */}
          <Text style={styles.label}>Filtrar por Médico (opcional)</Text>
          <TouchableOpacity style={[styles.input, styles.selectInput]} onPress={() => openPicker("medico", medicoFiltrar)}>
            <Text style={styles.selectText}>{medicoFiltrar || "Todos"}</Text>
            <Ionicons name="chevron-down" size={18} color="#eaf1ff" style={{ opacity: 0.9 }} />
          </TouchableOpacity>

          {/* Continuar */}
          <TouchableOpacity
            style={[styles.continuarButton, !(especialidade && procedimento && localidade) && { opacity: 0.5 }]}
            disabled={!(especialidade && procedimento && localidade)}
            onPress={continuar}
          >
            <Text style={styles.continuarText}>Continuar</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>

      {/* Modal Picker */}
      <Modal transparent visible={pickerOpen} animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{getLabel()}</Text>
            <View style={styles.modalPickerWrap}>
              <Picker selectedValue={tempValue} onValueChange={setTempValue}>
                {getOptions().map((opt) => (
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
  headerBar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  formWrap: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 24, gap: 12 },
  label: { color: "#eaf1ff", fontSize: 14, marginBottom: 6, fontWeight: "700" },
  input: { backgroundColor: "rgba(255,255,255,0.20)", borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, color: "#eaf1ff", fontSize: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)" },
  selectInput: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  selectText: { color: "#eaf1ff", fontSize: 14, fontWeight: "600" },

  continuarButton: { backgroundColor: "#3E1B83", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 20 },
  continuarText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", alignItems: "center", justifyContent: "center", padding: 20 },
  modalCard: { width: "100%", backgroundColor: "rgba(255,255,255,0.98)", borderRadius: 14, padding: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.35)" },
  modalTitle: { fontSize: 16, fontWeight: "700", color: "#0a1a3f", marginBottom: 8 },
  modalPickerWrap: { borderRadius: 10, overflow: "hidden", backgroundColor: "#fff", borderWidth: 1, borderColor: "rgba(0,0,0,0.08)" },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 12, marginTop: 12 },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  btnGhost: { backgroundColor: "transparent" },
  btnPrimary: { backgroundColor: "#3E1B83" },
  modalBtnText: { color: "#0a1a3f", fontWeight: "700" },
  modalBtnTextStrong: { color: "#fff" },
});
