import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class PerfilMedico extends React.Component {
  constructor(props) {
    super(props);
    this.state = { medico: null };
  }

  async componentDidMount() {
    try {
      const { medico } = this.props;
      const chave = `MED_${medico.crm}`;
      const data = await AsyncStorage.getItem(chave);
      if (!data) return Alert.alert("Erro", "Médico não encontrado.");

      this.setState({ medico: JSON.parse(data) });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados do médico.");
    }
  }

  renderItem = (icon, label, value) => (
    <View style={styles.item}>
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color="#d6e4ff"
        style={{ width: 30 }}
      />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "-"}</Text>
      </View>
    </View>
  );

  render() {
    const { medico } = this.state;
    const { onGoEditar, onVoltarHome } = this.props;

    if (!medico)
      return (
        <LinearGradient
          colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#fff" }}>Carregando...</Text>
        </LinearGradient>
      );

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="stethoscope" size={90} color="#fff" />
              <Text style={styles.nome}>{medico.nome}</Text>
            </View>

            {this.renderItem("card-account-details", "CRM", medico.crm)}
            {this.renderItem("calendar", "Nascimento", medico.nascimento)}
            {this.renderItem("phone", "Telefone", medico.telefone)}
            {this.renderItem("map-marker", "CEP", medico.cep)}

            <LinearGradient colors={["#2f6edb", "#1f4fb6"]} style={styles.btn}>
              <Pressable
                onPress={() => onGoEditar?.(medico.crm)}
                style={styles.btnPress}
              >
                <Text style={styles.btnText}>Editar Dados</Text>
              </Pressable>
            </LinearGradient>

            {/* 🔙 Botão de voltar para home */}
            <Pressable
              style={[styles.btnPress, { marginTop: 15, borderWidth: 1, borderColor: "#fff", borderRadius: 10 }]}
              onPress={onVoltarHome}
            >
              <Text style={[styles.btnText, { fontSize: 15 }]}>Voltar para Home</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  header: { alignItems: "center", marginBottom: 20 },
  nome: { color: "#fff", fontSize: 22, fontWeight: "700", marginTop: 8 },
  item: {
    flexDirection: "row",
    alignItems: "center",
    borderBottomColor: "rgba(255,255,255,0.2)",
    borderBottomWidth: 1,
    paddingVertical: 8,
  },
  label: { color: "#b8c7f8", fontSize: 14 },
  value: { color: "#fff", fontSize: 16, fontWeight: "600" },
  btn: { marginTop: 20, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
