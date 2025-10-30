import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeDoutor({
  navigation,
  medico,
  onLogout,
  onGoBuscarExames,
  onGoChat,
  onGoReceitas,
  onGoAtestado, 
}) {
  const nome = (medico?.nome || 'Ciclano').trim();

  const generoRaw = (medico?.genero ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

  const isFeminino = generoRaw.startsWith('fem') || generoRaw.includes('mulher');
  const isMasculino = generoRaw.startsWith('masc') || generoRaw.includes('homem');

  const saudacao = isFeminino
    ? 'Seja Bem-Vinda'
    : isMasculino
    ? 'Seja Bem-Vindo'
    : 'Seja Bem-Vindo(a)';

  const abrirBuscarExames = () => {
    if (typeof onGoBuscarExames === 'function') onGoBuscarExames();
    else if (navigation?.navigate) navigation.navigate('BuscarExamesCPF');
  };

  const abrirReceitas = () => {
    if (typeof onGoReceitas === 'function') onGoReceitas();
    else if (navigation?.navigate) navigation.navigate('BuscarReceitasCPF');
  };

  // <— NOVO
  const abrirAtestado = () => {
    if (typeof onGoAtestado === 'function') onGoAtestado();
    else if (navigation?.navigate) navigation.navigate('Atestado');
  };

  return (
    <LinearGradient
      colors={['#0a1a3f', '#0f2f6d', '#1c4fb8']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={styles.container}>
        <StatusBar backgroundColor="#0a1a3f" barStyle="light-content" />

        <View style={styles.header}>
          <Text style={styles.headerText}>{saudacao}, {nome}</Text>
          <View style={styles.profileCircle}>
            <Ionicons name="person-outline" size={32} color="#3E1B83" />
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="calendar-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Agendamentos</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBox}
              onPress={abrirReceitas}
              accessibilityRole="button"
              accessibilityLabel="Ir para receitas (buscar por CPF)"
            >
              <MaterialCommunityIcons name="receipt-text-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Receitas</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity
              style={styles.iconBox}
              onPress={onGoChat}
              accessibilityRole="button"
              accessibilityLabel="Ir para chat com médico"
            >
              <Ionicons name="chatbubble-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Comunicação</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.iconBox}
              onPress={abrirBuscarExames}
              accessibilityRole="button"
              accessibilityLabel="Ir para busca de exames por CPF"
            >
              <MaterialCommunityIcons name="microscope" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Exames</Text>
            </TouchableOpacity>
          </View>

          {/* NOVO: linha com o botão Atestado */}
          <View style={styles.row}>
            <TouchableOpacity
              style={styles.iconBox}
              onPress={abrirAtestado}
              accessibilityRole="button"
              accessibilityLabel="Ir para emissão de atestado"
            >
              <MaterialCommunityIcons name="file-document-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Atestado</Text>
            </TouchableOpacity>

            {/* Espaçador para manter a grade 2x2/2x1 visualmente consistente */}
            <View style={{ width: '48%' }} />
          </View>
        </View>

        {!!onLogout && (
          <TouchableOpacity
            onPress={onLogout}
            activeOpacity={0.9}
            style={{
              position: 'absolute',
              bottom: 24,
              left: 16,
              right: 16,
              borderRadius: 16,
              overflow: 'hidden',
              shadowColor: '#000',
              shadowOpacity: 0.25,
              shadowRadius: 12,
              shadowOffset: { width: 0, height: 6 },
            }}
          >
            <LinearGradient
              colors={['#ff6161', '#ff3b3b']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                height: 56,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
              }}
            >
              <Ionicons name="log-out-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '700' }}>Sair</Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerText: { color: '#eaf1ff', fontSize: 20, fontWeight: '700' },
  profileCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  grid: { marginTop: 24, alignItems: 'center', paddingHorizontal: 16 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 16,
  },
  iconBox: {
    width: '48%',
    height: 130,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
    backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
  },
  label: {
    marginTop: 10,
    fontSize: 14,
    color: '#eaf1ff',
    textAlign: 'center',
    fontWeight: '600',
  },
});
