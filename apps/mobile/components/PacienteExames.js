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
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy"; 
import * as Sharing from "expo-sharing";


export default class PacienteExames extends React.Component {
  constructor(props) {
    super(props);
    const cpfProp = props?.cpf || props?.route?.params?.cpf || "";
    this.state = {
      cpf: this.formatarCPF(cpfProp || ""),
      exames: [],
      carregando: false,
      anexandoId: null,
      buscou: Boolean(cpfProp),
    };
  }

  componentDidMount() {
    const { cpf } = this.state;
    if (cpf && this.somenteDigitos(cpf).length === 11) {
      this.buscar(true);
    }
  }

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };

  // === datas ===
  parseData = (s) => {
    if (!s) return null;
    const d1 = new Date(s);
    if (!isNaN(d1)) return d1;
    const m = String(s).match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})/);
    if (m) {
      const [_, dd, mm, yyyy] = m;
      return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    }
    const m2 = String(s).match(/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})/);
    if (m2) {
      const [_, yyyy, mm, dd] = m2;
      return new Date(parseInt(yyyy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10));
    }
    return null;
  };
  jaPassou = (dataStr) => {
    const d = this.parseData(dataStr);
    if (!d) return false;
    const hoje = new Date();
    d.setHours(0, 0, 0, 0);
    hoje.setHours(0, 0, 0, 0);
    return d.getTime() <= hoje.getTime();
  };

  // === status ===
  isPendente = (status) => {
    const s = String(status || "").toLowerCase();
    return s.includes("solic") || s.includes("pend") || s.includes("aguard");
  };
  isLiberado = (status) => {
    const s = String(status || "").toLowerCase();
    return s.includes("liber") || s.includes("pronto") || s.includes("conclu") || s.includes("final") || s.includes("ok");
  };
  statusIcon = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s)) return "clock-outline";
    if (s.includes("aceit") || s.includes("confirm")) return "check-circle-outline";
    if (this.isLiberado(s)) return "check-decagram";
    if (s.includes("recus") || s.includes("rejei") || s.includes("cancel") || s.includes("erro") || s.includes("falh"))
      return "alert-circle";
    return "file-document";
  };
  statusChipStyle = (status) => {
    const s = String(status || "").toLowerCase();
    if (this.isPendente(s)) return { bg: "rgba(255,205,86,0.15)", border: "rgba(255,205,86,0.45)" };
    if (s.includes("aceit") || s.includes("confirm")) return { bg: "rgba(54,162,235,0.15)", border: "rgba(54,162,235,0.45)" };
    if (this.isLiberado(s)) return { bg: "rgba(75,192,192,0.15)", border: "rgba(75,192,192,0.45)" };
    if (s.includes("recus") || s.includes("rejei") || s.includes("cancel") || s.includes("erro") || s.includes("falh"))
      return { bg: "rgba(255,99,132,0.15)", border: "rgba(255,99,132,0.45)" };
    return { bg: "rgba(214,228,255,0.12)", border: "rgba(214,228,255,0.28)" };
  };

  podeAnexar = (ex) => this.jaPassou(ex?.dataColeta) && !ex?.resultadoPdfUri;

  buscar = async (auto = false) => {
    try {
      const { cpf } = this.state;
      const cpfN = this.somenteDigitos(cpf);
      if (cpfN.length !== 11) {
        if (auto) return;
        return Alert.alert("CPF inválido", "Informe 11 dígitos.");
      }
      this.setState({ carregando: true });

      const examesStr = await AsyncStorage.getItem(`EXA_${cpfN}`);
      const exames = examesStr ? JSON.parse(examesStr) : [];

      this.setState({
        exames: Array.isArray(exames) ? exames : [],
        carregando: false,
        buscou: true,
      });

      if ((!exames || exames.length === 0) && !auto) {
        Alert.alert("Nenhum exame", "Não encontramos exames para este CPF.");
      }
    } catch (e) {
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível carregar os exames.");
    }
  };

  limpar = () => {
    this.setState({ cpf: "", exames: [], carregando: false, buscou: false });
  };

  visualizarExame = (exame) => {
    if (this.props.onVisualizarExame) {
      this.props.onVisualizarExame(exame);
    } else {
      Alert.alert("Visualizar exame", exame.resultado || "Abrir visualização/laudo do exame.");
    }
  };

  // === anexar PDF corrigido e persistente ===
  anexarPdf = async (exame) => {
    try {
      const cpfN = this.somenteDigitos(this.state.cpf);
      if (cpfN.length !== 11) {
        return Alert.alert("CPF inválido", "Informe 11 dígitos.");
      }

      this.setState({ anexandoId: exame.id });

      const pick = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (pick.canceled) {
        this.setState({ anexandoId: null });
        return;
      }

      const file = pick.assets?.[0];
      if (!file?.uri) {
        this.setState({ anexandoId: null });
        return Alert.alert("Erro", "Arquivo inválido.");
      }

      // cria diretório fixo do paciente
      const baseDir = `${FileSystem.documentDirectory}exames/${cpfN}`;
      await FileSystem.makeDirectoryAsync(baseDir, { intermediates: true });

      const fileName = `${exame.id || Date.now()}.pdf`;
      const destPath = `${baseDir}/${fileName}`;

      await FileSystem.copyAsync({ from: file.uri, to: destPath });

      // salva no AsyncStorage
      const key = `EXA_${cpfN}`;
      const listaStr = await AsyncStorage.getItem(key);
      const lista = listaStr ? JSON.parse(listaStr) : [];

      const novaLista = lista.map((e) =>
        (e.id || e.tipo) === (exame.id || exame.tipo)
          ? {
              ...e,
              resultadoPdfUri: destPath,
              resultadoPdfNome: file.name || fileName,
              resultadoPdfData: new Date().toISOString(),
            }
          : e
      );

      await AsyncStorage.setItem(key, JSON.stringify(novaLista));

      // atualiza na tela também
      this.setState((prev) => ({
        exames: prev.exames.map((e) =>
          (e.id || e.tipo) === (exame.id || exame.tipo)
            ? {
                ...e,
                resultadoPdfUri: destPath,
                resultadoPdfNome: file.name || fileName,
                resultadoPdfData: new Date().toISOString(),
              }
            : e
        ),
        anexandoId: null,
      }));

      Alert.alert("Sucesso", "PDF anexado e salvo com sucesso!");
    } catch (err) {
      console.error(err);
      this.setState({ anexandoId: null });
      Alert.alert("Erro", "Falha ao anexar o PDF.");
    }
  };

  abrirOuCompartilharPdf = async (ex) => {
    try {
      if (!ex?.resultadoPdfUri) return;
      const info = await FileSystem.getInfoAsync(ex.resultadoPdfUri);
      if (!info.exists) {
        return Alert.alert("Arquivo não encontrado", "O PDF salvo não está mais disponível.");
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(ex.resultadoPdfUri, { mimeType: "application/pdf" });
      } else {
        Alert.alert("Compartilhamento indisponível", "O dispositivo não permite compartilhar agora.");
      }
    } catch {
      Alert.alert("Erro", "Não foi possível abrir o PDF.");
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

  renderExames() {
    const { exames, buscou, anexandoId } = this.state;

    return (
      <View style={[styles.section, { marginTop: 16 }]}>
        <Text style={styles.sectionTitle}>
          Meus exames {exames?.length ? `(${exames.length})` : ""}
        </Text>

        {(!exames || exames.length === 0) && buscou ? (
          <Text style={styles.emptyTxt}>Nenhum exame encontrado.</Text>
        ) : (
          exames.map((ex, idx) => {
            const chip = this.statusChipStyle(ex.status);
            const podeVerLaudo = Boolean(ex.realizado) && this.isLiberado(ex.status);
            const labelLaudo = podeVerLaudo
              ? "Visualizar exame"
              : (this.jaPassou(ex.dataColeta) ? "Exame realizado" : "Aguardando liberação");
            const podeAnexar = this.podeAnexar(ex);
            const temPdf = !!ex.resultadoPdfUri;
            const loadingAnexo = anexandoId === ex.id;

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

                {/* Ações */}
                <View style={{ marginTop: 10 }}>
                  <LinearGradient
                    colors={["#2f6edb", "#1f4fb6"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={[styles.viewBtn, !podeVerLaudo && { opacity: 0.5 }]}
                  >
                    <Pressable
                      onPress={() => this.visualizarExame(ex)}
                      style={styles.viewPress}
                      disabled={!podeVerLaudo}
                      accessibilityRole="button"
                      accessibilityLabel="Visualizar exame"
                    >
                      <MaterialCommunityIcons name="file-eye-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.viewBtnTxt}>{labelLaudo}</Text>
                    </Pressable>
                  </LinearGradient>

                  {/* Anexar PDF */}
                  {podeAnexar && (
                    <LinearGradient
                      colors={["#2f6edb", "#1f4fb6"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.viewBtn, { marginTop: 8 }]}
                    >
                      <Pressable
                        onPress={() => this.anexarPdf(ex)}
                        style={styles.viewPress}
                        disabled={loadingAnexo}
                        accessibilityRole="button"
                        accessibilityLabel="Anexar PDF do resultado"
                      >
                        {loadingAnexo ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <>
                            <MaterialCommunityIcons name="file-upload-outline" size={18} color="#fff" style={{ marginRight: 6 }} />
                            <Text style={styles.viewBtnTxt}>Anexar PDF do resultado</Text>
                          </>
                        )}
                      </Pressable>
                    </LinearGradient>
                  )}

                  {/* PDF existente */}
                  {temPdf && (
                    <Pressable
                      onPress={() => this.abrirOuCompartilharPdf(ex)}
                      style={styles.pdfBtn}
                      accessibilityRole="button"
                      accessibilityLabel="Ver ou compartilhar PDF anexado"
                    >
                      <MaterialCommunityIcons name="file-pdf-box" size={18} color="#ffd166" style={{ marginRight: 6 }} />
                      <Text style={styles.pdfBtnTxt}>
                        {ex.resultadoPdfNome ? `PDF: ${ex.resultadoPdfNome}` : "PDF anexado"} — tocar para compartilhar
                      </Text>
                    </Pressable>
                  )}
                </View>
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
              <Text style={styles.title}>Meus Exames</Text>

              {!this.props?.cpf && (
                <>
                  {this.Input({
                    icon: "card-account-details",
                    placeholder: "CPF (000.000.000-00)",
                    keyboardType: "number-pad",
                    value: cpf,
                    onChangeText: (v) => this.setState({ cpf: this.formatarCPF(v) }),
                    maxLength: 14,
                  })}

                  <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                    <Pressable onPress={() => this.buscar(false)} style={styles.btnPress} disabled={carregando}>
                      {carregando ? <ActivityIndicator /> : <Text style={styles.btnText}>Buscar</Text>}
                    </Pressable>
                  </LinearGradient>

                  <Pressable style={{ marginTop: 12 }} onPress={this.limpar}>
                    <Text style={styles.link}>Nova busca</Text>
                  </Pressable>
                </>
              )}

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
  section: { marginTop: 10, paddingTop: 10, borderTopWidth: 1, borderTopColor: "rgba(214,228,255,0.18)" },
  sectionTitle: { color: "#eaf1ff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
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
  viewBtn: { borderRadius: 12, overflow: "hidden" },
  viewPress: { paddingVertical: 8, paddingHorizontal: 12, flexDirection: "row", alignItems: "center" },
  viewBtnTxt: { color: "#fff", fontWeight: "800" },
  pdfBtn: {
    marginTop: 8,
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
