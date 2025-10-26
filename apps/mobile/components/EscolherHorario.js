import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

// Horários fixos
const HORARIOS = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00"];

export default function EscolherHorario({ onVoltar, consulta, onVoltarParaInserirConsulta, onConsultaConfirmada }) {
  const objConsulta = consulta || {};
  const { especialidade, localidade, medicoFiltrar, listaMedicos } = objConsulta;

  const [diaSelecionado, setDiaSelecionado] = useState(null);
  const [horarioSelecionado, setHorarioSelecionado] = useState(null);

  const hoje = new Date();
  const [mesAtual, setMesAtual] = useState(hoje.getMonth());
  const [anoAtual, setAnoAtual] = useState(hoje.getFullYear());

  const gerarDiasDoMes = (mes, ano) => {
    const numDias = new Date(ano, mes + 1, 0).getDate();
    return Array.from({ length: numDias }, (_, i) => i + 1);
  };
  const diasDoMes = gerarDiasDoMes(mesAtual, anoAtual);

  const confirmarConsulta = () => {
  if (!diaSelecionado || !horarioSelecionado) return;

  const medicoEscolhido =
    medicoFiltrar && medicoFiltrar !== "Todos"
      ? medicoFiltrar
      : (listaMedicos || []).filter(m => m !== "Todos")[Math.floor(Math.random() * ((listaMedicos || []).length - 1))];

  const novaConsulta = {
    especialidade,
    localidade,
    medico: medicoEscolhido,
    dia: diaSelecionado,
    mes: mesAtual + 1,
    ano: anoAtual,
    horario: horarioSelecionado,
  };

  const mensagem = `Sua consulta em ${especialidade} foi agendada com sucesso para ${diaSelecionado}/${mesAtual + 1}/${anoAtual} às ${horarioSelecionado}, com ${medicoEscolhido}.
Comparecer com 15 minutos de antecedência no ${localidade}.`;

  // Ambiente Web
  if (typeof window !== "undefined") {
    window.alert(mensagem);
    onConsultaConfirmada?.(novaConsulta); // <-- Salva a consulta
    onVoltarParaInserirConsulta?.(); // volta ao menu principal ou para outra tela
  } else {
    // Ambiente mobile
    Alert.alert("Consulta agendada!", mensagem, [
      {
        text: "OK",
        onPress: () => {
          onConsultaConfirmada?.(novaConsulta);
          onVoltarParaInserirConsulta?.();
        },
      },
    ]);
  }
};



  const irMesAnterior = () => {
    if (mesAtual === 0) {
      setMesAtual(11);
      setAnoAtual(prev => prev - 1);
    } else {
      setMesAtual(prev => prev - 1);
    }
    setDiaSelecionado(null);
    setHorarioSelecionado(null);
  };

  const irMesSeguinte = () => {
    if (mesAtual === 11) {
      setMesAtual(0);
      setAnoAtual(prev => prev + 1);
    } else {
      setMesAtual(prev => prev + 1);
    }
    setDiaSelecionado(null);
    setHorarioSelecionado(null);
  };

  const meses = ["Janeiro","Fevereiro","Março","Abril","Maio","Junho","Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"];

  return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.headerBar}>
          <TouchableOpacity onPress={onVoltar} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Escolher Dia e Horário</Text>
          <View style={{ width: 34 }} />
        </View>

        <ScrollView contentContainerStyle={styles.container}>
          {/* Cabeçalho do mês */}
          <View style={styles.mesNav}>
            <TouchableOpacity onPress={irMesAnterior}><Text style={styles.mesNavTxt}>{"<"}</Text></TouchableOpacity>
            <Text style={styles.mesAtualTxt}>{meses[mesAtual]} {anoAtual}</Text>
            <TouchableOpacity onPress={irMesSeguinte}><Text style={styles.mesNavTxt}>{">"}</Text></TouchableOpacity>
          </View>

          {/* Dias */}
          <View style={styles.diasContainer}>
            {diasDoMes.map(dia => (
              <TouchableOpacity
                key={dia}
                style={[styles.diaBtn, diaSelecionado === dia && styles.diaBtnSelecionado]}
                onPress={() => {
                  setDiaSelecionado(dia);
                  setHorarioSelecionado(null);
                }}
              >
                <Text style={[styles.diaText, diaSelecionado === dia && styles.diaTextSelecionado]}>{dia}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Horários */}
          {diaSelecionado && (
            <>
              <Text style={styles.sectionTitle}>Horários disponíveis</Text>
              <View style={styles.horariosContainer}>
                {HORARIOS.map(h => (
                  <TouchableOpacity
                    key={h}
                    style={[styles.horarioBtn, horarioSelecionado === h && styles.horarioBtnSelecionado]}
                    onPress={() => setHorarioSelecionado(h)}
                  >
                    <Text style={[styles.horarioText, horarioSelecionado === h && styles.horarioTextSelecionado]}>{h}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}

          {diaSelecionado && horarioSelecionado && (
            <TouchableOpacity style={styles.confirmarBtn} onPress={confirmarConsulta}>
              <Text style={styles.confirmarText}>Confirmar Consulta</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerBar: { paddingHorizontal: 16, paddingVertical: 10, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(255,255,255,0.12)", borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" },
  headerTitle: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  container: { padding: 20, gap: 16 },

  mesNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  mesNavTxt: { color: "#eaf1ff", fontSize: 20, fontWeight: "700" },
  mesAtualTxt: { color: "#eaf1ff", fontSize: 16, fontWeight: "700" },

  diasContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 },

  diaBtn: { width: 50, height: 50, borderRadius: 25, marginBottom: 10, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  diaBtnSelecionado: { backgroundColor: "#3E1B83" },
  diaText: { color: "#eaf1ff", fontWeight: "600" },
  diaTextSelecionado: { color: "#fff" },

  sectionTitle: { color: "#eaf1ff", fontWeight: "700", fontSize: 16, marginBottom: 8 },

  horariosContainer: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 8 },
  horarioBtn: { backgroundColor: "rgba(255,255,255,0.2)", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
  horarioBtnSelecionado: { backgroundColor: "#3E1B83" },
  horarioText: { color: "#eaf1ff", fontWeight: "600" },
  horarioTextSelecionado: { color: "#fff" },

  confirmarBtn: { backgroundColor: "#3E1B83", paddingVertical: 14, borderRadius: 10, alignItems: "center", marginTop: 20 },
  confirmarText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
