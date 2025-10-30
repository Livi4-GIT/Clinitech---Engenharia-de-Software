import React, { useMemo } from "react";
import { View, 
         Text, 
         Pressable, 
         StyleSheet, 
         Alert, 
         Platform, 
         Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

function parseDate(str) {
  if (!str || typeof str !== "string") return null;
  const s = str.trim();
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return new Date(`${iso[1]}-${iso[2]}-${iso[3]}T00:00:00`);
  const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (br) return new Date(`${br[3]}-${br[2]}-${br[1]}T00:00:00`);
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function formatarDataBR(dateLike) {
  const d = dateLike instanceof Date ? dateLike : parseDate(dateLike);
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function addDays(dateLike, days) {
  const d = dateLike instanceof Date ? new Date(dateLike) : parseDate(dateLike);
  if (!d || Number.isNaN(days)) return null;
  const out = new Date(d);
  out.setDate(out.getDate() + Number(days));
  out.setHours(0, 0, 0, 0);
  return out;
}

function isPast(dateLike) {
  const d = dateLike instanceof Date ? dateLike : parseDate(dateLike);
  if (!d) return false;
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

function normalizeAtestado(a = {}) {
  const dataEmissao = a.dataEmissao || a.emissao || a.data || a.criadoEm || "";
  const diasAfastamento = a.diasAfastamento ?? a.dias ?? a.periodoDias ?? a.afastamentoDias ?? null;
  const cid = a.cid || a.cid10 || a.cid_10 || "";
  const motivo = a.motivo || a.diagnostico || a.observacao || a.justificativa || "";
  const status = a.status || "";
  const pdfUri = a.pdfUri || a.pdfURL || a.pdfUrl || a.uri || a.arquivoUri || a.arquivo || a.pdfUriNorm;
  const pdfNome =
    a.pdfNome ||
    a.nomePdf ||
    a.arquivoNome ||
    a.pdfNomeNorm ||
    (typeof pdfUri === "string" ? pdfUri.split("/").pop() : "atestado.pdf");
  let validoAte = null;
  const dEmissao = parseDate(dataEmissao);
  if (dEmissao && diasAfastamento && !Number.isNaN(Number(diasAfastamento))) {
    validoAte = addDays(dEmissao, Number(diasAfastamento) - 1);
  }
  return {
    id: a.id,
    titulo: a.titulo || "Atestado",
    dataEmissao,
    diasAfastamento,
    cid,
    motivo,
    status,
    pdfUri,
    pdfNome,
    validoAte,
  };
}

export default function VisualizarAtestado({ atestado, onVoltar }) {
  const r = useMemo(() => normalizeAtestado(atestado), [atestado]);
  const periodoEncerrado = r.validoAte ? isPast(r.validoAte) : false;

  if (!atestado) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTxt}>Nenhum atestado selecionado.</Text>
        <Pressable style={styles.voltarBtn} onPress={onVoltar}>
          <Text style={styles.voltarTxt}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const abrirPdf = async () => {
    try {
      if (!r.pdfUri) {
        return Alert.alert("Sem arquivo", "Nenhum PDF foi anexado a este atestado.");
      }
      if (/^https?:\/\//i.test(r.pdfUri)) {
        const supported = await Linking.canOpenURL(r.pdfUri);
        if (supported) return Linking.openURL(r.pdfUri);
        return Alert.alert("Não foi possível abrir", r.pdfNome || "atestado.pdf");
      }
      const info = await FileSystem.getInfoAsync(r.pdfUri);
      if (!info.exists) {
        return Alert.alert("Arquivo não encontrado", "O PDF foi removido ou não está disponível.");
      }
      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return Alert.alert("Aviso", "Abertura de arquivo não suportada neste dispositivo.");
      }
      await Sharing.shareAsync(r.pdfUri, {
        mimeType: "application/pdf",
        dialogTitle: r.pdfNome || "Atestado",
      });
    } catch (err) {
      console.error(err);
      Alert.alert("Erro", "Falha ao abrir o arquivo PDF.");
    }
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerRow}>
          <Pressable onPress={onVoltar} style={styles.backBtn}>
            <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
          </Pressable>
          <Text style={styles.headerTitle}>
            {r.titulo}
            {r.validoAte
              ? ` · Válido até ${formatarDataBR(r.validoAte)}`
              : r.dataEmissao
              ? ` · Emitido em ${formatarDataBR(r.dataEmissao)}`
              : ""}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MaterialCommunityIcons name="file-pdf-box" size={90} color="#ffd166" />
        <Text style={styles.infoTxt}>{r.pdfNome || "Atestado em PDF"}</Text>

        <View style={{ marginTop: 16 }}>
          {r.dataEmissao ? (
            <Text style={styles.detailTxt}>
              <Text style={styles.detailLabel}>Data de emissão: </Text>
              {formatarDataBR(r.dataEmissao)}
            </Text>
          ) : null}
          {typeof r.diasAfastamento !== "undefined" && r.diasAfastamento !== null ? (
            <Text style={styles.detailTxt}>
              <Text style={styles.detailLabel}>Dias de afastamento: </Text>
              {String(r.diasAfastamento)}
            </Text>
          ) : null}
          {r.cid ? (
            <Text style={styles.detailTxt}>
              <Text style={styles.detailLabel}>CID: </Text>
              {r.cid}
            </Text>
          ) : null}
          {r.motivo ? (
            <Text style={styles.detailTxt}>
              <Text style={styles.detailLabel}>Motivo: </Text>
              {r.motivo}
            </Text>
          ) : null}
          {r.status ? (
            <Text style={styles.detailTxt}>
              <Text style={styles.detailLabel}>Status: </Text>
              {r.status}
            </Text>
          ) : null}
          {r.validoAte ? (
            <Text style={[styles.detailTxt, periodoEncerrado && { opacity: 0.8 }]}>
              <Text style={styles.detailLabel}>Situação: </Text>
              {periodoEncerrado ? "Período encerrado" : "Em vigor"}
            </Text>
          ) : null}
        </View>

        <Pressable style={styles.abrirBtn} onPress={abrirPdf}>
          <MaterialCommunityIcons name="file-eye-outline" size={20} color="#fff" />
          <Text style={styles.abrirTxt}>Abrir PDF do atestado</Text>
        </Pressable>

        <Pressable style={styles.voltarBtn} onPress={onVoltar}>
          <MaterialCommunityIcons name="arrow-left" size={20} color="#fff" />
          <Text style={styles.voltarTxt}>Voltar</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000", justifyContent: "center" },
  header: { paddingTop: Platform.OS === "ios" ? 60 : 40, paddingBottom: 16, paddingHorizontal: 16 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: { marginRight: 12, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 8, padding: 6 },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700", flexShrink: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  infoTxt: { color: "#eaf1ff", fontSize: 16, marginTop: 8, textAlign: "center" },
  detailTxt: { color: "#eaf1ff", fontSize: 14, marginTop: 6, textAlign: "center" },
  detailLabel: { color: "#cdd9ff", fontWeight: "700" },
  abrirBtn: {
    marginTop: 28,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "rgba(47,110,219,0.9)",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  abrirTxt: { color: "#fff", fontWeight: "700", fontSize: 16 },
  voltarBtn: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
  },
  voltarTxt: { color: "#fff", fontWeight: "700" },
  errorTxt: { color: "#fff", fontSize: 16, textAlign: "center", marginHorizontal: 20 },
});
