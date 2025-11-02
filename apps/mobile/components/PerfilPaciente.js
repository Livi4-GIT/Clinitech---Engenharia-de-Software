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

export default class PerfilUsuario extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user: null };
  }

  async componentDidMount() {
    try {
      const cpfLogado = this.props.cpfLogado;
      const data = await AsyncStorage.getItem(cpfLogado);
      if (!data) return Alert.alert("Erro", "Usuário não encontrado.");

      this.setState({ user: JSON.parse(data) });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  }

  renderItem = (icon, label, value) => (
    <View style={styles.item}>
      <MaterialCommunityIcons name={icon} size={22} color="#d6e4ff" style={{ width: 30 }} />
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || "-"}</Text>
      </View>
    </View>
  );

  render() {
    const { user } = this.state;
    if (!user)
      return (
        <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#fff" }}>Carregando...</Text>
        </LinearGradient>
      );

    return (
    <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} style={{ flex: 1 }}>
    <Pressable style={styles.backBtn} onPress={this.props.onVoltar}>
    <MaterialCommunityIcons name="arrow-left" size={26} color="#fff" />
    <Text style={styles.backText}>Voltar</Text>
    </Pressable>

    <ScrollView contentContainerStyle={styles.container}>

          <View style={styles.card}>
            <View style={styles.header}>
              <MaterialCommunityIcons name="account-circle" size={90} color="#fff" />
              <Text style={styles.nome}>{user.nome}</Text>
            </View>

            {this.renderItem("card-account-details", "CPF", user.cpf)}
            {this.renderItem("calendar", "Nascimento", user.nascimento)}
            {this.renderItem("gender-male-female", "Gênero", user.genero)}
            {this.renderItem("phone", "Celular", user.celular)}
            {this.renderItem("map-marker", "CEP", user.cep)}

            <LinearGradient colors={["#2f6edb", "#1f4fb6"]} style={styles.btn}>
              <Pressable
                onPress={() => this.props.onGoEditar?.(user.cpf)}
                style={styles.btnPress}
              >
                <Text style={styles.btnText}>Editar Dados</Text>
              </Pressable>
            </LinearGradient>
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

  backBtn: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 12,
  marginTop: 40,
},
backText: {
  color: "#fff",
  fontSize: 16,
  marginLeft: 8,
  fontWeight: "600",
},

});
