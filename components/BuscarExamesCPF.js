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

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };

  statusIcon = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("pend")) return "clock-outline";
    if (s.includes("liber") || s.includes("pronto") || s.includes("ok")) return "check-decagram";
    if (s.includes("recus") || s.includes("rejei") || s.includes("erro")) return "alert-circle";
    return "file-document";
  };

  statusChipStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (s.includes("pend"))
      return { bg: "rgba(255,205,86,0.15)", border: "rgba(255,205,86,0.45)" };
    if (s.includes("liber") || s.includes("pronto") || s.includes("ok"))
      return { bg: "rgba(75,192,192,0.15)", border: "rgba(75,192,192,0.45)" };
    if (s.includes("recus") || s.includes("rejei") || s.includes("erro"))
      return { bg: "rgba(255,99,132,0.15)", border: "rgba(255,99,132,0.45)" };
    return { bg: "rgba(214,228,255,0.12)", border: "rgba(214,228,255,0.28)" };
  };

  buscar = async () => {
    try {
      const { cpf } = this.state;
      const cpfN = this.somenteDigitos(cpf);

      if (!cpfN || cpfN.length !== 11) {
        return Alert.alert("CPF inválido", "Informe 11 dígitos.");
      }

      this.setState({ carregando: true });

      
      const [pacienteStr, examesStr] = await Promise.all([
        AsyncStorage.getItem(cpfN),
        AsyncStorage.getItem(`EXA_${cpfN}`),
      ]);

      const paciente = pacienteStr ? JSON.parse(pacienteStr) : null;
      const exames = examesStr ? JSON.parse(examesStr) : [];

      if (!paciente) {
        this.setState({ paciente: null, exames: [], carregando: false, buscou: true });
        return Alert.alert("Não encontrado", "Nenhum paciente para este CPF.");
      }

      this.setState({
        paciente,
        exames: Array.isArray(exames) ? exames : [],
        carregando: false,
        buscou: true,
      });
    } catch (e) {
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível concluir a busca.");
    }
  };

  limpar = () => {
    this.setState({ cpf: "", paciente: null, exames: [], carregando: false, buscou: false });
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
          <MaterialCommunityIcons name="calendar" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
          <Text style={styles.infoTxt}>Nascimento: {paciente.nascimento || "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="gender-male-female" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
          <Text style={styles.infoTxt}>Gênero: {paciente.genero || "—"}</Text>
        </View>
        <View style={styles.infoRow}>
          <MaterialCommunityIcons name="card-account-details" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
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
          <Text style={styles.emptyTxt}>Nenhum exame encontrado para este CPF.</Text>
        ) : (
          exames.map((ex, idx) => {
            const chip = this.statusChipStyle(ex.status);
            return (
              <View key={ex.id || idx} style={styles.examCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <MaterialCommunityIcons name={this.statusIcon(ex.status)} size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.examTitle}>{ex.tipo || "Exame"}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Coleta:</Text>
                  <Text style={styles.examValue}>{ex.dataColeta || "—"}</Text>
                </View>
                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Status:</Text>
                  <View style={[styles.chip, { backgroundColor: chip.bg, borderColor: chip.border }]}>
                    <Text style={styles.chipTxt}>{ex.status || "—"}</Text>
                  </View>
                </View>

                {ex.resultado ? (
                  <View style={[styles.examRow, { alignItems: "flex-start" }]}>
                    <Text style={styles.examLabel}>Resultado:</Text>
                    <Text style={[styles.examValue, { flex: 1 }]}>{ex.resultado}</Text>
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </View>
    );
  }

  render() {
    const { cpf, carregando } = this.state;

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.topRight}>
            <Pressable
              onPress={this.props.onVoltar || (() => {})}
              style={styles.topRightBtn}
              accessibilityRole="button"
              accessibilityLabel="Voltar"
            >
              <Text style={styles.topRightTxt}>Voltar</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
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

              <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                <Pressable onPress={this.buscar} style={styles.btnPress} disabled={carregando}>
                  {carregando ? <ActivityIndicator /> : <Text style={styles.btnText}>Buscar</Text>}
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
  center: { flexGrow: 1, justifyContent: "center", padding: 20 },

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
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  title: { color: "#eaf1ff", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },

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
  examLabel: { color: "#cdd9ff", width: 80 },
  examValue: { color: "#eaf1ff", fontWeight: "600" },

  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipTxt: { color: "#eaf1ff", fontWeight: "700", fontSize: 12 },
});

/*
  === SEED OPCIONAL (para testar) ===
  (async () => {
    const cpfN = "12345678901";
    await AsyncStorage.setItem(
      cpfN,
      JSON.stringify({
        nome: "Maria da Silva",
        nascimento: "12/03/1989",
        genero: "Feminino",
        celular: "11999999999",
        cep: "01234000",
      })
    );
    await AsyncStorage.setItem(
      `EXA_${cpfN}`,
      JSON.stringify([
        { id: "1", tipo: "Hemograma", dataColeta: "10/09/2025", status: "Liberado", resultado: "Dentro da normalidade" },
        { id: "2", tipo: "Raio-X Tórax", dataColeta: "05/09/2025", status: "Pendente" },
      ])
    );
  })();
*/
