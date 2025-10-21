import React from 'react';
import {
  View, Text, TouchableOpacity, SafeAreaView, StatusBar, StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

export default function HomeScreen({ user, onLogout }) {
  const nome = (user?.nome || 'Fulano').trim();
  const genero = (user?.genero || '').toLowerCase();

  const saudacao =
    genero === 'feminino' ? 'Seja Bem-Vinda' :
    genero === 'masculino' ? 'Seja Bem-Vindo' :
    'Seja Bem-Vindo(a)';

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

            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="search-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Cadastrar Convênio</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <TouchableOpacity style={styles.iconBox}>
              <Ionicons name="chatbubble-outline" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Comunicação</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.iconBox}>
              <MaterialCommunityIcons name="microscope" size={42} color="#eaf1ff" />
              <Text style={styles.label}>Exames</Text>
            </TouchableOpacity>
          </View>

      
          <View style={{ height: 100 }} />
        </View>

        {!!onLogout && (
          <View style={styles.bottomBar}>
            <LinearGradient
              colors={['#2f6edb', '#1f4fb6']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bottomBtn}
            >
              <TouchableOpacity
                onPress={onLogout}
                style={styles.bottomPress}
                accessibilityRole="button"
                accessibilityLabel="Sair da conta"
              >
                <Ionicons name="log-out-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
                <Text style={styles.bottomTxt}>Sair</Text>
              </TouchableOpacity>
            </LinearGradient>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    paddingVertical: 16, paddingHorizontal: 20,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  headerText: { color: '#eaf1ff', fontSize: 20, fontWeight: '700' },

  profileCircle: {
    width: 48, height: 48, borderRadius: 24, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)', backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center', alignItems: 'center',
  },

  grid: { marginTop: 24, alignItems: 'center', paddingHorizontal: 16 },

  row: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 16 },

  iconBox: {
    width: '48%', height: 130, borderRadius: 20, borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)', backgroundColor: 'rgba(255,255,255,0.10)',
    justifyContent: 'center', alignItems: 'center', padding: 12,
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
  },

  label: { marginTop: 10, fontSize: 14, color: '#eaf1ff', textAlign: 'center', fontWeight: '600' },

  
  bottomBar: {
    position: 'absolute',
    left: 0, right: 0, bottom: 16,
    paddingHorizontal: 16,
  },
  bottomBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  bottomPress: {
    flexDirection: 'row',
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 18,
  },
  bottomTxt: { color: '#fff', fontWeight: '800', fontSize: 18 },
});
