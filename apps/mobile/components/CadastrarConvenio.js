import React, { useState } from "react";
import {
  View, Text, TextInput, TouchableOpacity,
  StatusBar, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Alert,
  SafeAreaView
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const BANDEIRAS = ["Unimed", "Amil", "SulAmérica", "Bradesco", "Hapvida", "Outra"];

export default function CadastrarConvenio({ onVoltar, onSaved }) {
  const [bandeira, setBandeira] = useState(BANDEIRAS[0]);
  const [bandeiraOutra, setBandeiraOutra] = useState("");
  const [numero, setNumero] = useState("");
  const [nome, setNome] = useState("");

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

            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={bandeira}
                onValueChange={(val) => setBandeira(val)}
                style={styles.picker}
                mode={Platform.OS === "ios" ? "dialog" : "dropdown"}
              >
                {BANDEIRAS.map((opt) => (
                  <Picker.Item key={opt} label={opt} value={opt} />
                ))}
              </Picker>
            </View>

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

            <TouchableOpacity style={styles.submitBtn} onPress={submit}>
              <Text style={styles.submitTxt}>Cadastrar</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
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

  pickerWrap: {
    backgroundColor: "rgba(255,255,255,0.95)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
    overflow: "hidden",
  },
  picker: { width: "100%" },

  input: {
    backgroundColor: "rgba(255,255,255,0.20)",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    color: "#eaf1ff", fontSize: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  submitBtn: {
    alignSelf: "center", marginTop: 8,
    backgroundColor: "#3E1B83", borderRadius: 8,
    paddingVertical: 12, paddingHorizontal: 28,
    shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 6 },
  },
  submitTxt: { color: "#eaf1ff", fontSize: 14, fontWeight: "700" },
});
