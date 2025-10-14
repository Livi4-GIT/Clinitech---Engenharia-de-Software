import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  StyleSheet,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';

const PURPLE = '#3E1B83';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={PURPLE} barStyle="light-content" />

      {/* Cabeçalho roxo */}
      <View style={styles.header}>
        <Text style={styles.headerText}>Olá Dr. Ciclano!</Text>
        <View style={styles.profileCircle}>
          <Ionicons name="person" size={26} color="#6b6b6b" />
        </View>
      </View>

      {/* Grade 2x2 */}
      <View style={styles.grid}>
        <View style={styles.row}>
          <TouchableOpacity style={styles.iconBox}>
            <View style={styles.iconInner}>
              <Ionicons name="calendar-outline" size={40} color="#1f2742" />
            </View>
            <Text style={styles.label}>Agendamentos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBox}>
            <View style={styles.iconInner}>
              <Ionicons name="search-outline" size={40} color="#1f2742" />
            </View>
            <Text style={styles.label}>Buscar Paciente</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <TouchableOpacity style={styles.iconBox}>
            <View style={styles.iconInner}>
              <Ionicons name="chatbubble-ellipses-outline" size={40} color="#1f2742" />
            </View>
            <Text style={styles.label}>Comunicação</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.iconBox}>
            <View style={styles.iconInner}>
              <MaterialCommunityIcons name="microscope" size={40} color="#1f2742" />
            </View>
            <Text style={styles.label}>Exames</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const CARD_BORDER = 'rgba(0,0,0,0.65)';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff', 
  },

  header: {
    backgroundColor: PURPLE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 18,
  },

  headerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },

  profileCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1,
    borderColor: '#cfcfcf',
    backgroundColor: '#efefef',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },

  grid: {
    marginTop: 22,
    alignItems: 'center',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '86%',
    marginBottom: 26,
  },

  iconBox: {
    width: '46%',
    alignItems: 'center',
  },

  iconInner: {
    width: 120,
    height: 120,
    borderRadius: 22,
    backgroundColor: '#fff',
    borderWidth: 1.5,
    borderColor: CARD_BORDER,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

  label: {
    marginTop: 10,
    fontSize: 15,
    color: PURPLE,
    textAlign: 'center',
    fontWeight: '600',
  },
});
