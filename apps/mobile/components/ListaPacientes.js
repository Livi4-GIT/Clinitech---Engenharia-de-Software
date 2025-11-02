import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ListaPacientes({ onSelect, onVoltar }) {
  const [pacientes, setPacientes] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const keys = await AsyncStorage.getAllKeys();
        const cpfs = keys.filter((k) => typeof k === 'string' && /^\d{11}$/.test(k));
        const entries = [];
        for (const cpf of cpfs) {
          try {
            const json = await AsyncStorage.getItem(cpf);
            const obj = json ? JSON.parse(json) : null;
            if (obj) entries.push({ cpf, nome: obj.nome || cpf, raw: obj });
          } catch (e) {
          }
        }
        if (mounted) setPacientes(entries);
      } catch (e) {
        console.warn('ListaPacientes load error', e);
      }
    }
    load();
    return () => (mounted = false);
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.name}>{item.nome}</Text>
        <Text style={styles.cpf}>{item.cpf}</Text>
      </View>
      <TouchableOpacity style={styles.btn} onPress={() => onSelect?.(item.raw)} accessibilityRole="button">
        <Text style={styles.btnText}>Conversar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={onVoltar} style={styles.back} accessibilityRole="button">
          <Text style={styles.backText}>Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Pacientes no dispositivo</Text>
      </View>

      <FlatList data={pacientes} keyExtractor={(i) => i.cpf} renderItem={renderItem} ListEmptyComponent={<Text style={styles.empty}>Nenhum paciente cadastrado neste dispositivo.</Text>} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#0a1a3f' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  back: { padding: 8, marginRight: 8 },
  backText: { color: '#cfe' },
  title: { color: '#fff', fontWeight: '700', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.06)' },
  info: {},
  name: { color: '#eaf1ff', fontWeight: '600' },
  cpf: { color: '#cfe', fontSize: 12 },
  btn: { backgroundColor: '#2f6edb', padding: 8, borderRadius: 8 },
  btnText: { color: '#fff', fontWeight: '700' },
  empty: { color: '#cfe', textAlign: 'center', marginTop: 40 },
});
