import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginUsuario from "./components/LoginUsuario";
import CadastroUsuario from "./components/CadastroUsuario";
import LoginMedico from "./components/LoginMedico";
import ConfirmacaoCadastroMedico from "./components/ConfirmacaoCadastroMedico";
import CadastroMedico from "./components/CadastroMedico";

import HomeUsuario from "./components/HomeUsuario";
import HomeDoutor from "./components/HomeDoutor";
import BuscarExamesCPF from "./components/BuscarExamesCPF";
import SolicitarExame from "./components/SolicitarExame";
import InserirConsulta from './components/InserirConsulta';

const Stack = createNativeStackNavigator();
export default function App() {
  const [user, setUser] = useState(null);
  const [medico, setMedico] = useState(null);
  const [examCpf, setExamCpf] = useState(null);
  const [examPaciente, setExamPaciente] = useState(null);

  const handleLoginSuccessUsuario = (u) => {
    setUser(u);
    setMedico(null);
    Alert.alert("Bem-vindo!", `Login realizado, ${u?.nome || "usuário"}.`);
  };

  const handleLoginSuccessMedico = (m) => {
    setMedico(m);
    setUser(null);
    Alert.alert("Bem-vindo!", "Login médico realizado.");
  };

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {/* Login e Cadastro */}
        {!user && !medico && (
          <>
            <Stack.Screen name="LoginUsuario">
              {(props) => (
                <LoginUsuario
                  {...props}
                  onGoCadastro={() => props.navigation.navigate("CadastroUsuario")}
                  onGoLoginMedico={() => props.navigation.navigate("LoginMedico")}
                  onLoginSuccess={handleLoginSuccessUsuario}
                />
              )}
            </Stack.Screen>

            <Stack.Screen name="CadastroUsuario" component={CadastroUsuario} />
            <Stack.Screen name="LoginMedico">
              {(props) => (
                <LoginMedico
                  {...props}
                  onGoLoginUsuario={() => props.navigation.navigate("LoginUsuario")}
                  onGoCadastroMedico={() =>
                    props.navigation.navigate("ConfirmacaoCadastroMedico")
                  }
                  onLoginSuccess={handleLoginSuccessMedico}
                />
              )}
            </Stack.Screen>

            <Stack.Screen
              name="ConfirmacaoCadastroMedico"
              component={ConfirmacaoCadastroMedico}
            />
            <Stack.Screen name="CadastroMedico" component={CadastroMedico} />
          </>
        )}

        {/* Home */}
        {user && (
          <Stack.Screen name="HomeUsuario">
            {(props) => (
              <HomeUsuario
                {...props}
                user={user}
                onLogout={() => setUser(null)}
                onGoBuscarExames={() => props.navigation.navigate("BuscarExames")}
              />
            )}
          </Stack.Screen>
        )}

        {medico && (
          <Stack.Screen name="HomeDoutor">
            {(props) => (
              <HomeDoutor
                {...props}
                medico={medico}
                onLogout={() => setMedico(null)}
                onGoBuscarExames={() => props.navigation.navigate("BuscarExames")}
              />
            )}
          </Stack.Screen>
        )}

        {/* Funcionalidades */}
        <Stack.Screen name="BuscarExames">
          {(props) => (
            <BuscarExamesCPF
              {...props}
              onVoltar={() =>
                props.navigation.navigate(user ? "HomeUsuario" : "HomeDoutor")
              }
              onSolicitarExame={({ cpf, paciente }) => {
                setExamCpf(cpf);
                setExamPaciente(paciente);
                props.navigation.navigate("SolicitarExame");
              }}
            />
          )}
        </Stack.Screen>

        <Stack.Screen name="SolicitarExame">
          {(props) => (
            <SolicitarExame
              {...props}
              initialCpf={examCpf}
              paciente={examPaciente}
              onVoltar={() => props.navigation.navigate("BuscarExames")}
              onSaved={() => props.navigation.navigate("BuscarExames")}
            />
          )}
        </Stack.Screen>

        {/* Nova tela */}
        <Stack.Screen name="InserirConsulta" component={InserirConsulta} />
      </Stack.Navigator>
    </NavigationContainer>
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
