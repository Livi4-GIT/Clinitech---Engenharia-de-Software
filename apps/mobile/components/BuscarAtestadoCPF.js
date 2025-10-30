// Atestado.js
import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class Atestado extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cpf: "",
      paciente: null,
      atestados: [],
      carregando: false,
      buscou: false,
    };
  }

  // ===== Helpers de CPF (mesmos da base) =====
  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9)
      return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(
      9,
      11
    )}`;
  };
  validarCPF = (v) => {
    const s = this.somenteDigitos(v);
    if (s.length !== 11) return false;
    if (/^(\d)\1+$/.test(s)) return false;
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += parseInt(s[i], 10) * (10 - i);
    let dv1 = 11 - (soma % 11);
    if (dv1 >= 10) dv1 = 0;
    if (dv1 !== parseInt(s[9], 10)) return false;
    soma = 0;
    for (let i = 0; i < 10; i++) soma += parseInt(s[i], 10) * (11 - i);
    let dv2 = 11 - (soma % 11);
    if (dv2 >= 10) dv2 = 0;
    return dv2 === parseInt(s[10], 10);
  };

  // ===== Status helpers (reuso) =====
  isPendente = (status) => {
    const s = String(status || "").toLowerCase();
    return s.includes("pend") || s.includes("aguard");
  };
  isLiberado = (status) => {
    const s = String(status || "").toLowerCase();
    return (
      s.includes("emit") || // "Emitido"
      s.includes("liber") ||
      s.includes("final") ||
      s.includes("ok")
    );
  };
  isEstadoTerminalRuim = (status) => {
    const s = String(status || "").toLowerCase();
    return (
      s.includes("recus") ||
      s.includes("rejei") ||
      s.includes("cancel") ||
      s.includes("erro") ||
      s.includes("falh")
    );
  };

  statusIcon = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s)) return "clock-outline";
    if (this.isLiberado(s)) return "check-decagram";
    if (this.isEstadoTerminalRuim(s)) return "alert-circle";
    return "file-document";
  };

  statusChipStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s))
      return { bg: "rgba(255,205,86,0.15)", border: "rgba(255,205,86,0.45)" };
    if (this.isLiberado(s))
      return { bg: "rgba(75,192,192,0.15)", border: "rgba(75,192,192,0.45)" };
    if (this.isEstadoTerminalRuim(s))
      return { bg: "rgba(255,99,132,0.15)", border: "rgba(255,99,132,0.45)" };
    return { bg: "rgba(214,228,255,0.12)", border: "rgba(214,228,255,0.28)" };
  };

  // ===== Datas (se precisar evoluir regras de vencimento/etc) =====
  parseDate = (str) => {
    if (!str || typeof str !== "string") return null;
    const s = str.trim();
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const d = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }
    const brMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const d = new Date(`${brMatch[3]}-${brMatch[2]}-${brMatch[1]}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  // 🔍 Buscar atestados e dados do paciente
  buscar = async () => {
    try {
      const { cpf } = this.state;
      const cpfN = this.somenteDigitos(cpf);
      if (cpfN.length !== 11) {
        return Alert.alert("CPF inválido", "Informe 11 dígitos.");
      }
      this.setState({ carregando: true });

      const [pacSemPrefixo, pacComPrefixo, atestadosStr] = await Promise.all([
        AsyncStorage.getItem(cpfN),
        AsyncStorage.getItem(`PAC_${cpfN}`),
        AsyncStorage.getItem(`ATE_${cpfN}`), // <- lista de atestados para o CPF
      ]);

      const pacienteStr = pacSemPrefixo || pacComPrefixo;
      const paciente = pacienteStr ? JSON.parse(pacienteStr) : null;
      const atestados = atestadosStr ? JSON.parse(atestadosStr) : [];

      const atestadosNorm = Array.isArray(atestados)
        ? atestados.map((a) => ({
            id: a.id || Date.now() + Math.random(),
            dataEmissao: a.dataEmissao || "—", // "DD/MM/AAAA" ou "YYYY-MM-DD"
            diasAfastamento: a.diasAfastamento ?? "—",
            cid: a.cid || a.cid10 || "—",
            motivo: a.motivo || a.diagnostico || "",
            status: a.status || (a.pdfUri ? "Emitido" : "Pendente"),
            pdfUri: a.pdfUri || null,
            pdfNome: a.pdfNome || null,
          }))
        : [];

      this.setState({
        paciente,
        atestados: atestadosNorm,
        carregando: false,
        buscou: true,
      });

      if (!paciente && atestadosNorm.length === 0) {
        Alert.alert("Não encontrado", "Nenhum paciente ou atestado para este CPF.");
      }
    } catch (e) {
      console.error(e);
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível concluir a busca.");
    }
  };

  limpar = () => {
    this.setState({
      cpf: "",
      paciente: null,
      atestados: [],
      carregando: false,
      buscou: false,
    });
  };

  abrirPdf = (item) => {
    if (this.props.onVisualizarAtestado) {
      this.props.onVisualizarAtestado(item);
    } else {
      Alert.alert("Visualizar atestado", "Abrir tela de PDF do atestado.");
    }
  };

  handleEmitirAtestado = () => {
    const { paciente, cpf } = this.state;
    if (!paciente) return;
    const cpfN = this.somenteDigitos(paciente?.cpf || cpf);
    if (cpfN.length !== 11) {
      return Alert.alert("CPF inválido", "Informe/valide o CPF do paciente.");
    }
    if (this.props.onEmitirAtestado) {
      this.props.onEmitirAtestado({ cpf: cpfN, paciente });
    } else if (this.props.navigation?.navigate) {
      this.props.navigation.navigate("EmitirAtestado", { cpf: cpfN, paciente });
    } else {
      Alert.alert("Ação", `Navegar para emissão de atestado (CPF ${cpfN}).`);
    }
  };

  Input = ({ icon, placeholder, keyboardType, value, onChangeText, maxLength }) => (
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons name={icon} size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#b8c7f8"
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        autoCapitalize="none"
      />
    </View>
  );

  renderPaciente() {
    const { paciente, cpf } = this.state;
    if (!paciente) return null;
    return (
      <View style={[styles.section, { marginTop: 8 }]}>
        <Text style={styles.sectionTitle}>Paciente</Text>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="account" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
          <Text style={styles.infoTxt}>{paciente.nome || "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="card-account-details" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
          <Text style={styles.infoTxt}>CPF: {this.formatarCPF(cpf)}</Text>
        </View>
      </View>
    );
  }

  renderAtestados() {
    const { atestados, buscou, paciente } = this.state;
    if (!paciente) return null;

    return (
      <View style={[styles.section, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>
          Atestados {atestados?.length ? `(${atestados.length})` : ""}
        </Text>

        {(!atestados || atestados.length === 0) && buscou ? (
          <Text style={styles.emptyTxt}>Nenhum atestado encontrado para este CPF.</Text>
        ) : (
          atestados.map((it, idx) => {
            const chip = this.statusChipStyle(it.status);
            const temPdf = !!it.pdfUri;
            return (
              <View key={it.id || idx} style={styles.examCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <MaterialCommunityIcons name={this.statusIcon(it.status)} size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.examTitle}>Atestado médico</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Data de emissão:</Text>
                  <Text style={styles.examValue}>{it.dataEmissao || "—"}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Dias de afastamento:</Text>
                  <Text style={styles.examValue}>{String(it.diasAfastamento ?? "—")}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>CID:</Text>
                  <Text style={styles.examValue}>{it.cid || "—"}</Text>
                </View>

                {!!it.motivo && (
                  <View style={styles.examRow}>
                    <Text style={styles.examLabel}>Motivo:</Text>
                    <Text style={styles.examValue}>{it.motivo}</Text>
                  </View>
                )}

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Status:</Text>
                  <View style={[styles.chip, { backgroundColor: chip.bg, borderColor: chip.border }]}>
                    <Text style={styles.chipTxt}>{it.status || "—"}</Text>
                  </View>
                </View>

                {temPdf && (
                  <Pressable onPress={() => this.abrirPdf(it)} style={[styles.pdfBtn, { marginTop: 10 }]}>
                    <MaterialCommunityIcons name="file-pdf-box" size={20} color="#ffd166" style={{ marginRight: 8 }} />
                    <Text style={styles.pdfBtnTxt}>Abrir PDF do atestado</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}

        {/* ➕ Emitir novo atestado (mostra quando há paciente) */}
        {paciente && (
          <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, { marginTop: 16 }]}>
            <Pressable
              onPress={this.handleEmitirAtestado}
              style={styles.btnPress}
              accessibilityRole="button"
              accessibilityLabel="Emitir novo atestado para esse CPF"
            >
              <Text style={styles.btnText}>Emitir atestado para esse CPF</Text>
            </Pressable>
          </LinearGradient>
        )}
      </View>
    );
  }

  render() {
    const { cpf, carregando } = this.state;

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          {this.props.onVoltar && (
            <View style={styles.topRight}>
              <Pressable onPress={this.props.onVoltar} style={styles.topRightBtn}>
                <Text style={styles.topRightTxt}>Voltar</Text>
              </Pressable>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Buscar Atestados por CPF</Text>

              {this.Input({
                icon: "card-account-details",
                placeholder: "CPF do paciente (000.000.000-00)",
                keyboardType: "number-pad",
                value: cpf,
                onChangeText: (v) => this.setState({ cpf: this.formatarCPF(v) }),
                maxLength: 14,
              })}

              <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                <Pressable onPress={this.buscar} style={styles.btnPress} disabled={carregando}>
                  {carregando ? <ActivityIndicator /> : <Text style={styles.btnText}>Buscar</Text>}
                </Pressable>
              </LinearGradient>

              <Pressable style={{ marginTop: 12 }} onPress={this.limpar}>
                <Text style={styles.link}>Nova busca</Text>
              </Pressable>

              {this.renderPaciente()}
              {this.renderAtestados()}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, padding: 20, paddingBottom: 20 },
  topRight: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  topRightBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(47,110,219,0.95)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  topRightTxt: { color: "#fff", fontWeight: "800", marginLeft: 8 },
  card: {
    borderRadius: 28,
    marginTop: 100,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  title: {
    color: "#eaf1ff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 16,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(214,228,255,0.4)",
    paddingBottom: 4,
  },
  input: { flex: 1, height: 40, color: "#eaf1ff" },
  btn: { marginTop: 12, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { color: "#cdd9ff", textAlign: "center", fontWeight: "600" },
  section: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(214,228,255,0.18)",
  },
  sectionTitle: { color: "#eaf1ff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoTxt: { color: "#eaf1ff", fontSize: 14 },
  emptyTxt: { color: "#cdd9ff", fontStyle: "italic" },
  examCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  examTitle: { color: "#eaf1ff", fontWeight: "700", fontSize: 15 },
  examRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  examLabel: { color: "#cdd9ff", width: 140 },
  examValue: { color: "#eaf1ff", fontWeight: "600", flexShrink: 1 },
  chip: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999, borderWidth: 1 },
  chipTxt: { color: "#eaf1ff", fontWeight: "700", fontSize: 12 },
  pdfBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,214,102,0.6)",
    backgroundColor: "rgba(255,214,102,0.08)",
  },
  pdfBtnTxt: { color: "#ffd166", fontWeight: "800" },
});
