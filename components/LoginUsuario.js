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

    this.props.onLoginSuccess?.(user);
  };

  render() {
    const { cpf, senha } = this.state;

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
                <Text style={styles.title}>Entrar</Text>

                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons
                    name="card-account-details"
                    size={20}
                    color="#d6e4ff"
                    style={{ marginRight: 8 }}
                  />
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
                  <Pressable onPress={this.entrar} style={styles.btnPress}>
                    <Text style={styles.btnText}>Entrar</Text>
                  </Pressable>
                </LinearGradient>

                <Pressable
                  style={{ marginTop: 12 }}
                  onPress={() => this.props.onGoCadastro?.()}
                >
                  <Text style={styles.link}>Criar conta</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>

       
        <Pressable
          onPress={() => this.props.onGoLoginMedico?.()}
          style={styles.fabMedico}
          accessibilityLabel="Entrar como médico"
          accessibilityRole="button"
        >
          <MaterialCommunityIcons name="doctor" size={28} color="#fff" />
        </Pressable>
      </LinearGradient>
    );
  }
}

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
    elevation: 12,
    borderWidth: 2,
    borderColor: "#fff",
    zIndex: 999, 
  },
});
