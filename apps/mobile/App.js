import React from "react";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import CadastroUsuario from "./components/CadastroUsuario";

export default function App() {
  return (
    <View style={styles.container}>
      <CadastroUsuario />
      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" }, 
});
