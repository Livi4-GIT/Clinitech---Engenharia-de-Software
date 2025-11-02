import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Alert, SafeAreaView, StatusBar } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function AgendaMedico({ medicoNome, onVoltar }) {
  const [consultas, setConsultas] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const carregarConsultas = async () => {
      setLoading(true);
      try {
        const todas = JSON.parse(await AsyncStorage.getItem("consultas")) || [];
        const filtradas = todas.filter(c => c.medico === medicoNome && c.status === "agendada");
        setConsultas(filtradas);
      } catch (error) {
        console.error("Erro ao carregar consultas:", error);
      } finally {
        setLoading(false);
      }
    };

    carregarConsultas();
  }, [medicoNome]);   

  const cancelarConsulta = async (id) => {
    setLoading(true);
    try {
      const todas = JSON.parse(await AsyncStorage.getItem("consultas")) || [];
      const idx = todas.findIndex(c => c.id === id);
      if (idx >= 0) {
        todas[idx].status = "cancelada";
        todas[idx].notificacoes = [...(todas[idx].notificacoes || []), { tipo: "cancelamento", data: new Date() }];
        await AsyncStorage.setItem("consultas", JSON.stringify(todas));
        setConsultas(todas.filter(c => c.medico === medicoNome && c.status === "agendada"));
        Alert.alert("Consulta cancelada", "O paciente será notificado.");
      }
    } catch (error) {
      console.error("Erro ao cancelar consulta:", error);
      Alert.alert("Erro", "Não foi possível cancelar a consulta.");
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => {
    const dataHora = new Date(item.ano, item.mes - 1, item.dia);
    if (item.horario){
        const [hora, min] = item.horario.split(":");
        dataHora.setHours(parseInt(hora), parseInt(min));
    }
    }
  
  return (
    <LinearGradient
      colors={['#0a1a3f', '#0f2f6d', '#1c4fb8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <StatusBar backgroundColor="#0a1a3f" barStyle="light-content" />

        {/* Botão Voltar */}
        <TouchableOpacity onPress={onVoltar} style={styles.voltarBtn}>
            <Ionicons name="arrow-back" size={22} color="#eaf1ff" />
        </TouchableOpacity>

        <Text style={styles.title}>Consultas de {medicoNome}</Text>

        {consultas.length === 0 && !loading && (
          <Text style={styles.semConsultas}>Nenhuma consulta agendada.</Text>
        )}

        <FlatList
          data={consultas}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          renderItem={({ item }) => {
            const dataHora = new Date(item.ano, item.mes - 1, item.dia);
            if (item.horario) {
                const [hora, min] = item.horario.split(":");
                dataHora.setHours(parseInt(hora), parseInt(min));
            }

            return(
            <LinearGradient
              colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.12)']}
              style={styles.card}
            >
              <Text style={styles.paciente}>Paciente: {item.paciente}</Text>
              <Text style={styles.infoText}>Especialidade: {item.especialidade}</Text>
              <Text style={styles.infoText}>Procedimento: {item.procedimento}</Text>
              <Text style={styles.infoText}>Localidade: {item.localidade}</Text>
              <Text style={styles.infoText}>Data/Hora: {new Date(item.dataHora).toLocaleString()}</Text>

              <TouchableOpacity
                onPress={() => cancelarConsulta(item.id)}
                style={[styles.cancelBtn, loading && { opacity: 0.5 }]}
                disabled={loading}
              >
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </LinearGradient>
          );
          }}
        />
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  voltarBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    margin: 16,
  },
  voltarText: {
    color: '#eaf1ff',
    fontWeight: '700',
    fontSize: 16,
  },
  title: {
    color: '#eaf1ff',
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 16,
  },
  semConsultas: {
    textAlign: 'center',
    color: '#eaf1ff',
    fontStyle: 'italic',
    marginTop: 20,
  },
  card: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  paciente: {
    color: '#eaf1ff',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  infoText: {
    color: '#eaf1ff',
    fontSize: 14,
    marginBottom: 2,
  },
  cancelBtn: {
    marginTop: 12,
    borderRadius: 16,
    overflow: 'hidden',
  },
  cancelText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 12,
    backgroundColor: 'linear-gradient(90deg, #ff6161, #ff3b3b)', 
  },
});
