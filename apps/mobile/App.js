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
import ChatMedico from "./components/ChatMedico";
import ListaPacientes from "./components/ListaPacientes";
import BuscarExamesCPF from "./components/BuscarExamesCPF";
import SolicitarExame from "./components/SolicitarExame";
import CadastrarConvenio from "./components/CadastrarConvenio";
import AtualizarConvenio from "./components/AtualizarConvenio";

import InserirConsulta from "./components/InserirConsulta";
import AgendarConsulta from "./components/AgendarConsulta";
import CancelarConsulta from "./components/CancelarConsulta";
import VisualizarConsulta from "./components/VisualizarConsulta";
import EscolherHorario from "./components/EscolherHorario";

import PacienteExames from "./components/PacienteExames";
import VisualizarExame from "./components/VisualizarExame"; 

export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [medico, setMedico] = useState(null);

  const [examCpf, setExamCpf] = useState(null);
  const [examPaciente, setExamPaciente] = useState(null);

  const [medicoFiltrar, setMedicoFiltrar] = useState(null);
  const [chatParams, setChatParams] = useState(null);

  const handleLoginSuccessUsuario = (u) => {
    setUser(u);
    setMedico(null);
    setScreen("homeUsuario");
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
            <Pressable
              style={styles.backBtn}
              onPress={() => setScreen("login")}
            >
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
          onGoCadastrarConvenio={() => setScreen("cadastrarConvenio")}
          onGoInserirConsulta={() => setScreen("inserirConsulta")}
          onGoPacienteExames={() => setScreen("pacienteExames")}
          onGoChat={() => {
            setChatParams({ pacienteId: user?.cpf, role: 'paciente' });
            setScreen('chatMedico');
          }}
        />
      )}

      {screen === "homeDoutor" && (
        <HomeDoutor
          medico={medico}
          onLogout={() => {
            setMedico(null);
            setScreen("login");
          }}
          onGoBuscarExames={() => setScreen("buscarExames")}
          onGoChat={() => setScreen("listaPacientes")}
        />
      )}

     
      {screen === "buscarExames" && (
        <BuscarExamesCPF
          onVoltar={() =>
            setScreen(user ? "homeUsuario" : medico ? "homeDoutor" : "login")
          }
          onSolicitarExame={({ cpf, paciente }) => {
            setExamCpf(cpf);
            setExamPaciente(paciente);
            setScreen("solicitarExame");
          }}
          onVisualizarExame={(exame) => {
           
            setExamPaciente(exame);
            setScreen("visualizarExame");
          }}
        />
      )}

     
      {screen === "visualizarExame" && (
        <VisualizarExame
          exame={examPaciente}
          onVoltar={() => setScreen("buscarExames")}
        />
      )}

      {screen === "solicitarExame" && (
        <SolicitarExame
          initialCpf={examCpf}
          paciente={examPaciente}
          onVoltar={() => setScreen("buscarExames")}
          onSaved={() => setScreen("buscarExames")}
        />
      )}

      {screen === "cadastrarConvenio" && (
        <CadastrarConvenio
          onVoltar={() => setScreen("homeUsuario")}
          onSaved={() => setScreen("homeUsuario")}
          onGoAtualizarConvenio={() => setScreen("atualizarConvenio")}
        />
      )}

      {screen === "atualizarConvenio" && (
        <AtualizarConvenio
          onVoltar={() => setScreen("homeUsuario")}
          onSaved={() => setScreen("homeUsuario")}
        />
      )}

      {screen === "inserirConsulta" && (
        <InserirConsulta
          onVoltar={() => setScreen("homeUsuario")}
          onSetScreen={setScreen}
        />
      )}

      {screen === "agendarConsulta" && (
        <AgendarConsulta
          onVoltar={() => setScreen("inserirConsulta")}
          onContinuar={(medicoSelecionado) => {
            setMedicoFiltrar(medicoSelecionado);
            setScreen("escolherHorario");
          }}
        />
      )}

      {screen === "cancelarConsulta" && (
        <CancelarConsulta onVoltar={() => setScreen("inserirConsulta")} />
      )}

      {screen === "visualizarConsulta" && (
        <VisualizarConsulta onVoltar={() => setScreen("inserirConsulta")} />
      )}

      {screen === "escolherHorario" && (
        <EscolherHorario
          onVoltar={() => setScreen("agendarConsulta")}
          medicoFiltrar={medicoFiltrar}
        />
      )}

      {screen === "pacienteExames" && (
        <PacienteExames
          cpf={user?.cpf}
          onVoltar={() => setScreen("homeUsuario")}
        />
      )}

      {screen === "chatMedico" && (
        <ChatMedico
          medicoId={chatParams?.medicoId ?? medico?.crm}
          pacienteId={chatParams?.pacienteId ?? user?.cpf}
          role={chatParams?.role ?? (medico ? 'medico' : user ? 'paciente' : undefined)}
          onVoltar={() => {
            setChatParams(null);
            setScreen(medico ? "homeDoutor" : user ? "homeUsuario" : "login");
          }}
        />
      )}

      {screen === 'listaPacientes' && (
        <ListaPacientes
          onVoltar={() => setScreen('homeDoutor')}
          onSelect={(paciente) => {
            setChatParams({ medicoId: medico?.crm, pacienteId: paciente.cpf, role: 'medico' });
            setScreen('chatMedico');
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
