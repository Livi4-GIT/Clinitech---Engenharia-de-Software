import React from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Linking,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class PacienteAtestado extends React.Component {
  state = { carregando: false, atestados: [] };
  focusUnsub = null;

  componentDidMount() {
    this.focusUnsub = this.props?.navigation?.addListener?.("focus", this.carregar);
    this.carregar();
  }
  componentWillUnmount() {
    if (this.focusUnsub) this.focusUnsub();
  }

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");

  parseDate = (raw) => {
    if (!raw || typeof raw !== "string") return null;
    const s = raw.trim();

    let m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[T\s](\d{2}):(\d{2}))?$/);
    if (m) {
      const [_, yyyy, mm, dd, HH = "00", MM = "00"] = m;
      const d = new Date(+yyyy, +mm - 1, +dd, +HH, +MM, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }

    m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[T\s](\d{2}):(\d{2}))?$/);
    if (m) {
      const [_, dd, mm, yyyy, HH = "00", MM = "00"] = m;
      const d = new Date(+yyyy, +mm - 1, +dd, +HH, +MM, 0, 0);
      return isNaN(d.getTime()) ? null : d;
    }

    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  };

  formatarDataBR = (dateLike) => {
    const d = dateLike instanceof Date ? dateLike : this.parseDate(dateLike);
    if (!d) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  isPast = (dateLike) => {
    const d = dateLike instanceof Date ? dateLike : this.parseDate(dateLike);
    if (!d) return false;
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  addDays = (dateLike, days) => {
    const d = dateLike instanceof Date ? new Date(dateLike) : this.parseDate(dateLike);
    if (!d || Number.isNaN(days)) return null;
    const out = new Date(d);
    out.setDate(out.getDate() + Number(days));
    out.setHours(0, 0, 0, 0);
    return out;
  };

  normalizeAtestado = (a) => {
    const dataEmissao = a?.dataEmissao || a?.emissao || a?.data || a?.criadoEm || "";
    const diasAfastamento = a?.diasAfastamento ?? a?.dias ?? a?.periodoDias ?? a?.afastamentoDias ?? null;
    const cid = a?.cid || a?.cid10 || a?.cid_10 || "";
    const motivo = a?.motivo || a?.diagnostico || a?.observacao || a?.justificativa || "";
    const status = a?.status || "";
    const pdfUri =
      a?.pdfUri ||
      a?.pdfURL ||
      a?.pdfUrl ||
      a?.uri ||
      a?.arquivoUri ||
      a?.arquivo ||
      a?.anexoUri ||
      null;
    const pdfNome =
      a?.pdfNome ||
      a?.nomePdf ||
      a?.arquivoNome ||
      (typeof pdfUri === "string" ? pdfUri.split("/").pop() : null) ||
      "atestado.pdf";
    const dEmissao = this.parseDate(dataEmissao);
    let validoAte = null;
    if (dEmissao && diasAfastamento && !Number.isNaN(Number(diasAfastamento))) {
      validoAte = this.addDays(dEmissao, Number(diasAfastamento) - 1);
    }
    const situacao = validoAte ? (this.isPast(validoAte) ? "Encerrado" : "Em vigor") : status || "—";
    return {
      ...a,
      dataEmissaoNorm: dataEmissao,
      diasAfastamentoNorm: diasAfastamento,
      cidNorm: cid,
      motivoNorm: motivo,
      statusNorm: status,
      pdfUriNorm: pdfUri,
      pdfNomeNorm: pdfNome,
      validoAte,
      _ord: dEmissao ? dEmissao.getTime() : -Infinity,
      situacao,
    };
  };

  carregar = async () => {
    try {
      const cpfN = this.somenteDigitos(this.props?.cpf || "");
      if (!cpfN) {
        Alert.alert("Atenção", "CPF do paciente não informado.");
        return;
      }
      this.setState({ carregando: true });
      const raw = await AsyncStorage.getItem(`ATE_${cpfN}`);
      const arr = raw ? JSON.parse(raw) : [];
      const atestados = Array.isArray(arr)
        ? arr.map(this.normalizeAtestado).sort((a, b) => b._ord - a._ord)
        : [];
      this.setState({ atestados, carregando: false });
    } catch (e) {
      console.error(e);
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível carregar os atestados.");
    }
  };

  abrirOuVisualizar = async (item) => {
    if (typeof this.props.onVisualizarAtestado === "function") {
      this.props.onVisualizarAtestado({
        ...item,
        pdfUri: item.pdfUriNorm,
        pdfNome: item.pdfNomeNorm,
      });
      return;
    }
    if (typeof this.props.onVisualizarPdf === "function") {
      this.props.onVisualizarPdf({
        ...item,
        pdfUri: item.pdfUriNorm,
        pdfNome: item.pdfNomeNorm,
      });
      return;
    }
    if (!item?.pdfUriNorm) {
      Alert.alert("Arquivo indisponível", "Nenhum PDF anexado a este atestado.");
      return;
    }
    try {
      const ok = await Linking.canOpenURL(item.pdfUriNorm);
      if (ok) await Linking.openURL(item.pdfUriNorm);
      else Alert.alert("Não foi possível abrir", item.pdfNomeNorm || "arquivo.pdf");
    } catch {
      Alert.alert("Erro ao abrir o PDF", "Verifique o arquivo/URL informado.");
    }
  };

  renderLista() {
    const { atestados, carregando } = this.state;

    if (carregando) {
      return (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#cdd9ff", marginTop: 8 }}>Carregando…</Text>
        </View>
      );
    }

    if (!atestados?.length) {
      return <Text style={styles.emptyTxt}>Nenhum atestado encontrado para este paciente.</Text>;
    }

    return atestados.map((a, idx) => {
      const encerrado = a.situacao === "Encerrado";
      return (
        <View key={a.id || idx} style={styles.cardItem}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <MaterialCommunityIcons
              name={encerrado ? "check-circle-outline" : "clock-outline"}
              size={18}
              color="#eaf1ff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.itemTitle}>{a?.titulo || "Atestado"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>Emissão:</Text>
            <Text style={styles.value}>{this.formatarDataBR(a?.dataEmissaoNorm)}</Text>
          </View>

          {typeof a?.diasAfastamentoNorm !== "undefined" && a?.diasAfastamentoNorm !== null ? (
            <View style={styles.row}>
              <Text style={styles.label}>Dias de afastamento:</Text>
              <Text style={styles.value}>{String(a?.diasAfastamentoNorm)}</Text>
            </View>
          ) : null}

          {!!a?.cidNorm && (
            <View style={styles.row}>
              <Text style={styles.label}>CID:</Text>
              <Text style={styles.value}>{a?.cidNorm}</Text>
            </View>
          )}

          {a?.validoAte ? (
            <View style={styles.row}>
              <Text style={styles.label}>Válido até:</Text>
              <Text style={[styles.value, encerrado && { color: "#ff9aa2" }]}>
                {this.formatarDataBR(a?.validoAte)}
              </Text>
            </View>
          ) : null}

          <View style={styles.row}>
            <Text style={styles.label}>Situação:</Text>
            <Text
              style={[
                styles.value,
                { fontWeight: "800" },
                encerrado ? { color: "#ff9aa2" } : { color: "#7ce0b1" },
              ]}
            >
              {a.situacao}
            </Text>
          </View>

          {!!a?.pdfUriNorm ? (
            <Pressable
              onPress={() => this.abrirOuVisualizar(a)}
              style={styles.pdfBtnYellow}
              accessibilityRole="button"
              accessibilityLabel={`Abrir ${a?.pdfNomeNorm || "atestado.pdf"}`}
            >
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={20}
                color="#ffd166"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.pdfBtnTxt}>PDF: {a?.pdfNomeNorm}</Text>
            </Pressable>
          ) : (
            <Text style={{ color: "#cdd9ff", marginTop: 8, fontStyle: "italic" }}>
              Nenhum PDF anexado.
            </Text>
          )}
        </View>
      );
    });
  }

  render() {
    const { onVoltar, cpf } = this.props;

    return (
      <LinearGradient
        colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          {onVoltar && (
            <View style={styles.topRight}>
              <Pressable onPress={onVoltar} style={styles.topRightBtn}>
                <Text style={styles.topRightTxt}>Voltar</Text>
              </Pressable>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Atestados do Paciente</Text>
              <Text style={styles.subtitle}>CPF: {this.somenteDigitos(cpf || "")}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Atestados</Text>
                {this.renderLista()}
              </View>
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
  title: { color: "#eaf1ff", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 6 },
  subtitle: { color: "#cdd9ff", textAlign: "center", marginBottom: 12 },
  section: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(214,228,255,0.18)",
  },
  sectionTitle: { color: "#eaf1ff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  emptyTxt: { color: "#cdd9ff", fontStyle: "italic" },
  cardItem: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  itemTitle: { color: "#eaf1ff", fontWeight: "700", fontSize: 15 },
  row: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  label: { color: "#cdd9ff", width: 140 },
  value: { color: "#eaf1ff", fontWeight: "600", flexShrink: 1 },
  pdfBtnYellow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,214,102,0.6)",
    backgroundColor: "rgba(255,214,102,0.08)",
    marginTop: 10,
  },
  pdfBtnTxt: { color: "#ffd166", fontWeight: "800" },
});
