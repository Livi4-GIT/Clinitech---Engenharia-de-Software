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
import { Picker } from "@react-native-picker/picker";

const EXAM_TYPES = [
  "Hemograma","Glicemia de Jejum","Hemoglobina Glicada (HbA1c)","Colesterol Total","Lipidograma",
  "TSH","T4 Livre","Vitamina D","Creatinina","Ureia","Urina Tipo I (EAS)","Coprocultura",
  "PCR COVID","Sorologia Dengue","Sorologia Zika","Raio-X Tórax","Ultrassonografia",
  "Eletrocardiograma (ECG)","Tomografia","Ressonância Magnética",
];

export default class SolicitarExame extends React.Component {
  constructor(props) {
    super(props);
    this.state = { tipo: "", tipoOutro: "", dataExame: "", observacao: "" };
  }


  somenteDigitos = (v) => (v || "").replace(/\D+/g, "");
  formatarCPF = (v) => {
    const d = this.somenteDigitos(v).slice(0, 11);
    if (d.length <= 3) return d;
    if (d.length <= 6) return `${d.slice(0, 3)}.${d.slice(3)}`;
    if (d.length <= 9) return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    return `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9, 11)}`;
  };
  formatarDataInput = (v) => {
    const d = this.somenteDigitos(v).slice(0, 8);
    if (d.length <= 2) return d;
    if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
    return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4, 8)}`;
  };
  validarDataBR = (v) => {
    const m = /^([0-2]\d|3[01])\/(0\d|1[0-2])\/\d{4}$/.exec(v || "");
    if (!m) return false;
    const [dd, mm, yyyy] = v.split("/").map((x) => parseInt(x, 10));
    const dt = new Date(yyyy, mm - 1, dd);
    return dt.getFullYear() === yyyy && dt.getMonth() === mm - 1 && dt.getDate() === dd;
  };


  salvar = async () => {
    try {
      const { tipo, tipoOutro, dataExame, observacao } = this.state;
      const cpfN = this.somenteDigitos(this.props.initialCpf || "");
      const paciente = this.props.paciente;

      if (!paciente || !cpfN) return Alert.alert("Atenção", "Paciente/CPF inválido.");

      const tipoFinal = (tipo === "Outro" ? tipoOutro : tipo).trim();
      if (!tipoFinal) return Alert.alert("Atenção", "Selecione o tipo de exame.");
      if (!this.validarDataBR(dataExame)) return Alert.alert("Data inválida", "Use o formato DD/MM/AAAA.");

      const obs = (observacao || "").trim();

      const novo = {
        id: String(Date.now()),
        tipo: tipoFinal,
        dataColeta: dataExame.trim(),     
        observacao: obs,                  
        resultado: obs,                 
        status: "Pendente",               
      };

      const key = `EXA_${cpfN}`;
      const atual = await AsyncStorage.getItem(key);
      const arr = atual ? JSON.parse(atual) : [];
      arr.push(novo);
      await AsyncStorage.setItem(key, JSON.stringify(arr));

      Alert.alert("Sucesso", "Solicitação registrada!");
      this.props.onSaved?.({ cpf: cpfN, paciente, exame: novo });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar a solicitação.");
    }
  };


  renderTipoExame() {
    const { tipo, tipoOutro } = this.state;
    const isIOS = Platform.OS === "ios";

    return (
      <>
        <Text style={styles.fieldLabel}>Tipo de exame</Text>

     
        {!isIOS && (
          <View style={styles.selectWrap}>
            <MaterialCommunityIcons name="flask-outline" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
            <Picker
              selectedValue={tipo}
              onValueChange={(v) => this.setState({ tipo: v })}
              style={styles.androidPicker}
              dropdownIconColor="#d6e4ff"
              mode="dropdown"
            >
              <Picker.Item style={styles.pickerItemSmall} label="Selecione..." value="" />
              {EXAM_TYPES.map((opt) => (
                <Picker.Item key={opt} label={opt} value={opt} style={styles.pickerItemSmall} />
              ))}
              <Picker.Item label="Outro" value="Outro" style={styles.pickerItemSmall} />
            </Picker>
          </View>
        )}


        {isIOS && (
          <View style={styles.iosPickerWrap}>
            <Picker
              selectedValue={tipo}
              onValueChange={(v) => this.setState({ tipo: v })}
              itemStyle={styles.iosPickerItem}
            >
              <Picker.Item label="Selecione..." value="" />
              {EXAM_TYPES.map((opt) => (
                <Picker.Item key={opt} label={opt} value={opt} />
              ))}
              <Picker.Item label="Outro" value="Outro" />
            </Picker>
          </View>
        )}

        {tipo === "Outro" && (
          <View style={{ marginTop: 8 }}>
            <Text style={styles.fieldLabel}>Outro (especificar)</Text>
            <View style={styles.inputWrap}>
              <MaterialCommunityIcons name="pencil" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
              <TextInput
                style={styles.input}
                placeholder="Ex.: Vitamina B12"
                placeholderTextColor="#b8c7f8"
                value={tipoOutro}
                onChangeText={(v) => this.setState({ tipoOutro: v })}
              />
            </View>
          </View>
        )}
      </>
    );
  }

  render() {
    const { paciente } = this.props;
    const { tipo, tipoOutro, dataExame, observacao } = this.state;

    const canSave =
      !!paciente &&
      ((tipo === "Outro" && !!tipoOutro.trim()) || (tipo && tipo !== "Outro")) &&
      this.validarDataBR(dataExame);

    return (
      <LinearGradient colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1 }}>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          {this.props.onVoltar && (
            <View style={styles.topRight}>
              <Pressable onPress={this.props.onVoltar} style={styles.topRightBtn} accessibilityRole="button">
                <Text style={styles.topRightTxt}>Voltar</Text>
              </Pressable>
            </View>
          )}

          <ScrollView contentContainerStyle={styles.center} keyboardShouldPersistTaps="handled">
            <View style={styles.card}>
              <Text style={styles.title}>Solicitar Exame</Text>

            
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Paciente</Text>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="account" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.infoTxt}>{paciente?.nome || "—"}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="card-account-details" size={18} color="#eaf1ff" style={{ marginRight: 8 }} />
                  <Text style={styles.infoTxt}>CPF: {this.formatarCPF(this.props.initialCpf || "")}</Text>
                </View>
              </View>

            
              <View style={{ marginTop: 12 }}>{this.renderTipoExame()}</View>

          
              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Dia do exame (DD/MM/AAAA)</Text>
                <View style={styles.inputWrap}>
                  <MaterialCommunityIcons name="calendar" size={20} color="#d6e4ff" style={{ marginRight: 8 }} />
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#b8c7f8"
                    keyboardType="number-pad"
                    value={dataExame}
                    maxLength={10}
                    onChangeText={(v) => this.setState({ dataExame: this.formatarDataInput(v) })}
                  />
                </View>
              </View>

             
              <View style={{ marginTop: 12 }}>
                <Text style={styles.fieldLabel}>Observação (opcional)</Text>
                <View style={[styles.inputWrap, { alignItems: "flex-start" }]}>
                  <MaterialCommunityIcons name="note-text-outline" size={20} color="#d6e4ff" style={{ marginRight: 8, marginTop: 8 }} />
                  <TextInput
                    style={[styles.input, { height: 100, textAlignVertical: "top" }]}
                    placeholder="Observações, laudo, etc."
                    placeholderTextColor="#b8c7f8"
                    value={observacao}
                    onChangeText={(v) => this.setState({ observacao: v })}
                    multiline
                  />
                </View>
              </View>
            </View>

            
            <LinearGradient
              colors={["#2f6edb", "#1f4fb6"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.btn, { marginTop: 16 }]}
            >
              <Pressable
                onPress={this.salvar}
                disabled={!canSave}
                style={[styles.btnPress, !canSave && { opacity: 0.5 }]}
                accessibilityRole="button"
                accessibilityLabel="Salvar solicitação"
              >
                <Text style={styles.btnText}>Salvar solicitação</Text>
              </Pressable>
            </LinearGradient>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  center: { flexGrow: 1, padding: 20, paddingTop: 28 },
  topRight: { position: "absolute", top: 50, right: 20, zIndex: 10 },
  topRightBtn: {
    flexDirection: "row", alignItems: "center", backgroundColor: "rgba(47,110,219,0.95)",
    paddingVertical: 8, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.25)",
  },
  topRightTxt: { color: "#fff", fontWeight: "800", marginLeft: 8 },
  card: {
    borderRadius: 28, padding: 22, marginBottom: 16, marginTop: 70,
    backgroundColor: "rgba(255,255,255,0.10)", borderWidth: 1, borderColor: "rgba(255,255,255,0.18)",
  },
  title: { color: "#eaf1ff", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 16 },
  section: { marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: "rgba(214,228,255,0.18)" },
  sectionTitle: { color: "#eaf1ff", fontSize: 18, fontWeight: "700", marginBottom: 8 },
  infoRow: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  infoTxt: { color: "#eaf1ff", fontSize: 14 },

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
