import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";

export default class EditarPerfilPaciente extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      telefone: "",
      endereco: "",
      senhaAtual: "",
      novaSenha: "",
    };
  }

  async componentDidMount() {
    try {
      const cpfLogado = this.props.cpfLogado;
      const data = await AsyncStorage.getItem(cpfLogado);
      if (!data) return Alert.alert("Erro", "Usuário não encontrado.");

      const user = JSON.parse(data);
      this.setState({
        user,
        telefone: user.celular,
        endereco: user.cep,
      });
    } catch (e) {
      Alert.alert("Erro", "Não foi possível carregar os dados.");
    }
  }

  handleSalvar = async () => {
    const { user, telefone, endereco, senhaAtual, novaSenha } = this.state;
    const cpfLogado = this.props.cpfLogado;

    if (!senhaAtual) return Alert.alert("Erro", "Informe a senha atual.");
    if (senhaAtual !== user.senha)
      return Alert.alert("Erro", "Senha atual incorreta.");

    // Validação telefone
    const telefoneLimpo = telefone.replace(/\D/g, "");
    if (telefoneLimpo.length < 10 || telefoneLimpo.length > 11) {
      return Alert.alert("Erro", "Telefone inválido. Deve ter 10 ou 11 dígitos.");
    }

    // Validação CEP
    const cepLimpo = endereco.replace(/\D/g, "");
    if (cepLimpo.length !== 8) {
      return Alert.alert("Erro", "CEP inválido. Deve ter 8 dígitos.");
    }

    const atualizado = {
      ...user,
      celular: telefoneLimpo,
      cep: cepLimpo,
      senha: novaSenha ? novaSenha : user.senha,
    };

    try {
      await AsyncStorage.setItem(cpfLogado, JSON.stringify(atualizado));
      Alert.alert("Sucesso", "Dados atualizados!");
      this.props.onVoltar();
    } catch (e) {
      Alert.alert("Erro", "Não foi possível salvar as alterações.");
    }
  };

  render() {
    const { user, telefone, endereco, senhaAtual, novaSenha } = this.state;
    if (!user)
      return (
        <LinearGradient
          colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Text style={{ color: "#fff" }}>Carregando...</Text>
        </LinearGradient>
      );

    return (
      <LinearGradient
        colors={["#0a1a3f", "#0f2f6d", "#1c4fb8"]}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.titulo}>Editar Perfil</Text>

          <Text style={styles.label}>Telefone</Text>
          <TextInput
            style={styles.input}
            value={telefone}
            onChangeText={(t) => this.setState({ telefone: t })}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>CEP</Text>
          <TextInput
            style={styles.input}
            value={endereco}
            onChangeText={(t) => this.setState({ endereco: t })}
            keyboardType="numeric"
          />

          <Text style={styles.label}>Senha Atual</Text>
          <TextInput
            style={styles.input}
            value={senhaAtual}
            onChangeText={(t) => this.setState({ senhaAtual: t })}
            secureTextEntry
          />

          <Text style={styles.label}>Nova Senha</Text>
          <TextInput
            style={styles.input}
            value={novaSenha}
            onChangeText={(t) => this.setState({ novaSenha: t })}
            placeholder="Deixe em branco para manter a senha"
            secureTextEntry
          />

          <Pressable style={styles.btn} onPress={this.handleSalvar}>
            <Text style={styles.btnText}>Salvar Alterações</Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.btnVoltar]}
            onPress={this.props.onVoltar}
          >
            <Text style={styles.btnText}>Voltar</Text>
          </Pressable>
        </ScrollView>
      </LinearGradient>
    );
  }
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20 },
  titulo: { fontSize: 24, fontWeight: "700", color: "#fff", marginBottom: 20 },
  label: { color: "#b8c7f8", fontSize: 14, marginTop: 12 },
  input: {
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 12,
    padding: 12,
    color: "#fff",
    marginTop: 6,
  },
  btn: {
    marginTop: 24,
    backgroundColor: "#2f6edb",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  btnVoltar: { backgroundColor: "#555" },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
