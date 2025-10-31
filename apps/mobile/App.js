import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import LoginUsuario from "./components/LoginUsuario";
import CadastroUsuario from "./components/CadastroUsuario";
import LoginMedico from "./components/LoginMedico";
import ConfirmacaoCadastroMedico from "./components/ConfirmacaoCadastroMedico";
import CadastroMedico from "./components/CadastroMedico";

import HomeUsuario from "./components/HomeUsuario";
import HomeDoutor from "./components/HomeDoutor";
import PerfilPaciente from "./components/PerfilPaciente";
import EditarPerfilPaciente from "./components/EditarPerfilPaciente";

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [medico, setMedico] = useState(null);
  const [cpfLogado, setCpfLogado] = useState(null);

  const handleLoginSuccessUsuario = (u) => {
    setUser(u);
    setCpfLogado(u.cpf);
    setScreen("homeUsuario");
    console.log("LOGIN OK. Usuário:", u);
    Alert.alert("Bem-vindo!", `Login realizado, ${u?.nome || "usuário"}.`);
  };

  return (
    <View style={styles.container}>
      {/* Login Usuário */}
      {screen === "login" && (
        <LoginUsuario
          onGoCadastro={() => setScreen("cadastro")}
          onGoLoginMedico={() => setScreen("loginMedico")}
          onLoginSuccess={handleLoginSuccessUsuario}
        />
      )}

      {/* Cadastro Usuário */}
      {screen === "cadastro" && (
        <>
          <CadastroUsuario onAfterSave={() => setScreen("login")} />
          <View style={styles.overlayTop}>
            <Pressable style={styles.backBtn} onPress={() => setScreen("login")}>
              <Text style={styles.backTxt}>Já tenho conta</Text>
            </Pressable>
          </View>
        </>
      )}

      {/* Login Médico */}
      {screen === "loginMedico" && (
        <LoginMedico
          onGoLoginUsuario={() => setScreen("login")}
          onGoCadastroMedico={() => setScreen("confirmacaoCadastroMedico")}
          onLoginSuccess={(med) => {
            setMedico(med);
            setScreen("homeDoutor");
            console.log("Login médico OK", med);
            Alert.alert("Bem-vindo!", "Login médico realizado.");
          }}
        />
      )}

      {/* Confirmação Cadastro Médico */}
      {screen === "confirmacaoCadastroMedico" && (
        <ConfirmacaoCadastroMedico
          onVoltar={() => setScreen("loginMedico")}
          onConfirmado={() => setScreen("cadastroMedico")}
        />
      )}

      {/* Cadastro Médico */}
      {screen === "cadastroMedico" && (
        <CadastroMedico
          onAfterSave={() => setScreen("loginMedico")}
          onCancelar={() => setScreen("loginMedico")}
        />
      )}

      {/* Home Usuário */}
      {screen === "homeUsuario" && (
        <HomeUsuario
          user={user}
          onLogout={() => setScreen("login")}
          onVerPerfil={() => setScreen("perfilPaciente")}
        />
      )}

      {/* Perfil Usuário */}
      {screen === "perfilPaciente" && (
        <PerfilPaciente
          cpfLogado={cpfLogado}
          onVoltar={() => setScreen("homeUsuario")}
          onGoEditar={() => setScreen("editarPerfilPaciente")}
        />
      )}

      {/* Edição Perfil Usuário */}
      {screen === "editarPerfilPaciente" && (
        <EditarPerfilPaciente
          cpfLogado={cpfLogado}
          onVoltar={() => setScreen("perfilPaciente")}
        />
      )}

      {/* Home Médico */}
      {screen === "homeDoutor" && (
        <HomeDoutor medico={medico} onLogout={() => setScreen("loginMedico")} />
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlayTop: { position: "absolute", top: 50, right: 20 },
  backBtn: {
    backgroundColor: "rgba(47,110,219,0.9)",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  backTxt: { color: "#fff", fontWeight: "700" },
});
