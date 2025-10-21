// Inserir_Consulta.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function InserirConsulta({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inserir Nova Consulta</Text>

      {/* Aqui você vai depois colocar os campos de formulário */}

      {/* Botão para voltar (opcional) */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.button}>
        <Text style={styles.buttonText}>Voltar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff'
  },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  button: { backgroundColor: '#1c4fb8', padding: 10, borderRadius: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold' }
});
