// components/LoginMedico.js
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
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default class LoginMedico extends React.Component {
  constructor(props) {
    super(props);
    this.state = { crm: "", senha: "", loading: false };
  }

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");

  entrar = async () => {
    const { crm, senha } = this.state;
    if (this.state.loading) return;

    const crmN = this.somenteDigitos(crm).trim();
    const senhaT = (senha || "").trim();

    if (crmN.length < 4 || crmN.length > 7) {
      return Alert.alert("CRM inválido", "Informe de 4 a 7 dígitos.");
    }
    if (!senhaT) return Alert.alert("Atenção", "Informe a senha.");

    try {
      this.setState({ loading: true });
      const data = await AsyncStorage.getItem(`MED_${crmN}`);
      if (!data) {
        this.setState({ loading: false });
        return Alert.alert("Credenciais inválidas", "CRM não cadastrado.");
      }
      const medico = JSON.parse(data);
      if (medico.senha !== senhaT) {
        this.setState({ loading: false });
        return Alert.alert("Credenciais inválidas", "Senha incorreta.");
      }

      // sucesso -> devolve o objeto para o App
      this.props.onLoginSuccess?.(medico);
    } catch (e) {
      Alert.alert("Erro", "Não foi possível verificar o login agora.");
      this.setState({ loading: false });
    } finally {
      this.setState({ loading: false });
    }
  };

  render() {
    const { crm, senha, loading } = this.state;

    return (
      <LinearGradient
        colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1 }}>
            <View style={styles.center}>
              {/* Marca */}
              <View
                style={styles.brandWrap}
                accessible
                accessibilityRole="header"
                accessibilityLabel="ClinicTech"
              >
                <Text style={styles.brandName}>
                  <Text style={styles.brandClinic}>Clinic</Text>
                  <Text style={styles.brandTech}>Tech</Text>
                </Text>
              </View>

              <View style={styles.card}>
                <Text style={styles.title}>Login Médico</Text>

                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="stethoscope"
                    size={20}
                    color="#d6e4ff"
                    style={{ marginRight: 8 }}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="CRM (apenas números)"
                    placeholderTextColor="#b8c7f8"
                    keyboardType="number-pad"
                    value={crm}
                    onChangeText={(v) =>
                      this.setState({ crm: this.somenteDigitos(v).slice(0, 7) })
                    }
                    maxLength={7}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="lock"
                    size={20}
                    color="#d6e4ff"
                    style={{ marginRight: 8 }}
                  />
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

                <LinearGradient
                  colors={["#2f6edb", "#1f4fb6"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.btn}
                >
                  <Pressable
                    onPress={this.entrar}
                    style={styles.btnPress}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.btnText}>Entrar</Text>
                    )}
                  </Pressable>
                </LinearGradient>

                {/* link abaixo do Entrar */}
                <Pressable
                  style={{ marginTop: 12 }}
                  onPress={() => this.props.onGoCadastroMedico?.()}
                >
                  <Text style={styles.link}>Cadastrar médico</Text>
                </Pressable>
              </View>
            </View>

            {/* Botão circular inferior: voltar para LoginUsuario */}
            <Pressable
              onPress={() => this.props.onGoLoginUsuario?.()}
              style={styles.fabMedico}
              accessibilityLabel="Voltar para login de usuário"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="account" size={28} color="#fff" />
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

/* estilos iguais ao LoginUsuario */
const ROYAL = "#2f6edb";
const ACCENT = "#00E5FF";
const STRONG = "#0D47A1";

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", padding: 20 },

  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  brandName: { transform: [{ translateY: -2 }] },
  brandClinic: {
    color: "#ffffff",
    fontSize: 60,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 12 },
    textShadowRadius: 10,
  },
  brandTech: {
    color: ACCENT,
    fontSize: 44,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0,0,0,0.65)",
    textShadowOffset: { width: 0, height: 10 },
    textShadowRadius: 10,
  },

  card: {
    borderRadius: 28,
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
    marginBottom: 16,
  },

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

  fabMedico: {
    position: "absolute",
    bottom: 26,
    alignSelf: "center",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: STRONG,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#ffffffa9",
    shadowOpacity: 0.8,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 1 },
    elevation: 10,
    borderWidth: 2,
    borderColor: "#fff",
  },
});
