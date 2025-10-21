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
      cancelandoId: null,
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

 
  isPendente = (status) => {
    const s = String(status || "").toLowerCase();
    return s.includes("solic") || s.includes("pend") || s.includes("aguard");
  };

  statusIcon = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s)) return "clock-outline"; // Solicitado / Pendente / Aguardando
    if (s.includes("aceit") || s.includes("confirm")) return "check-circle-outline"; // Aceito / Confirmado
    if (s.includes("liber") || s.includes("pronto") || s.includes("conclu") || s.includes("final") || s.includes("ok"))
      return "check-decagram"; // Liberado / Pronto / Concluído
    if (s.includes("recus") || s.includes("rejei") || s.includes("cancel") || s.includes("erro") || s.includes("falh"))
      return "alert-circle"; // Recusado / Cancelado / Erro
    return "file-document";
  };

  statusChipStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s))
      return { bg: "rgba(255,205,86,0.15)", border: "rgba(255,205,86,0.45)" }; // amarelo
    if (s.includes("aceit") || s.includes("confirm"))
      return { bg: "rgba(54,162,235,0.15)", border: "rgba(54,162,235,0.45)" }; // azul
    if (s.includes("liber") || s.includes("pronto") || s.includes("conclu") || s.includes("final") || s.includes("ok"))
      return { bg: "rgba(75,192,192,0.15)", border: "rgba(75,192,192,0.45)" }; // verde
    if (s.includes("recus") || s.includes("rejei") || s.includes("cancel") || s.includes("erro") || s.includes("falh"))
      return { bg: "rgba(255,99,132,0.15)", border: "rgba(255,99,132,0.45)" }; // vermelho
    return { bg: "rgba(214,228,255,0.12)", border: "rgba(214,228,255,0.28)" }; // neutro
  };


  buscar = async () => {
    try {
      const { cpf } = this.state;
      const cpfN = this.somenteDigitos(cpf);

      if (cpfN.length !== 11) {
        return Alert.alert("CPF inválido", "Informe 11 dígitos.");
      }

      this.setState({ carregando: true });

      const [pacSemPrefixo, pacComPrefixo, examesStr] = await Promise.all([
        AsyncStorage.getItem(cpfN),
        AsyncStorage.getItem(`PAC_${cpfN}`),
        AsyncStorage.getItem(`EXA_${cpfN}`),
      ]);

      const pacienteStr = pacSemPrefixo || pacComPrefixo;
      const paciente = pacienteStr ? JSON.parse(pacienteStr) : null;
      const exames = examesStr ? JSON.parse(examesStr) : [];

      if (paciente) {
        return this.setState({
          paciente,
          exames: Array.isArray(exames) ? exames : [],
          carregando: false,
          buscou: true,
        });
      }

      if (!this.validarCPF(cpf)) {
        this.setState({ carregando: false, buscou: true, paciente: null, exames: [] });
        return Alert.alert("CPF inválido", "Verifique o número informado.");
      }

   
      this.setState({ carregando: false, buscou: true, paciente: null, exames: [] });
      Alert.alert("Não encontrado", "Nenhum paciente para este CPF.");
    } catch (e) {
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível concluir a busca.");
    }
  };

  limpar = () => {
    this.setState({ cpf: "", paciente: null, exames: [], carregando: false, buscou: false });
  };


  confirmarCancelamento = (exame) => {
    Alert.alert(
      "Cancelar exame?",
      "Tem certeza que deseja cancelar esta solicitação?",
      [
        { text: "Não" },
        { text: "Sim, cancelar", style: "destructive", onPress: () => this.cancelarExame(exame) },
      ]
    );
  };

  cancelarExame = async (exame) => {
    try {
      const { cpf } = this.state;
      const cpfN = this.somenteDigitos(cpf);
      const key = `EXA_${cpfN}`;

      this.setState({ cancelandoId: exame.id });

      const listaStr = await AsyncStorage.getItem(key);
      const lista = listaStr ? JSON.parse(listaStr) : [];
      const novaLista = lista.map((e) => {
        if (e.id === exame.id) {
          return {
            ...e,
            status: "Cancelado",
            canceladoEm: new Date().toISOString(),
          };
        }
        return e;
      });

      await AsyncStorage.setItem(key, JSON.stringify(novaLista));

      // reflete na tela
      this.setState({
        exames: this.state.exames.map((e) =>
          e.id === exame.id ? { ...e, status: "Cancelado", canceladoEm: new Date().toISOString() } : e
        ),
        cancelandoId: null,
      });

      Alert.alert("Cancelado", "A solicitação foi cancelada.");
    } catch (e) {
      this.setState({ cancelandoId: null });
      Alert.alert("Erro", "Não foi possível cancelar o exame.");
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
    const { exames, buscou, paciente, cancelandoId } = this.state;
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
            const pendente = this.isPendente(ex.status);
            const isCanc = cancelandoId === ex.id;

            return (
              <View key={ex.id || idx} style={styles.examCard}>
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                  <MaterialCommunityIcons name={this.statusIcon(ex.status)} size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.examTitle}>{ex.tipo || "Exame"}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Dia do exame:</Text>
                  <Text style={styles.examValue}>{ex.dataColeta || "—"}</Text>
                </View>

                <View style={styles.examRow}>
                  <Text style={styles.examLabel}>Status:</Text>
                  <View style={[styles.chip, { backgroundColor: chip.bg, borderColor: chip.border }]}>
                    <Text style={styles.chipTxt}>{ex.status || "—"}</Text>
                  </View>
                </View>

                {(ex.observacao || ex.resultado) ? (
                  <View style={[styles.examRow, { alignItems: "flex-start" }]}>
                    <Text style={styles.examLabel}>Observação:</Text>
                    <Text style={[styles.examValue, { flex: 1 }]}>{ex.observacao || ex.resultado}</Text>
                  </View>
                ) : null}

                {pendente && (
                  <Pressable
                    onPress={() => this.confirmarCancelamento(ex)}
                    style={styles.cancelBtn}
                    disabled={isCanc}
                    accessibilityRole="button"
                    accessibilityLabel="Cancelar exame pendente"
                  >
                    {isCanc ? (
                      <ActivityIndicator />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="close-circle-outline" size={18} color="#ff6b81" style={{ marginRight: 6 }} />
                        <Text style={styles.cancelBtnTxt}>Cancelar exame</Text>
                      </>
                    )}
                  </Pressable>
                )}
              </View>
            );
          })
        )}
      </View>
    );
  }


  handleSolicitarExame = () => {
    const { paciente, cpf } = this.state;
    const cpfN = this.somenteDigitos(cpf);
    if (!paciente) return;
    if (this.props.onSolicitarExame) {
      this.props.onSolicitarExame({ cpf: cpfN, paciente });
    } else {
      Alert.alert("Ação", `Navegar para tela de solicitação de exame (CPF ${cpfN}).`);
    }
  };

  render() {
    const { cpf, carregando, paciente } = this.state;

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        
          {this.props.onVoltar && (
            <View style={styles.topRight}>
              <Pressable
                onPress={this.props.onVoltar}
                style={styles.topRightBtn}
                accessibilityRole="button"
                accessibilityLabel="Voltar"
              >
                <Text style={styles.topRightTxt}>Voltar</Text>
              </Pressable>
            </View>
          )}

         
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
  examLabel: { color: "#cdd9ff", width: 110 },
  examValue: { color: "#eaf1ff", fontWeight: "600" },

  chip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipTxt: { color: "#eaf1ff", fontWeight: "700", fontSize: 12 },

  // botão cancelar
  cancelBtn: {
    marginTop: 10,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,99,132,0.6)",
    backgroundColor: "rgba(255,99,132,0.08)",
  },
  cancelBtnTxt: { color: "#ff6b81", fontWeight: "800" },
});
