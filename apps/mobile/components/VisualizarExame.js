import React from "react";
import { View, Text, Pressable, StyleSheet, Alert, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";

export default function VisualizarExame({ exame, onVoltar }) {
  if (!exame) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorTxt}>Nenhum exame selecionado.</Text>
        <Pressable style={styles.voltarBtn} onPress={onVoltar}>
          <Text style={styles.voltarTxt}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  const { resultadoPdfUri, resultadoPdfNome, tipo, dataColeta } = exame;

  const abrirPdf = async () => {
    try {
      if (!resultadoPdfUri) {
        return Alert.alert("Sem arquivo", "Nenhum PDF foi anexado a este exame.");
      }

      const info = await FileSystem.getInfoAsync(resultadoPdfUri);
      if (!info.exists) {
        return Alert.alert("Arquivo não encontrado", "O PDF foi removido ou não está mais disponível no dispositivo.");
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        return Alert.alert("Aviso", "Abertura de arquivo não suportada neste dispositivo.");
      }

      await Sharing.shareAsync(resultadoPdfUri, {
        mimeType: "application/pdf",
        dialogTitle: resultadoPdfNome || "Resultado do Exame",
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
            {tipo || "Exame"} {dataColeta ? `- ${dataColeta}` : ""}
          </Text>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <MaterialCommunityIcons name="file-pdf-box" size={90} color="#ffd166" />
        <Text style={styles.infoTxt}>
          {resultadoPdfNome || "Resultado em PDF disponível"}
        </Text>

        <Pressable style={styles.abrirBtn} onPress={abrirPdf}>
          <MaterialCommunityIcons name="file-eye-outline" size={20} color="#fff" />
          <Text style={styles.abrirTxt}>Abrir PDF</Text>
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
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700" },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
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
