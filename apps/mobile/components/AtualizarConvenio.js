import React from "react";
import {
  View, Text, TextInput, Pressable, Alert, StyleSheet,
  ScrollView, KeyboardAvoidingView, Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";

const STORAGE_KEY = "@clinitech_convenio";
const BANDEIRAS = ["Unimed", "Amil", "SulAmérica", "Bradesco", "Hapvida", "Allianz Saúde", "Outra"];

export default class AtualizarConvenio extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bandeira: BANDEIRAS[0],
      bandeiraOutra: "",
      numero: "",
      nome: "",
      carregando: false,
    };
  }

  async componentDidMount() {
    await this.prefill();
  }

  prefill = async () => {
    try {
      this.setState({ carregando: true });
      const raw = await AsyncStorage.getItem(STORAGE_KEY);
      const convenio = raw ? JSON.parse(raw) : null;

      if (!convenio) {
        this.setState({ carregando: false });
        return Alert.alert("Atenção", "Nenhum convênio cadastrado.");
      }

      // Se a bandeira atual não estiver na lista, trata como "Outra"
      const isKnown = BANDEIRAS.includes(convenio.bandeira);
      this.setState({
        bandeira: isKnown ? convenio.bandeira : "Outra",
        bandeiraOutra: isKnown ? "" : convenio.bandeira,
        numero: convenio.numero || "",
        nome: convenio.nome || "",
        carregando: false,
      });
    } catch {
      this.setState({ carregando: false });
      Alert.alert("Erro", "Não foi possível carregar o convênio.");
    }
  };

  salvar = async () => {
    try {
      const { bandeira, bandeiraOutra, numero, nome } = this.state;
      const bandeiraValue = (bandeira === "Outra" ? bandeiraOutra : bandeira).trim();
      const num = (numero || "").replace(/\D+/g, "");
      const nm = (nome || "").trim();

      if (!bandeiraValue || !num || !nm) {
        return Alert.alert("Atenção", "Preencha todos os campos.");
      }
      if (!/^\d{4,}$/.test(num)) {
        return Alert.alert("Atenção", "Número do convênio deve ter pelo menos 4 dígitos.");
      }

      const payload = { bandeira: bandeiraValue, numero: num, nome: nm };
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      Alert.alert("Sucesso", "Convênio atualizado!", [
        { text: "OK", onPress: () => this.props?.onSaved?.() },
      ]);
    } catch {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  render() {
    const { bandeira, bandeiraOutra, numero, nome } = this.state;
    const isIOS = Platform.OS === "ios";

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Atualizar Convênio</Text>

              <Text style={styles.fieldLabel}>Bandeira do convênio</Text>

              {!isIOS && (
                <View style={styles.selectWrap}>
                  <MaterialCommunityIcons name="credit-card-outline" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                  <Picker
                    selectedValue={bandeira}
                    onValueChange={(v) => this.setState({ bandeira: v })}
                    style={styles.androidPicker}
                    dropdownIconColor="#d6e4ff"
                    mode="dropdown"
                  >
                    {BANDEIRAS.map((opt) => (
                      <Picker.Item key={opt} label={opt} value={opt} style={styles.pickerItemSmall} />
                    ))}
                  </Picker>
                </View>
              )}

              {isIOS && (
                <View style={styles.iosPickerWrap}>
                  <Picker selectedValue={bandeira} onValueChange={(v) => this.setState({ bandeira: v })} itemStyle={styles.iosPickerItem}>
                    {BANDEIRAS.map((opt) => (
                      <Picker.Item key={opt} label={opt} value={opt} />
                    ))}
                  </Picker>
                </View>
              )}

              {bandeira === "Outra" && (
                <View style={{ marginTop: 8 }}>
                  <Text style={styles.fieldLabel}>Outra (especificar)</Text>
                  <View style={styles.inputWrap}>
                    <MaterialCommunityIcons name="pencil" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                    <TextInput
                      style={styles.input}
                      placeholder="Ex.: Plano X"
                      placeholderTextColor="#b8c7f8"
                      value={bandeiraOutra}
                      onChangeText={(v) => this.setState({ bandeiraOutra: v })}
                    />
                  </View>
                </View>
              )}

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Número do convênio</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="numeric" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Somente números"
                    placeholderTextColor="#b8c7f8"
                    keyboardType="number-pad"
                    value={numero}
                    onChangeText={(v) => this.setState({ numero: v.replace(/\D+/g, "") })}
                    maxLength={20}
                  />
                </View>
              </View>

              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Nome completo do titular</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="account" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="Nome"
                    placeholderTextColor="#b8c7f8"
                    value={nome}
                    onChangeText={(v) => this.setState({ nome: v })}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <LinearGradient colors={["#2f6edb", "#1f4fb6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.btn, { marginTop: 16 }]}>
                <Pressable onPress={this.salvar} style={styles.btnPress} accessibilityRole="button">
                  <Text style={styles.btnText}>Salvar alterações</Text>
                </Pressable>
              </LinearGradient>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, padding: 20, paddingTop: 28 },
  card: {
    borderRadius: 28, padding: 22, marginTop: 70,
    backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  title: { color: "#eaf1ff", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },

  fieldLabel: { color: "#cdd9ff", fontWeight: "700" },

  inputWrap: {
    flexDirection: "row", alignItems: "center", marginTop: 8,
    borderBottomWidth: 1, borderBottomColor: "rgba(214,228,255,0.4)", paddingBottom: 4,
  },
  input: { flex: 1, minHeight: 40, color: "#eaf1ff" },

  selectWrap: {
    flexDirection: "row", alignItems: "center", marginTop: 8,
    borderBottomWidth: 1, borderBottomColor: "rgba(214,228,255,0.4)", paddingBottom: 4,
  },
  androidPicker: { flex: 1, color: "#eaf1ff", height: 40, fontSize: 13 },
  pickerItemSmall: { color: "#eaf1ff", fontSize: 13 },
  iosPickerWrap: {
    marginTop: 8, borderWidth: 1, borderColor: "rgba(214,228,255,0.3)",
    borderRadius: 12, backgroundColor: "rgba(255,255,255,0.05)", overflow: "hidden",
  },
  iosPickerItem: { color: "#eaf1ff", height: 180, fontSize: 14 },

  btn: { marginTop: 12, borderRadius: 14, overflow: "hidden" },
  btnPress: { paddingVertical: 14, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
