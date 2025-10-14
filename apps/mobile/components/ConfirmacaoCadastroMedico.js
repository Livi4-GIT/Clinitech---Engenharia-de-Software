import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const CADASTRO_TOKEN = "teste0000";

export default class ConfirmacaoCadastroMedico extends React.Component {
  constructor(props) {
    super(props);
    this.state = { token: "" };
  }

  confirmar = () => {
    const { token } = this.state;
    if (token === CADASTRO_TOKEN) {
      Alert.alert("Acesso liberado", "Senha de cadastro válida.");
      this.props.onConfirmado?.(); // você decide a próxima tela no App.js
    } else {
      Alert.alert("Senha inválida", "Verifique a senha de cadastro.");
    }
  };

  render() {
    const { token } = this.state;

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={styles.center}>
            <Text style={styles.title}>Confirmação de Cadastro Médico</Text>

            <View style={styles.card}>
              <Text style={styles.label}>Senha para cadastro</Text>
              <TextInput
                style={styles.input}
                placeholder="Digite a senha de cadastro"
                placeholderTextColor="#b8c7f8"
                secureTextEntry
                value={token}
                onChangeText={(v) => this.setState({ token: v })}
                autoCapitalize="none"
              />

              <Pressable style={styles.btn} onPress={this.confirmar}>
                <Text style={styles.btnText}>Confirmar</Text>
              </Pressable>

              <Pressable style={{ marginTop: 12 }} onPress={() => this.props.onVoltar?.()}>
                <Text style={styles.link}>Voltar</Text>
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
  title: {
    color: "#eaf1ff",
    fontSize: 20,
    fontWeight: "800",
    textAlign: "center",
    marginBottom: 16,
    textShadowColor: "rgba(0,0,0,0.55)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 6,
  },
  card: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  label: { color: "#eaf1ff", marginBottom: 8, fontWeight: "700" },
  input: {
    height: 44,
    color: "#eaf1ff",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(214,228,255,0.4)",
    marginBottom: 14,
  },
  btn: {
    backgroundColor: "#2f6edb",
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  link: { color: "#cdd9ff", textAlign: "center", fontWeight: "600" },
});
