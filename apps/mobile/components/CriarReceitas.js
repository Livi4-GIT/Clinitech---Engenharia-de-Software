import React from "react";
import {
  View, Text, TextInput, Pressable, Alert, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class CriarReceitas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      titulo: "",
      vencimento: "",
      pdfUri: null,
      pdfNome: null,
    };
  }

  
  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  formatarDataInput = (v) => {
    const d = this.somenteDigitos(v).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  };
  validarDataBR = (v) => {
    const m = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.exec(v || "");
    if (!m) return false;
    const [dd, mm, yyyy] = v.split("/").map((x) => parseInt(x, 10));
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
  };

  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };

  
  pickPdf = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled) return;
      const file = res.assets?.[0];
      if (!file) return;
      this.setState({ pdfUri: file.uri, pdfNome: file.name || "receita.pdf" });
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível selecionar o PDF.");
    }
  };

 
  salvar = async () => {
    try {
      const { titulo, vencimento, pdfUri, pdfNome } = this.state;
      const cpfN = this.somenteDigitos(this.props.initialCpf || "");
      const paciente = this.props.paciente;

      if (!paciente || !cpfN) return Alert.alert("Atenção", "Paciente/CPF inválido.");
      if (!titulo.trim()) return Alert.alert("Atenção", "Informe o título da receita.");
      if (!this.validarDataBR(vencimento)) return Alert.alert("Data inválida", "Use o formato DD/MM/AAAA.");

      const nova = {
        id: String(Date.now()),
        titulo: titulo.trim(),
        vencimento: vencimento.trim(),
        pdfUri: pdfUri || null,
        pdfNome: pdfNome || null,
      };

      const key = `REC_${cpfN}`;
      const atual = await AsyncStorage.getItem(key);
      const arr = atual ? JSON.parse(atual) : [];
      arr.push(nova);
      await AsyncStorage.setItem(key, JSON.stringify(arr));

      Alert.alert("Sucesso", "Receita cadastrada!");
      this.props.onSaved?.({ cpf: cpfN, paciente, receita: nova });
    } catch (e) {
      console.error(e);
      Alert.alert("Erro", "Não foi possível salvar a receita.");
    }
  };

  Input = ({ icon, placeholder, value, onChangeText, keyboardType, maxLength, multiline, style }) => (
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons name={icon} size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
      <TextInput
        style={[styles.input, style]}
        placeholder={placeholder}
        placeholderTextColor="#b8c7f8"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        maxLength={maxLength}
        multiline={multiline}
      />
    </View>
  );

  render() {
    const { paciente, initialCpf } = this.props;
    const { titulo, vencimento, pdfNome } = this.state;

    const canSave = !!paciente && !!titulo.trim() && this.validarDataBR(vencimento);

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          {this.props.onVoltar && (
            <View style={styles.topRight}>
              <Pressable onPress={this.props.onVoltar} style={styles.topRightBtn} accessibilityRole="button">
                <Text style={styles.topRightTxt}>Voltar</Text>
              </Pressable>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Criar Receita</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Paciente</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.infoTxt}>{paciente?.nome || "—"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.infoTxt}>CPF: {this.formatarCPF(initialCpf || "")}</Text>
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Título</Text>
                {this.Input({
                  icon: "clipboard-text-outline",
                  placeholder: "Ex.: Analgésico para dor abdominal",
                  value: titulo,
                  onChangeText: (v) => this.setState({ titulo: v }),
                  maxLength: 120,
                })}
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Vencimento (DD/MM/AAAA)</Text>
                {this.Input({
                  icon: "calendar",
                  placeholder: "DD/MM/AAAA",
                  value: vencimento,
                  onChangeText: (v) => this.setState({ vencimento: this.formatarDataInput(v) }),
                  keyboardType: "number-pad",
                  maxLength: 10,
                })}
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Anexar PDF (opcional)</Text>
                <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, { marginTop: 8 }]}>
                  <Pressable onPress={this.pickPdf} style={styles.btnPress} accessibilityRole="button">
                    <Text style={styles.btnText}>{pdfNome ? `Selecionado: ${pdfNome}` : "Selecionar PDF da receita"}</Text>
                  </Pressable>
                </LinearGradient>
              </View>
            </View>

            <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, { marginTop: 16 }]}>
              <Pressable
                onPress={this.salvar}
                disabled={!canSave}
                style={[styles.btnPress, !canSave && { opacity: 0.5 }]}
                accessibilityRole="button"
                accessibilityLabel="Salvar receita"
              >
                <Text style={styles.btnText}>Salvar receita</Text>
              </Pressable>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, padding: 20, paddingTop: 28 },
  topRight: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  topRightBtn: {
    flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(47,110,219,0.95)",
    paddingVertical: 8, paddingHorizontal: 12,
    borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  topRightTxt: { color: "#fff", fontWeight: "800", marginLeft: 8 },

  card: {
    borderRadius: 28, padding: 22, marginBottom: 16, marginTop: 70,
    backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  title: { color: "#eaf1ff", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },

  section: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(214,228,255,0.18)" },
  sectionTitle: { color: "#eaf1ff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoTxt: { color: "#eaf1ff", fontSize: 14 },

  fieldLabel: { color: "#cdd9ff", fontWeight: "700" },

  inputWrap: {
    flexDirection: "row", alignItems: "center", marginTop: 8,
    borderBottomWidth: 1, borderBottomColor: "rgba(214,228,255,0.4)", paddingBottom: 4,
  },
  input: { flex: 1, minHeight: 40, color: "#eaf1ff" },

  btn: { marginTop: 12, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
