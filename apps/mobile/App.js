import React, { useState } from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Text, Pressable, Alert } from "react-native";
import LoginUsuario from "./components/LoginUsuario";
import CadastroUsuario from "./components/CadastroUsuario";
import LoginMedico from "./components/LoginMedico"; 

export default function App() {
  const [screen, setScreen] = useState("login"); 
  const [user, setUser] = useState(null);

  const handleLoginSuccess = (u) => {
    setUser(u);
    // Masashi!! Quando você criar sua página Home/Navegação, navegue para lá aqui
    // Exemplo 
    // navigation.replace("Home", { user: u });
    console.log("LOGIN OK. Usuário:", u);
    Alert.alert("Bem-vindo!", `Login realizado, ${u?.nome || "usuário"}.\n(TODO: ir para Home)`);
  };

  return (
    <View style={styles.container}>
      {screen === "login" && (
        <LoginUsuario
          onGoCadastro={() => setScreen("cadastro")}
          onGoLoginMedico={() => setScreen("loginMedico")}
          onLoginSuccess={handleLoginSuccess}
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
          onBack={() => setScreen("login")}
          onGoLoginUsuario={() => setScreen("login")}  
        />
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  overlayTop: { position: "absolute", top: 50, right: 20 },
  backBtn: { backgroundColor: "rgba(47,110,219,0.9)", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 12 },
  backTxt: { color: "#fff", fontWeight: "700" },
});
