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

export default class BuscarExamesCPF extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      cpf: "",
      paciente: null,
      exames: [],
      carregando: false,
      buscou: false,
    };
  }

  // ===== Helpers de CPF =====
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

  // ===== Status helpers =====
  isPendente = (status) => {
    const s = String(status || "").toLowerCase();
    return (
      s.includes("solic") ||
      s.includes("pend") ||
      s.includes("aguard") ||
      s.includes("realiz")
    );
  };
  isLiberado = (status) => {
    const s = String(status || "").toLowerCase();
    return (
      s.includes("liber") ||
      s.includes("pronto") ||
      s.includes("conclu") ||
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
    if (s.includes("aceit") || s.includes("confirm"))
      return "check-circle-outline";
    if (this.isLiberado(s)) return "check-decagram";
    if (this.isEstadoTerminalRuim(s)) return "alert-circle";
    return "file-document";
  };

  statusChipStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s))
      return {
        bg: "rgba(255,205,86,0.15)",
        border: "rgba(255,205,86,0.45)",
      };
    if (s.includes("aceit") || s.includes("confirm"))
      return {
        bg: "rgba(54,162,235,0.15)",
        border: "rgba(54,162,235,0.45)",
      };
    if (this.isLiberado(s))
      return {
        bg: "rgba(75,192,192,0.15)",
        border: "rgba(75,192,192,0.45)",
      };
    if (this.isEstadoTerminalRuim(s))
      return {
        bg: "rgba(255,99,132,0.15)",
        border: "rgba(255,99,132,0.45)",
      };
    return {
      bg: "rgba(214,228,255,0.12)",
      border: "rgba(214,228,255,0.28)",
    };
  };

  // ===== Datas =====
  parseDate = (str) => {
    if (!str || typeof str !== "string") return null;
    const s = str.trim();

    // ISO / YYYY-MM-DD
    const isoMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      const d = new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }

    // DD/MM/YYYY
    const brMatch = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const d = new Date(`${brMatch[3]}-${brMatch[2]}-${brMatch[1]}T00:00:00`);
      return isNaN(d.getTime()) ? null : d;
    }

    // Fallback: tentar Date direto
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  isPastDay = (dateLike) => {
    const d = dateLike instanceof Date ? dateLike : this.parseDate(dateLike);
    if (!d) return false;
    const today = new Date();
    // Zerar horas
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  // 🔍 Buscar exames e dados do paciente
  buscar = async () => {
    try {
      const { cpf } = this.state;
      const cpfN = this.somenteDigitos(cpf);
      if (cpfN.length !== 11)
        return Alert.alert("CPF inválido", "Informe 11 dígitos.");
      this.setState({ carregando: true });

      const [pacSemPrefixo, pacComPrefixo, examesStr] = await Promise.all([
        AsyncStorage.getItem(cpfN),
        AsyncStorage.getItem(`PAC_${cpfN}`),
        AsyncStorage.getItem(`EXA_${cpfN}`),
      ]);

      const pacienteStr = pacSemPrefixo || pacComPrefixo;
      const paciente = pacienteStr ? JSON.parse(pacienteStr) : null;
      const exames = examesStr ? JSON.parse(examesStr) : [];

      const examesNormalizados = Array.isArray(exames)
        ? exames.map((e) => {
            const dataColeta = e.dataColeta || "—";
            // status base
            let statusBase = e.status || (e.resultadoPdfUri ? "Liberado" : "Pendente");

            // Se a data de coleta já passou e não é liberado nem estado terminal, marcar como Realizado
            if (
              this.isPastDay(dataColeta) &&
              !this.isLiberado(statusBase) &&
              !this.isEstadoTerminalRuim(statusBase)
            ) {
              statusBase = "Realizado";
            }

            return {
              id: e.id || Date.now() + Math.random(),
              tipo: e.tipo || "Exame",
              dataColeta,
              status: statusBase,
              observacao: e.observacao || "",
              resultadoPdfUri: e.resultadoPdfUri || null,
              resultadoPdfNome: e.resultadoPdfNome || null,
            };
          })
        : [];

      this.setState({
        paciente,
        exames: examesNormalizados,
        carregando: false,
        buscou: true,
      });

      if (!paciente && examesNormalizados.length === 0) {
        Alert.alert("Não encontrado", "Nenhum paciente ou exame para este CPF.");
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
      exames: [],
      carregando: false,
      buscou: false,
    });
  };

  // 📄 Abre o PDF na tela VisualizarExame.js
  abrirPdf = (exame) => {
    if (this.props.onVisualizarExame) {
      this.props.onVisualizarExame(exame);
    } else {
      Alert.alert("Visualizar exame", "Abrir tela VisualizarExame.js");
    }
  };

  // ➕ Solicitar exame (volta o botão)
  handleSolicitarExame = () => {
    const { paciente, cpf } = this.state;
    if (!paciente) return;
    const cpfN = this.somenteDigitos(paciente?.cpf || cpf);
    if (cpfN.length !== 11) {
      return Alert.alert("CPF inválido", "Informe/valide o CPF do paciente.");
    }
    if (this.props.onSolicitarExame) {
      this.props.onSolicitarExame({ cpf: cpfN, paciente });
    } else {
      Alert.alert("Ação", `Navegar para tela de solicitação de exame (CPF ${cpfN}).`);
    }
  };

  Input = ({ icon, placeholder, keyboardType, value, onChangeText, maxLength }) => (
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons
        name={icon}
        size={20}
        color="#d6e4ff"
        style={{ marginRight: 8 }}
      />
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
          <MaterialCommunityIcons
            name="account"
            size={18}
            color="#eaf1ff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.infoTxt}>{paciente.nome || "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons
            name="card-account-details"
            size={18}
            color="#eaf1ff"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.infoTxt}>CPF: {this.formatarCPF(cpf)}</Text>
        </View>
      </View>
    );
  }

  renderExames() {
    const { exames, buscou, paciente } = this.state;
    if (!paciente) return null;

    return (
      <View style={[styles.section, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>
          Exames {exames?.length ? `(${exames.length})` : ""}
        </Text>

        {(!exames || exames.length === 0) && buscou ? (
          <Text style={styles.emptyTxt}>
            Nenhum exame encontrado para este CPF.
          </Text>
        ) : (
          exames.map((ex, idx) => {
            const chip = this.statusChipStyle(ex.status);
            const temPdf = !!ex.resultadoPdfUri;

            return (
              <View key={ex.id || idx} style={styles.examCard}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <MaterialCommunityIcons
                    name={this.statusIcon(ex.status)}
                    size={18}
                    color="#eaf1ff"
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.examTitle}>{ex.tipo || "Exame"}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Data:</Text>
                  <Text style={styles.examValue}>{ex.dataColeta || "—"}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Status:</Text>
                  <View
                    style={[
                      styles.chip,
                      { backgroundColor: chip.bg, borderColor: chip.border },
                    ]}
                  >
                    <Text style={styles.chipTxt}>{ex.status || "—"}</Text>
                  </View>
                </View>

                {temPdf && (
                  <Pressable
                    onPress={() => this.abrirPdf(ex)}
                    style={[styles.pdfBtn, { marginTop: 10 }]}
                  >
                    <MaterialCommunityIcons
                      name="file-pdf-box"
                      size={20}
                      color="#ffd166"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.pdfBtnTxt}>Abrir PDF anexado</Text>
                  </Pressable>
                )}
              </View>
            );
          })
        )}

        {/* ➕ Botão "Solicitar exame para esse CPF" (mostra quando há paciente) */}
        {paciente && (
          <LinearGradient
            colors={["#2f6edb", "#1f4fb6"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.btn, { marginTop: 16 }]}
          >
            <Pressable
              onPress={this.handleSolicitarExame}
              style={styles.btnPress}
              accessibilityRole="button"
              accessibilityLabel="Solicitar exame para esse CPF"
            >
              <Text style={styles.btnText}>Solicitar exame para esse CPF</Text>
            </Pressable>
          </LinearGradient>
        )}
      </View>
    );
  }

  render() {
    const { cpf, carregando } = this.state;

    return (
      <LinearGradient
        colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          {this.props.onVoltar && (
            <View style={styles.topRight}>
              <Pressable onPress={this.props.onVoltar} style={styles.topRightBtn}>
                <Text style={styles.topRightTxt}>Voltar</Text>
              </Pressable>
            </View>
          )}

          <ScrollView
            contentContainerStyle={styles.center}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <Text style={styles.title}>Buscar Exames por CPF</Text>

              {this.Input({
                icon: "card-account-details",
                placeholder: "CPF do paciente (000.000.000-00)",
                keyboardType: "number-pad",
                value: cpf,
                onChangeText: (v) => this.setState({ cpf: this.formatarCPF(v) }),
                maxLength: 14,
              })}

              <LinearGradient
                colors={["#2f6edb", "#1f4fb6"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.btn}
              >
                <Pressable
                  onPress={this.buscar}
                  style={styles.btnPress}
                  disabled={carregando}
                >
                  {carregando ? (
                    <ActivityIndicator />
                  ) : (
                    <Text style={styles.btnText}>Buscar</Text>
                  )}
                </Pressable>
              </LinearGradient>

              <Pressable style={{ marginTop: 12 }} onPress={this.limpar}>
                <Text style={styles.link}>Nova busca</Text>
              </Pressable>

              {this.renderPaciente()}
              {this.renderExames()}
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
  sectionTitle: {
    color: "#eaf1ff",
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 8,
  },
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
  examLabel: { color: "#cdd9ff", width: 110 },
  examValue: { color: "#eaf1ff", fontWeight: "600" },
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
