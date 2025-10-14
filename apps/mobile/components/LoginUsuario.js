import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class LoginUsuario extends React.Component {
  constructor(props) {
    super(props);
    this.state = { cpf: "", senha: "" };
  }

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0,3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6)}`;
    return `${d.slice(0,3)}.${d.slice(3,6)}.${d.slice(6,9)}-${d.slice(9,11)}`;
  };

  entrar = async () => {
    const { cpf, senha } = this.state;
    const cpfN = this.somenteDigitos(cpf);
    if (cpfN.length !== 11) return Alert.alert("CPF inválido", "Digite 11 dígitos.");
    if (!senha) return Alert.alert("Atenção", "Informe a senha.");

    const data = await AsyncStorage.getItem(cpfN);
    if (!data) return Alert.alert("Credenciais inválidas", "CPF não cadastrado.");

    const user = JSON.parse(data);
    if (user.senha !== senha) return Alert.alert("Credenciais inválidas", "Senha incorreta.");

    // sucesso
    this.props.onLoginSuccess?.(user);
  };

  render() {
    const { cpf, senha } = this.state;

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.center}>
            <View style={styles.card}>
              <Text style={styles.title}>Entrar</Text>

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="card-account-details" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="CPF (000.000.000-00)"
                  placeholderTextColor="#b8c7f8"
                  keyboardType="number-pad"
                  value={cpf}
                  onChangeText={(v) => this.setState({ cpf: this.formatarCPF(v) })}
                  maxLength={14}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="lock" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Senha"
                  placeholderTextColor="#b8c7f8"
                  secureTextEntry
                  value={senha}
                  onChangeText={(v) => this.setState({ senha: v })}
                  autoCapitalize="none"
                />
              </View>

              <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                <Pressable onPress={this.entrar} style={styles.btnPress}>
                  <Text style={styles.btnText}>Entrar</Text>
                </Pressable>
              </LinearGradient>

              <Pressable style={{ marginTop: 12 }} onPress={() => this.props.onGoCadastro?.()}>
                <Text style={styles.link}>Criar conta</Text>
              </Pressable>
            </View>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: 20 },
  card: {
    borderRadius: 28,
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
});
