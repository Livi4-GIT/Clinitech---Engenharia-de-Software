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
const SP = 16;

export default class CadastroMedico extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      nome: "",
      nascimento: "",
      genero: "",
      crm: "",
      cep: "",
      telefone: "",
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
  formatarCelular = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length === 0) return "";
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  };
  formatarCEP = (v) => {
    const d = this.somenteDigitos(v).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  
  handleVoltar = () => {
    const { onVoltar, onVoltarLoginMedico, onCancelar } = this.props;
    if (typeof onVoltar === "function") return onVoltar();
    if (typeof onVoltarLoginMedico === "function") return onVoltarLoginMedico();
    if (typeof onCancelar === "function") return onCancelar();
  };

  gravar = async () => {
    try {
      const { nome, nascimento, genero, crm, cep, telefone, senha, confirmarSenha } = this.state;
      const crmN = this.somenteDigitos(crm);
      const cepN = this.somenteDigitos(cep);
      const telN = this.somenteDigitos(telefone);

      if (
        !nome.trim() ||
        !nascimento.trim() ||
        !genero.trim() ||
        !crmN ||
        !cepN ||
        !telN ||
        !senha ||
        !confirmarSenha
      ) {
        return Alert.alert("Atenção", "Preencha todos os campos.");
      }

      if (!this.validarDataBR(nascimento)) return Alert.alert("Data inválida", "Use DD/MM/AAAA.");
      if (crmN.length < 4 || crmN.length > 7) return Alert.alert("CRM inválido", "Informe de 4 a 7 dígitos.");
      if (cepN.length !== 8) return Alert.alert("CEP inválido", "Informe 8 dígitos.");
      if (telN.length < 10 || telN.length > 11) return Alert.alert("Telefone inválido", "Use DDD + número.");
      if (!this.senhaForte(senha))
        return Alert.alert("Senha fraca", "Mín. 8, com 1 maiúscula, 1 minúscula e 1 número.");
      if (senha !== confirmarSenha) return Alert.alert("Senhas diferentes", "Confirmação não confere.");

      const chave = `MED_${crmN}`;
      const existe = await AsyncStorage.getItem(chave);
      if (existe) return Alert.alert("CRM já cadastrado", "Use outro CRM.");

      const registro = {
        nome: nome.trim(),
        nascimento: nascimento.trim(),
        genero: genero.trim(),
        crm: crmN,
        cep: cepN,
        telefone: telN,
        senha,
        criadoEm: new Date().toISOString(),
      };

      await AsyncStorage.setItem(chave, JSON.stringify(registro));
      
      const listaRaw = await AsyncStorage.getItem("MEDICOS_LISTA");
      const lista = JSON.parse(listaRaw) || []; 
      if (!lista.includes(crmN)) { 
        lista.push(crmN); 
        await AsyncStorage.setItem("MEDICOS_LISTA", JSON.stringify(lista)); }
      
      Alert.alert("Sucesso", "Cadastro de médico salvo!");

      // Limpeza do formulário
      this.setState({
        nome: "",
        nascimento: "",
        genero: "",
        crm: "",
        cep: "",
        telefone: "",
        senha: "",
        confirmarSenha: "",
      });

      // Atualiza a lista de médicos no App.js
      this.props.onMedicoCadastrado?.(registro);
      this.props.onAfterSave?.();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar o cadastro.");
    }
  };


  Input = ({
    icon,
    placeholder,
    secure,
    keyboardType,
    value,
    onChangeText,
    maxLength,
    autoCapitalize = "none",
  }) => (
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
        autoCapitalize={autoCapitalize}
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
                accessibilityRole="button"
                accessibilityLabel={`Selecionar gênero ${opt}`}
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
    const { nome, nascimento, genero, crm, cep, telefone, senha, confirmarSenha } = this.state;

    return (
      <LinearGradient
        colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}
      >
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          {/* Voltar para Login Médico */}
          <View style={styles.topRight}>
            <Pressable
              onPress={this.handleVoltar}
              style={styles.topRightBtn}
              accessibilityRole="button"
              accessibilityLabel="Voltar para Login Médico"
            >
              <Text style={styles.topRightTxt}>Voltar para Login Médico</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Cadastro de Médico</Text>

              {this.Input({
                icon: "account",
                placeholder: "Nome completo",
                value: nome,
                onChangeText: (v) => this.setState({ nome: v }),
                autoCapitalize: "words",
              })}

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

              {this.Input({
                icon: "stethoscope",
                placeholder: "CRM (apenas números)",
                keyboardType: "number-pad",
                value: crm,
                onChangeText: (v) => this.setState({ crm: this.somenteDigitos(v).slice(0, 7) }),
                maxLength: 7,
              })}

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="map-marker" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="CEP (00000-000)"
                  placeholderTextColor="#b8c7f8"
                  keyboardType="number-pad"
                  value={cep}
                  onChangeText={(v) => this.setState({ cep: this.formatarCEP(v) })}
                  maxLength={9}
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.inputWrap}>
                <MaterialCommunityIcons name="phone" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                <TextInput
                  style={styles.input}
                  placeholder="Telefone ((00) 00000-0000)"
                  placeholderTextColor="#b8c7f8"
                  keyboardType="number-pad"
                  value={telefone}
                  onChangeText={(v) => this.setState({ telefone: this.formatarCelular(v) })}
                  maxLength={15}
                  autoCapitalize="none"
                />
              </View>

              {this.Input({
                icon: "lock",
                placeholder: "Senha forte",
                secure: true,
                value: senha,
                onChangeText: (v) => this.setState({ senha: v }),
              })}

              {this.Input({
                icon: "lock-check",
                placeholder: "Confirmar senha",
                secure: true,
                value: confirmarSenha,
                onChangeText: (v) => this.setState({ confirmarSenha: v }),
              })}

              <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.btn}>
                <Pressable onPress={this.gravar} style={styles.btnPress}>
                  <Text style={styles.btnText}>Cadastrar</Text>
                </Pressable>
              </LinearGradient>

              <Pressable style={{ marginTop: 12 }} onPress={() => this.props.onCancelar?.()}>
                <Text style={styles.link}>Cancelar</Text>
              </Pressable>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const ROYAL = "#2f6edb";
const ACCENT = "#00E5FF";
const STRONG = "#0D47A1";

const styles = StyleSheet.create({
  center: { flexGrow: 1, justifyContent: "center", padding: 20 },

  topRight: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
  },
  topRightBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(47,110,219,0.95)",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.25)",
  },
  topRightTxt: { color: "#fff", fontWeight: "800", marginLeft: 8 },

  brandWrap: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },

  card: {
    borderRadius: 28,
    marginTop: 60,
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

  btn: { marginTop: 12, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  link: { color: "#cdd9ff", textAlign: "center", fontWeight: "600" },
});
