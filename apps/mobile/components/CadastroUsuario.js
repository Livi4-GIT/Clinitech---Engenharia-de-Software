import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const GENDER_OPTIONS = ["Feminino", "Masculino", "Outro"];

export default class CadastroUsuario extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nome: "",
      cpf: "",
      nascimento: "",
      genero: "",
      celular: "",
      cep: "",
      senha: "",
      confirmarSenha: "",
    };
  }

  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  senhaForte = (v) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/.test(v || "");
  validarDataBR = (v) => {
    const m = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.exec(v || "");
    if (!m) return false;
    const [dd, mm, yyyy] = v.split("/").map((x) => parseInt(x, 10));
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
  };

  formatarDataInput = (v) => {
    const d = this.somenteDigitos(v).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  };

  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };

  formatarCelular = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11); // DDD + 8 ou 9 dígitos
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`; // 8 dígitos no número
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`; // 9 dígitos no número
  };

  gravar = async () => {
    try {
      const { nome, cpf, nascimento, genero, celular, cep, senha, confirmarSenha } = this.state;
      const cpfN = this.somenteDigitos(cpf);
      const celN = this.somenteDigitos(celular);
      const cepN = this.somenteDigitos(cep);

      if (!nome.trim() || !cpfN || !nascimento.trim() || !genero.trim() || !celN || !cepN || !senha || !confirmarSenha) {
        Alert.alert("Atenção", "Preencha todos os campos.");
        return;
      }
      if (cpfN.length !== 11) return Alert.alert("CPF inválido", "11 dígitos.");
      if (!this.validarDataBR(nascimento)) return Alert.alert("Data inválida", "Use DD/MM/AAAA.");
      if (celN.length < 10 || celN.length > 11) return Alert.alert("Celular inválido", "Use DDD + número.");
      if (cepN.length !== 8) return Alert.alert("CEP inválido", "8 dígitos.");
      if (!this.senhaForte(senha)) return Alert.alert("Senha fraca", "Mín. 8, com 1 maiúscula, 1 minúscula e 1 número.");
      if (senha !== confirmarSenha) return Alert.alert("Senhas diferentes", "Confirmação não confere.");

      const existe = await AsyncStorage.getItem(cpfN);
      if (existe) return Alert.alert("CPF já cadastrado", "Tente outro.");

      const registro = {
        nome: nome.trim(),
        cpf: cpfN,
        nascimento: nascimento.trim(),
        genero: genero.trim(),
        celular: celN,
        cep: cepN,
        senha,
        criadoEm: new Date().toISOString(),
      };

      await AsyncStorage.setItem(cpfN, JSON.stringify(registro));
      Alert.alert("Sucesso", "Cadastro salvo!");
      this.setState({
        nome: "",
        cpf: "",
        nascimento: "",
        genero: "",
        celular: "",
        cep: "",
        senha: "",
        confirmarSenha: "",
      });
    } catch (e) {
      console.log(e);
      Alert.alert("Erro", "Não foi possível salvar.");
    }
  };

  Input = ({ icon, placeholder, secure, keyboardType, value, onChangeText, maxLength }) => (
    <View style={styles.inputWrap}>
      <MaterialCommunityIcons name={icon} size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
      <TextInput
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#b8c7f8"
        secureTextEntry={secure}
        keyboardType={keyboardType}
        value={value}
        onChangeText={onChangeText}
        maxLength={maxLength}
        autoCapitalize="none"
      />
    </View>
  );

  GeneroSelect = () => {
    const { genero } = this.state;
    return (
      <View style={styles.genderSection}>
        <View style={styles.genderHeader}>
          <MaterialCommunityIcons
            name="gender-male-female"
            size={20}
            color="#d6e4ff"
            style={{ marginRight: 8, marginTop: 2 }}
          />
          <Text style={styles.labelGenero}>Gênero</Text>
        </View>

        <View style={styles.chipsWrap}>
          {GENDER_OPTIONS.map((opt) => {
            const active = genero === opt;
            return (
              <Pressable
                key={opt}
                onPress={() => this.setState({ genero: opt })}
                style={[styles.chip, active && styles.chipActive]}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                accessibilityLabel={`Selecionar ${opt}`}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
              </Pressable>
            );
          })}
        </View>
      </View>
    );
  };

  render() {
    const { nome, cpf, nascimento, genero, celular, cep, senha, confirmarSenha } = this.state;

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Cadastro</Text>

              {this.Input({
                icon: "account",
                placeholder: "Nome completo",
                value: nome,
                onChangeText: (v) => this.setState({ nome: v }),
              })}

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
                <MaterialCommunityIcons name="calendar" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Data de nascimento (DD/MM/AAAA)"
                  placeholderTextColor="#b8c7f8"
                  keyboardType="number-pad"
                  value={nascimento}
                  onChangeText={(v) => this.setState({ nascimento: this.formatarDataInput(v) })}
                  maxLength={10}
                  autoCapitalize="none"
                />
              </View>

              {this.GeneroSelect()}

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="phone" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Celular ((00) 00000-0000)"
                  placeholderTextColor="#b8c7f8"
                  keyboardType="number-pad"
                  value={celular}
                  onChangeText={(v) => this.setState({ celular: this.formatarCelular(v) })}
                  maxLength={15}
                  autoCapitalize="none"
                />
              </View>

              {this.Input({
                icon: "map-marker",
                placeholder: "CEP (somente números)",
                keyboardType: "number-pad",
                value: cep,
                onChangeText: (v) => this.setState({ cep: this.somenteDigitos(v) }),
                maxLength: 8,
              })}
              {this.Input({
                icon: "lock",
                placeholder: "Senha forte",
                secure: true,
                value: senha,
                onChangeText: (v) => this.setState({ senha: v }),
              })}
              {this.Input({
                icon: "lock-check",
                placeholder: "Verificar senha",
                secure: true,
                value: confirmarSenha,
                onChangeText: (v) => this.setState({ confirmarSenha: v }),
              })}

              <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                <Pressable onPress={this.gravar} style={styles.btnPress}>
                  <Text style={styles.btnText}>Cadastrar</Text>
                </Pressable>
              </LinearGradient>

              <Text style={styles.note}>Seus dados ficam apenas neste dispositivo (demo).</Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const SP = 16;

const styles = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: "center", padding: 20 },
  card: {
    borderRadius: 28,
    padding: 22,
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  title: {
    color: "#eaf1ff",
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
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

  genderSection: { marginTop: SP, marginBottom: SP },
  genderHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  labelGenero: { color: "#eaf1ff", fontSize: 14, fontWeight: "600" },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    borderWidth: 1,
    borderColor: "rgba(214,228,255,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  chipActive: { backgroundColor: "#2f6edb", borderColor: "#2f6edb" },
  chipText: { color: "#eaf1ff", fontWeight: "600" },
  chipTextActive: { color: "#fff" },

  btn: { marginTop: 16, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
  note: { textAlign: "center", color: "#cdd9ff", fontSize: 12, marginTop: 10 },
});
