import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function EditarPerfilUsuario({ user, onVoltar }) {
  const [celular, setCelular] = useState(user?.celular || "");
  const [cep, setCep] = useState(user?.cep || "");
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const somenteDigitos = (v) => (v || "").replace(/\D+/g, "");

  const formatarCelular = (v) => {
    const d = somenteDigitos(v).slice(0, 11);
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7, 11)}`;
  };

  const formatarCEP = (v) => {
    const d = somenteDigitos(v).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  const handleSalvar = async () => {
    if (!senhaAtual) return Alert.alert("Erro", "Informe a senha atual.");
    if (senhaAtual !== user.senha)
      return Alert.alert("Erro", "Senha atual incorreta.");

    const telLimpo = somenteDigitos(celular);
    if (telLimpo.length < 10 || telLimpo.length > 11)
      return Alert.alert("Erro", "Telefone inválido. Deve ter 10 ou 11 dígitos.");

    const cepLimpo = somenteDigitos(cep);
    if (cepLimpo.length !== 8)
      return Alert.alert("Erro", "CEP inválido. Deve conter 8 dígitos.");

    if (novaSenha && novaSenha.length < 8)
      return Alert.alert("Erro", "Nova senha deve ter pelo menos 8 caracteres.");

    if (novaSenha && novaSenha !== confirmarSenha)
      return Alert.alert("Erro", "Confirmação de senha não confere.");

    const atualizado = {
      ...user,
      celular: telLimpo,
      cep: cepLimpo,
      senha: novaSenha ? novaSenha : user.senha,
    };

    try {
      await AsyncStorage.setItem(user.cpf, JSON.stringify(atualizado));
      Alert.alert("Sucesso", "Dados atualizados com sucesso!");
      onVoltar();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  return (
    <LinearGradient
      colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Editar Perfil</Text>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="phone" size={22} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Celular"
            placeholderTextColor="#ccc"
            value={celular}
            onChangeText={(v) => setCelular(formatarCelular(v))}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="map-marker" size={22} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="CEP"
            placeholderTextColor="#ccc"
            value={cep}
            onChangeText={(v) => setCep(formatarCEP(v))}
            keyboardType="number-pad"
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock" size={22} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Senha atual"
            placeholderTextColor="#ccc"
            value={senhaAtual}
            onChangeText={setSenhaAtual}
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-plus" size={22} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Nova senha (opcional)"
            placeholderTextColor="#ccc"
            value={novaSenha}
            onChangeText={setNovaSenha}
            secureTextEntry
          />
        </View>

        <View style={styles.inputWrap}>
          <MaterialCommunityIcons name="lock-check" size={22} color="#fff" />
          <TextInput
            style={styles.input}
            placeholder="Confirmar nova senha"
            placeholderTextColor="#ccc"
            value={confirmarSenha}
            onChangeText={setConfirmarSenha}
            secureTextEntry
          />
        </View>

        <Pressable style={styles.saveBtn} onPress={handleSalvar}>
          <Text style={styles.saveTxt}>Salvar alterações</Text>
        </Pressable>

        <Pressable style={styles.cancelBtn} onPress={onVoltar}>
          <Text style={styles.cancelTxt}>Cancelar</Text>
        </Pressable>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  input: {
    flex: 1,
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
  },
  saveBtn: {
    backgroundColor: "#2f6edb",
    padding: 14,
    borderRadius: 12,
    marginTop: 16,
  },
  saveTxt: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  cancelBtn: {
    backgroundColor: "rgba(255,255,255,0.15)",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
  },
  cancelTxt: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "600",
  },
});
