import React, { useMemo } from "react";
import { View, Text, Pressable, StyleSheet, Alert, Platform, Linking } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";


function normalizeReceita(r = {}) {
  const validadeStr =
    r.dataValidade || r.dataVencimento || r.validade || r.expiracao || r.expiracaoEm || "";
  const pdfUri =
    r.pdfUri || r.pdfURL || r.pdfUrl || r.uri || r.arquivoUri || r.arquivo || r.pdfUriNorm;
  const pdfNome =
    r.pdfNome ||
    r.nomePdf ||
    r.arquivoNome ||
    r.pdfNomeNorm ||
    (typeof pdfUri === "string" ? pdfUri.split("/").pop() : "receita.pdf");

  return {
    id: r.id,
    titulo: r.titulo || "Receita",
    dataValidade: validadeStr,
    pdfUri,
    pdfNome,
  };
}

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

function isExpired(dateLike) {
  const d = dateLike instanceof Date ? dateLike : parseDate(dateLike);
  if (!d) return false;
  const today = new Date();
  d.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return d.getTime() < today.getTime();
}

function formatarDataBR(dateLike) {
  const d = dateLike instanceof Date ? dateLike : parseDate(dateLike);
  if (!d) return "—";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export default function VisualizarReceita({ receita, onVoltar }) {
  const r = useMemo(() => normalizeReceita(receita), [receita]);
  const expirada = isExpired(r.dataValidade);

  if (!receita) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTxt}>Nenhuma receita selecionada.</Text>
        <Pressable style={styles.voltarBtn} onPress={onVoltar}>
          <Text style={styles.voltarTxt}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const abrirPdf = async () => {
    try {
      if (expirada) {
        return Alert.alert("Receita expirada", "Esta receita venceu e não pode ser aberta.");
      }
      if (!r.pdfUri) {
        return Alert.alert("Sem arquivo", "Nenhum PDF foi anexado a esta receita.");
      }

      
      if (/^https?:\/\//i.test(r.pdfUri)) {
        const supported = await Linking.canOpenURL(r.pdfUri);
        if (supported) return Linking.openURL(r.pdfUri);
        return Alert.alert("Não foi possível abrir", r.pdfNome || "arquivo.pdf");
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
        dialogTitle: r.pdfNome || "Receita",
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
            {r.dataValidade ? ` · Válida até ${formatarDataBR(r.dataValidade)}` : ""}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MaterialCommunityIcons name="file-pdf-box" size={90} color="#ffd166" />
        <Text style={styles.infoTxt}>{r.pdfNome || "Receita em PDF"}</Text>

        <Pressable
          style={[styles.abrirBtn, expirada && { opacity: 0.45 }]}
          onPress={abrirPdf}
          disabled={expirada}
        >
          <MaterialCommunityIcons name="file-eye-outline" size={20} color="#fff" />
          <Text style={styles.abrirTxt}>{expirada ? "Receita expirada" : "Abrir PDF"}</Text>
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
  header: {
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerRow: { flexDirection: "row", alignItems: "center" },
  backBtn: {
    marginRight: 12,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 8,
    padding: 6,
  },
  headerTitle: { color: "#fff", fontSize: 16, fontWeight: "700", flexShrink: 1 },
  content: { flex: 1, justifyContent: "center", alignItems: "center", paddingHorizontal: 24 },
  infoTxt: { color: "#eaf1ff", fontSize: 16, marginTop: 8, textAlign: "center" },
  abrirBtn: {
    marginTop: 30,
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
    marginTop: 20,
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
