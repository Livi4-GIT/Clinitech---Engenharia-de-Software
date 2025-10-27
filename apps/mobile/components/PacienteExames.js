import React from 'react';
import { View, Text, SafeAreaView, StatusBar, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

export default function EmConstrucaoScreen({ navigation, onVoltar }) {
  const handleVoltar = () => {
    if (typeof onVoltar === 'function') return onVoltar();
    if (navigation?.canGoBack?.()) return navigation.goBack();
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

        <View style={styles.center}>
          <Text style={styles.texto}>implementar ainda</Text>
        </View>

        <TouchableOpacity
          onPress={handleVoltar}
          activeOpacity={0.9}
          style={styles.bottomWrap}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <LinearGradient
            colors={['#2f6edb', '#1f4fb6']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.bottomBtn}
          >
            <Ionicons name="arrow-back-outline" size={20} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.bottomTxt}>Voltar</Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  texto: {
    color: '#eaf1ff',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 0.5,
  },

  bottomWrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  bottomBtn: {
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  bottomTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
