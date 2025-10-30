import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({
  navigation,
  user,
  onLogout,
  onGoCadastrarConvenio,
  onGoInserirConsulta,
  onGoPacienteExames,
  onGoChat,
  onGoReceitas,
  onGoAtestados, 
}) {
  const nome = (user?.nome || 'Fulano').trim();

  const generoRaw = (user?.genero ?? '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();

  const isFeminino = generoRaw.startsWith('fem') || generoRaw.includes('mulher');
  const isMasculino = generoRaw.startsWith('masc') || generoRaw.includes('homem');

  const saudacao = isFeminino ? 'Seja Bem-Vinda' : isMasculino ? 'Seja Bem-Vindo' : 'Seja Bem-Vindo(a)';

  const abrirCadastrarConvenio = () => {
    if (navigation?.navigate) navigation.navigate('CadastrarConvenio');
    else if (typeof onGoCadastrarConvenio === 'function') onGoCadastrarConvenio();
  };

  const abrirInserirConsultas = () => {
    if (typeof onGoInserirConsulta === 'function') onGoInserirConsulta();
  };

  const abrirPacienteExames = () => {
    if (navigation?.navigate) navigation.navigate('PacienteExames');
    else if (typeof onGoPacienteExames === 'function') onGoPacienteExames();
  };

  const abrirReceitas = () => {
    if (navigation?.navigate) navigation.navigate('PacienteReceitas');
    else if (typeof onGoReceitas === 'function') onGoReceitas();
  };

  const abrirAtestados = () => {
    if (navigation?.navigate) navigation.navigate('PacienteAtestado');
    else if (typeof onGoAtestados === 'function') onGoAtestados();
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
            <TouchableOpacity style={styles.iconBox} onPress={abrirInserirConsultas}>
              <Ionicons name="calendar-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Agendamentos</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBox} onPress={abrirCadastrarConvenio}>
              <Ionicons name="card-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Cadastrar Convênio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBox} onPress={() => { if (typeof onGoChat === 'function') onGoChat(); }}>
              <Ionicons name="chatbubble-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Comunicação</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBox} onPress={abrirPacienteExames}>
              <MaterialCommunityIcons name="microscope" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Exames</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBox} onPress={abrirReceitas}>
              <MaterialCommunityIcons name="receipt-text-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Receitas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBox} onPress={abrirAtestados}>
              <MaterialCommunityIcons name="clipboard-text-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Atestados</Text>
            </TouchableOpacity>
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
