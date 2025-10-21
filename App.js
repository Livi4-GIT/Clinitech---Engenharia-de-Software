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
import BuscarExamesCPF from "./apps/mobile/components/BuscarExamesCPF";
import SolicitarExame from "./apps/mobile/components/SolicitarExame"; 

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [medico, setMedico] = useState(null);


  const [examCpf, setExamCpf] = useState(null);
  const [examPaciente, setExamPaciente] = useState(null);

  const handleLoginSuccessUsuario = (u) => {
    setUser(u);
    setMedico(null);
    setScreen("homeUsuario");
    console.log("LOGIN OK. Usuário:", u);
    Alert.alert("Bem-vindo!", `Login realizado, ${u?.nome || "usuário"}.`);
  };

  return (
    <View style={styles.container}>
      {screen === "login" && (
        <LoginUsuario
          onGoCadastro={() => setScreen("cadastro")}
          onGoLoginMedico={() => setScreen("loginMedico")}
          onLoginSuccess={handleLoginSuccessUsuario}
        />
      )}

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

      {screen === "loginMedico" && (
        <LoginMedico
          onGoLoginUsuario={() => setScreen("login")}
          onGoCadastroMedico={() => setScreen("confirmacaoCadastroMedico")}
          onLoginSuccess={(med) => {
            setMedico(med);
            setUser(null);
            setScreen("homeDoutor");
            console.log("Login médico OK", med);
            Alert.alert("Bem-vindo!", "Login médico realizado.");
          }}
        />
      )}

      {screen === "confirmacaoCadastroMedico" && (
        <ConfirmacaoCadastroMedico
          onVoltar={() => setScreen("loginMedico")}
          onConfirmado={() => setScreen("cadastroMedico")}
        />
      )}

      {screen === "cadastroMedico" && (
        <CadastroMedico
          onAfterSave={() => setScreen("loginMedico")}
          onCancelar={() => setScreen("loginMedico")}
          onVoltar={() => setScreen("loginMedico")}
        />
      )}

      {screen === "homeUsuario" && (
        <HomeUsuario
          user={user}
          onLogout={() => {
            setUser(null);
            setScreen("login");
          }}
          onGoBuscarExames={() => setScreen("buscarExames")}
        />
      )}

      {screen === "homeDoutor" && (
        <HomeDoutor
          medico={medico}
          onLogout={() => {
            setMedico(null);
            setScreen("loginMedico");
          }}
          onGoBuscarExames={() => setScreen("buscarExames")}
        />
      )}

      {screen === "buscarExames" && (
        <BuscarExamesCPF
          onVoltar={() => setScreen(user ? "homeUsuario" : medico ? "homeDoutor" : "login")}
          onSolicitarExame={({ cpf, paciente }) => {
            setExamCpf(cpf);
            setExamPaciente(paciente);
            setScreen("solicitarExame");
          }}
        />
      )}

      {screen === "solicitarExame" && (
        <SolicitarExame
          initialCpf={examCpf}
          paciente={examPaciente}
          onVoltar={() => setScreen("buscarExames")}
          onSaved={() => {
            
            setScreen("buscarExames");
          }}
        />
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
