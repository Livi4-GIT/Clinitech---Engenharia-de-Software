import React, { useState } from "react";
import { StatusBar, StyleSheet, View, Text, Pressable, Alert } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';

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

import BuscarReceitasCPF from "./components/BuscarReceitasCPF";
import CriarReceitas from "./components/CriarReceitas";
import PacienteReceitas from "./components/PacienteReceitas";
import VisualizarReceita from "./components/VisualizarReceita";

import BuscarAtestadoCPF from "./components/BuscarAtestadoCPF";
import VisualizarAtestado from "./components/VisualizarAtestado";
import PacienteAtestado from "./components/PacienteAtestado";
import CriarAtestado from "./components/CriarAtestado";
import PerfilPaciente from "./components/PerfilPaciente";
import EditarPerfilPaciente from "./components/EditarPerfilPaciente";

import PerfilMedico from "./components/PerfilMedico";
import EditarPerfilMedico from "./components/EditarPerfilMedico";
import AgendaMedico from "./components/AgendaMedico";

  
export default function App() {
  const [screen, setScreen] = useState("login");
  const [user, setUser] = useState(null);
  const [medico, setMedico] = useState(null);
  const [cpfLogado, setCpfLogado] = useState(null);

  const [examCpf, setExamCpf] = useState(null);
  const [examPaciente, setExamPaciente] = useState(null);

  const [consultaAgendada, setConsultaAgendada] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [receitaCpf, setReceitaCpf] = useState(null);
  const [receitaPaciente, setReceitaPaciente] = useState(null);
  const [receitaSelecionada, setReceitaSelecionada] = useState(null);

  const [atestadoCpf, setAtestadoCpf] = useState(null);
  const [atestadoPaciente, setAtestadoPaciente] = useState(null);
  const [atestadoSelecionado, setAtestadoSelecionado] = useState(null);

  const [medicoFiltrar, setMedicoFiltrar] = useState(null);
  const [chatParams, setChatParams] = useState(null);

  const [listaMedicos, setListaMedicos] = useState([]);


  // Salvar consultas para o usuário logado
  const salvarConsultas = async (cpfLogado, lista) => {
    try {
      await AsyncStorage.setItem(`consultas_${cpfLogado}`, JSON.stringify(lista));
    } catch (error) {
      console.log("Erro ao salvar consultas:", error);
    }
  };

  // Carregar consultas do usuário logado
  const carregarConsultas = async (cpfLogado) => {
    try {
      const jsonValue = await AsyncStorage.getItem(`consultas_${cpfLogado}`);
      const lista = jsonValue != null ? JSON.parse(jsonValue) : [];
      setConsultas(lista);
      return lista; 
    } catch (error) {
      console.log("Erro ao carregar consultas:", error);
      return [];
    }
  };

  
  const handleLoginSuccessUsuario = async (u) => {
    setUser(u);
    setMedico(null);
    setCpfLogado(u.cpf);
    setScreen("homeUsuario");
    await carregarConsultas(u.cpf);
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
            setUser(null);
            setScreen("homeDoutor");
            setScreen("homeDoutor");
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
          onMedicoCadastrado={(novoMedico) =>{
            setListaMedicos(prev => [...prev, novoMedico]);
          }}
        />
      )}

      {/* Home Usuário */}
      {screen === "homeUsuario" && (
        <HomeUsuario
          user={user}
          onLogout={() => {
            setUser(null);
            setConsultas([]); // Limpar cache local!
            setScreen("login");
          }}
          onGoBuscarExames={() => setScreen("buscarExames")}
          onGoCadastrarConvenio={() => setScreen("cadastrarConvenio")}
          onGoInserirConsulta={() => setScreen("inserirConsulta")}
          onGoPacienteExames={() => setScreen("pacienteExames")}
          onGoChat={() => {
            setChatParams({ pacienteId: user?.cpf, role: "paciente" });
            setScreen("chatMedico");
          }}
          onGoReceitas={() => setScreen("pacienteReceitas")}
          onGoAtestados={() => setScreen("pacienteAtestados")}
        />
      )}

      {/* Home Médico */}
      {screen === "homeDoutor" && (
        <HomeDoutor
          medico={medico}
          onLogout={() => {
            setMedico(null);
            setConsultas([]); // Limpar cache local!
            setScreen("login");
          }}
          onVerPerfil={() => setScreen("perfilMedico")} 
          onGoBuscarExames={() => setScreen("buscarExames")}
          onGoChat={() => setScreen("listaPacientes")}
          onGoReceitas={() => setScreen("buscarReceitas")}
          onGoAtestado={() => setScreen("buscarAtestado")}
          onGoAgenda = {() => setScreen("agendaMedico")}
        />
      )}

      {/* Buscar Exames */}
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

      {/* Visualizar Exames */}
      {screen === "visualizarExame" && (
        <VisualizarExame
          exame={examPaciente}
          onVoltar={() => setScreen("buscarExames")}
        />
      )}

      {/* Solicitar Exames */}
      {screen === "solicitarExame" && (
        <SolicitarExame
          initialCpf={examCpf}
          paciente={examPaciente}
          onVoltar={() => setScreen("buscarExames")}
          onSaved={() => setScreen("buscarExames")}
        />
      )}

      {/* Cadastrar Convênios */}
      {screen === "cadastrarConvenio" && (
        <CadastrarConvenio
          onVoltar={() => setScreen("homeUsuario")}
          onSaved={() => setScreen("homeUsuario")}
          onGoAtualizarConvenio={() => setScreen("atualizarConvenio")}
        />
      )}

      {/* Atualizar Convênios */}
      {screen === "atualizarConvenio" && (
        <AtualizarConvenio
          onVoltar={() => setScreen("cadastrarConvenio")}
          onSaved={() => setScreen("cadastrarConvenio")}
        />
      )}

      {/* Menu pequeno após Paciente clicar em Agendamentos */}
      {screen === "inserirConsulta" && (
        <InserirConsulta
          onVoltar={() => setScreen("homeUsuario")}
          onSetScreen={setScreen}
        />
      )}

      {/* Agendar Consultas */}
      {screen === "agendarConsulta" && (
        <AgendarConsulta
          listaMedicos={listaMedicos}
          onVoltar={() => setScreen("inserirConsulta")}
          onContinuar={(dadosConsulta) => {
            setConsultaAgendada(dadosConsulta);
            setScreen("escolherHorario");       
          }}        
        />
      )}

      {/* Cancelar Consultas */}
      {screen === "cancelarConsulta" && (
        <CancelarConsulta
          consultas={consultas}
          setConsultas={(novaLista) =>{
            setConsultas(novaLista);
            salvarConsultas(cpfLogado, novaLista);
          }}
          onVoltar={() => setScreen("inserirConsulta")} 
        />
      )}

      {/* Visualizar Consultas */}
      {screen === "visualizarConsulta" && (
        <VisualizarConsulta
        consultas={consultas}
        cpfLogado={cpfLogado}
        onVoltar={() => setScreen("inserirConsulta")} 
        />
      )}

      {/* Calendário para finalizar Agendamento de Consultas */}
      {screen === "escolherHorario" && (
        <EscolherHorario
          cpfLogado={cpfLogado}
          consulta={consultaAgendada}
          consultas={consultas}
          listaMedicos={listaMedicos}
          onVoltarParaInserirConsulta={() => setScreen("inserirConsulta")}
          onConsultaConfirmada={async (novaConsulta) => {
            const novasConsultas = [...consultas, novaConsulta];
            setConsultas(novasConsultas);
            await salvarConsultas(cpfLogado, novasConsultas);
            setScreen("inserirConsulta");
          }}
          onVoltar={() => setScreen("agendarConsulta")}
        />
      )}

      {/* Visualização de Exames do Paciente */}
      {screen === "pacienteExames" && (
        <PacienteExames
          cpf={user?.cpf}
          onVoltar={() => setScreen("homeUsuario")}
        />
      )}

      {/* Bate-papo */}
      {screen === "chatMedico" && (
        <ChatMedico
          medicoId={chatParams?.medicoId ?? medico?.crm}
          pacienteId={chatParams?.pacienteId ?? user?.cpf}
          role={
            chatParams?.role ?? (medico ? "medico" : user ? "paciente" : undefined)
          }
          onVoltar={() => {
            setChatParams(null);
            setScreen(medico ? "homeDoutor" : user ? "homeUsuario" : "login");
          }}
        />
      )}

      {/* Listar Pacientes */}
      {screen === "listaPacientes" && (
        <ListaPacientes
          onVoltar={() => setScreen("homeDoutor")}
          onSelect={(paciente) => {
            setChatParams({
              medicoId: medico?.crm,
              pacienteId: paciente.cpf,
              role: "medico",
            });
            setScreen("chatMedico");
          }}
        />
      )}

      {/* Buscar Receitas */}
      {screen === "buscarReceitas" && (
        <BuscarReceitasCPF
          onVoltar={() => setScreen("homeDoutor")}
          onCriarReceita={({ cpf, paciente }) => {
            setReceitaCpf(cpf);
            setReceitaPaciente(paciente);
            setScreen("criarReceitas");
          }}
          onVisualizarPdf={(rec) => {
            setReceitaSelecionada(rec);
            setScreen("visualizarReceita");
          }}
        />
      )}

      {/* Criar Receitas */}
      {screen === "criarReceitas" && (
        <CriarReceitas
          initialCpf={receitaCpf}
          paciente={receitaPaciente}
          onVoltar={() => setScreen("buscarReceitas")}
          onSaved={() => setScreen("buscarReceitas")}
        />
      )}

      {/* Listar Receitas */}
      {screen === "pacienteReceitas" && (
        <PacienteReceitas
          cpf={user?.cpf}
          onVoltar={() => setScreen("homeUsuario")}
          onVisualizarPdf={(rec) => {
            setReceitaSelecionada(rec);
            setScreen("visualizarReceita");
          }}
        />
      )}

      {/* Visualizar Receitas */}
      {screen === "visualizarReceita" && (
        <VisualizarReceita
          receita={receitaSelecionada}
          onVoltar={() => {
            if (medico) setScreen("buscarReceitas");
            else setScreen("pacienteReceitas");
          }}
        />
      )}

      {/* Buscar Atestados */}
      {screen === "buscarAtestado" && (
        <BuscarAtestadoCPF
          onVoltar={() => setScreen("homeDoutor")}
          onCriarAtestado={({ cpf, paciente }) => {
            setAtestadoCpf(cpf);
            setAtestadoPaciente(paciente);
            setScreen("criarAtestado");
          }}
          onVisualizarPdf={(item) => {
            setAtestadoSelecionado(item);
            setScreen("visualizarAtestado");
          }}
        />
      )}

      {/* Criar Atestados */}
      {screen === "criarAtestado" && (
        <CriarAtestado
          initialCpf={atestadoCpf}
          paciente={atestadoPaciente}
          onVoltar={() => setScreen("buscarAtestado")}
          onSaved={() => setScreen("buscarAtestado")}
        />
      )}

      {/* Listar Atestados */}
      {screen === "pacienteAtestados" && (
        <PacienteAtestado
          cpf={user?.cpf}
          onVoltar={() => setScreen("homeUsuario")}
          onVisualizarAtestado={(item) => {
            setAtestadoSelecionado(item);
            setScreen("visualizarAtestado");
          }}
        />
      )}

      {/* Visualizar Atestados */}
      {screen === "visualizarAtestado" && (
        <VisualizarAtestado
          atestado={atestadoSelecionado}
          onVoltar={() => {
            if (medico) setScreen("buscarAtestado");
            else setScreen("pacienteAtestados");
          }}
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

      {/* Perfil Médico */}
      {screen === "perfilMedico" && (
        <PerfilMedico
          medico={medico}
          onGoEditar={() => setScreen("editarPerfilMedico")}
          onVoltarHome={() => setScreen("homeDoutor")}
        />
      )}

      {/* Edição Perfil Médico */}
      {screen === "editarPerfilMedico" && (
        <EditarPerfilMedico
          medico={medico}
          onVoltar={() => setScreen("perfilMedico")}
       />
      )}

      {/* Agenda do Médico */}
      {screen === "agendaMedico" && (
        <AgendaMedico
          medicoNome={medico?.nome}
          onVoltar={() => setScreen("homeDoutor")}
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
