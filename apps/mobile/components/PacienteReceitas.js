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

export default class PacienteReceitas extends React.Component {
  state = { carregando: false, receitas: [] };
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

  isExpired = (dateLike) => {
    const d = dateLike instanceof Date ? dateLike : this.parseDate(dateLike);
    if (!d) return false; // sem data => tratamos como Válida
    const today = new Date();
    d.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return d.getTime() < today.getTime();
  };

  formatarDataBR = (dateLike) => {
    const d = dateLike instanceof Date ? dateLike : this.parseDate(dateLike);
    if (!d) return "—";
    const dd = String(d.getDate()).padStart(2, "0");
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  };

  normalizeReceita = (r) => {
    const validadeStr =
      r?.dataValidade ||
      r?.dataVencimento ||
      r?.validade ||
      r?.vencimento ||
      r?.dataExpiracao ||
      r?.expiracao ||
      r?.expiraEm ||
      r?.expiracaoEm ||
      "";

    const pdfUri =
      r?.pdfUri ||
      r?.pdfURL ||
      r?.pdfUrl ||
      r?.uri ||
      r?.arquivoUri ||
      r?.arquivo ||
      r?.anexoUri ||
      null;

    const pdfNome =
      r?.pdfNome ||
      r?.nomePdf ||
      r?.arquivoNome ||
      (typeof pdfUri === "string" ? pdfUri.split("/").pop() : null) ||
      "receita.pdf";

   
    const expirada = this.isExpired(validadeStr);
    const status = expirada ? "Vencida" : "Válida";

    return {
      ...r,
      dataValidadeNorm: validadeStr,
      _val: this.parseDate(validadeStr),
      pdfUriNorm: pdfUri,
      pdfNomeNorm: pdfNome,
      status,
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

      const raw = await AsyncStorage.getItem(`REC_${cpfN}`);
      const arr = raw ? JSON.parse(raw) : [];

      const receitas = Array.isArray(arr)
        ? arr
            .map(this.normalizeReceita)
            .sort((a, b) => {
              const ta = a._val ? a._val.getTime() : -Infinity;
              const tb = b._val ? b._val.getTime() : -Infinity;
              return tb - ta;
            })
        : [];

      this.setState({ receitas, carregando: false });
    } catch (e) {
      console.error(e);
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível carregar as receitas.");
    }
  };

  abrirOuBaixarPdf = async (rec) => {
    if (rec.status !== "Válida") {
      Alert.alert("Receita expirada", "Esta receita venceu e não pode ser baixada.");
      return;
    }
    if (!rec?.pdfUriNorm) {
      Alert.alert("Arquivo indisponível", "Nenhum PDF anexado a esta receita.");
      return;
    }

   
    if (typeof this.props.onVisualizarPdf === "function") {
      this.props.onVisualizarPdf({ ...rec, pdfUri: rec.pdfUriNorm, pdfNome: rec.pdfNomeNorm });
      return;
    }

    try {
      const ok = await Linking.canOpenURL(rec.pdfUriNorm);
      if (ok) await Linking.openURL(rec.pdfUriNorm);
      else Alert.alert("Não foi possível abrir", rec.pdfNomeNorm || "arquivo.pdf");
    } catch {
      Alert.alert("Erro ao abrir o PDF", "Verifique o arquivo/URL informado.");
    }
  };

  renderReceitas() {
    const { receitas, carregando } = this.state;

    if (carregando) {
      return (
        <View style={{ marginTop: 20, alignItems: "center" }}>
          <ActivityIndicator />
          <Text style={{ color: "#cdd9ff", marginTop: 8 }}>Carregando…</Text>
        </View>
      );
    }

    if (!receitas?.length) {
      return <Text style={styles.emptyTxt}>Nenhuma receita encontrada para este paciente.</Text>;
    }

    return receitas.map((r, idx) => {
      const isVencida = r.status === "Vencida";
      return (
        <View key={r.id || idx} style={styles.recipeCard}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
            <MaterialCommunityIcons
              name={isVencida ? "alert-octagon-outline" : "file-document-outline"}
              size={18}
              color="#eaf1ff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.recipeTitle}>{r?.titulo || "Receita"}</Text>
          </View>

          <View style={styles.recipeRow}>
            <Text style={styles.recipeLabel}>Válida até:</Text>
            <Text style={[styles.recipeValue, isVencida && { color: "#ff9aa2" }]}>
              {this.formatarDataBR(r?.dataValidadeNorm)}
            </Text>
          </View>

          <View style={styles.recipeRow}>
            <Text style={styles.recipeLabel}>Status:</Text>
            <Text
              style={[
                styles.recipeValue,
                { fontWeight: "800" },
                isVencida ? { color: "#ff9aa2" } : { color: "#7ce0b1" },
              ]}
            >
              {r.status}
            </Text>
          </View>

          {!!r?.pdfUriNorm && (
            <Pressable
              onPress={() => this.abrirOuBaixarPdf(r)}
              disabled={isVencida}
              style={[
                styles.pdfBtnYellow,
                isVencida && { opacity: 0.45 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={isVencida ? "Receita expirada" : `Abrir ${r?.pdfNomeNorm}`}
            >
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={20}
                color="#ffd166"
                style={{ marginRight: 8 }}
              />
              <Text style={styles.pdfBtnTxt}>
                {isVencida ? "Receita expirada" : `PDF: ${r?.pdfNomeNorm}`}
              </Text>
            </Pressable>
          )}

          {!r?.pdfUriNorm && (
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
              <Text style={styles.title}>Receitas do Paciente</Text>
              <Text style={styles.subtitle}>CPF: {this.somenteDigitos(cpf || "")}</Text>

              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Receitas</Text>
                {this.renderReceitas()}
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
  title: {
    color: "#eaf1ff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
  },
  subtitle: {
    color: "#cdd9ff",
    textAlign: "center",
    marginBottom: 12,
  },

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

  emptyTxt: { color: "#cdd9ff", fontStyle: "italic" },

  recipeCard: {
    marginTop: 10,
    padding: 12,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.15)",
  },
  recipeTitle: { color: "#eaf1ff", fontWeight: "700", fontSize: 15 },
  recipeRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  recipeLabel: { color: "#cdd9ff", width: 110 },
  recipeValue: { color: "#eaf1ff", fontWeight: "600" },

  
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

  btn: { marginTop: 12, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
