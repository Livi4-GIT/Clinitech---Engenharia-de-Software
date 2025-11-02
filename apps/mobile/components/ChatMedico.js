import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getConversation, appendMessage, findConversationsForPaciente } from './chatStorage';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ChatMedico({ medicoId: propMedId, pacienteId: propPacId, role: propRole, onVoltar }) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [otherId, setOtherId] = useState('');
  const [selectedMedId, setSelectedMedId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [noConversations, setNoConversations] = useState(false);
  const [doctorName, setDoctorName] = useState('');
  const [patientName, setPatientName] = useState('');

  const role = propRole || (propMedId ? 'medico' : propPacId ? 'paciente' : 'paciente');
  const medId = propMedId;
  const pacId = propPacId;

  const activeMedId = medId || selectedMedId || (role === 'paciente' ? otherId : undefined);
  const activePacId = pacId || (role === 'medico' ? otherId : pacId || undefined);

  const otherInputPlaceholder = role === 'medico' ? 'ID do paciente' : 'ID do médico';

  const loadUserNames = async (medId, pacId) => {
    try {
      if (medId) {
        const doctorData = await AsyncStorage.getItem(`MED_${medId}`);
        if (doctorData) {
          const doctor = JSON.parse(doctorData);
          setDoctorName(doctor.nome);
        }
      }
      if (pacId) {
        const patientData = await AsyncStorage.getItem(pacId);
        if (patientData) {
          const patient = JSON.parse(patientData);
          setPatientName(patient.nome);
        }
      }
    } catch (error) {
      console.error('Error loading user names:', error);
    }
    console.log('Loaded names:', { doctorName, patientName, medId, pacId });
  };

  useEffect(() => {
    let mounted = true;
    async function load() {
      if (role === 'paciente' && !propMedId && propPacId && !selectedMedId) {
        const convs = await findConversationsForPaciente(propPacId);
        if (convs && convs.length) {
          setSelectedMedId(convs[0].medId);
          return;
        } else {
          setNoConversations(true);
        }
      }

      if (!activeMedId || !activePacId) {
        setMessages([]);
        return;
      }
      setLoading(true);
      const msgs = await getConversation(activeMedId, activePacId);
      if (mounted) setMessages(msgs || []);
      setLoading(false);
      await loadUserNames(activeMedId, activePacId);
    }
    load();
    return () => (mounted = false);
  }, [activeMedId, activePacId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    if (!activeMedId || !activePacId) {
      return;
    }

    const message = {
      id: String(Date.now()),
      from: role === 'medico' ? 'medico' : 'paciente',
      senderId: role === 'medico' ? activeMedId : activePacId,
      text: text.trim(),
      createdAt: Date.now(),
      readBy: [],
    };

    const updated = await appendMessage(activeMedId, activePacId, message);
    setMessages(updated || []);
    setText('');
  };

  const renderItem = ({ item }) => {
    const isMine = (role === 'medico' && item.from === 'medico') || (role === 'paciente' && item.from === 'paciente');
    return (
      <View style={[styles.msgRow, isMine ? styles.msgMine : styles.msgOther]}>
        <Text style={styles.msgText}>{item.text}</Text>
        <Text style={styles.msgTime}>{new Date(item.createdAt).toLocaleTimeString()}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a1a3f" />

      <View style={styles.header}>
        <TouchableOpacity onPress={onVoltar} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Voltar">
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Chat</Text>
      </View>

      <View style={styles.topRow}>
        <Text style={styles.topLabel}>Conversa entre:</Text>
        <Text style={styles.topLabelSmall}>Médico: {doctorName || '—'}</Text>
        <Text style={styles.topLabelSmall}>Paciente: {patientName || '—'}</Text>
        {noConversations && role === 'paciente' && (
          <Text style={styles.noMessages}>Você ainda não tem mensagens de nenhum médico.</Text>
        )}
      </View>

      {}
      {(!propMedId || !propPacId) && role === 'medico' && (
        <View style={styles.otherInputRow}>
          <TextInput
            placeholder={otherInputPlaceholder}
            placeholderTextColor="#bcd"
            value={otherId}
            onChangeText={setOtherId}
            style={styles.otherInput}
          />
        </View>
      )}

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={90}>
        <FlatList
          data={messages}
          keyExtractor={(i) => i.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          inverted={false}
        />

        <View style={styles.inputRow}>
          <TextInput
            placeholder="Escreva uma mensagem..."
            placeholderTextColor="#bcd"
            value={text}
            onChangeText={setText}
            style={styles.input}
          />
          <TouchableOpacity onPress={handleSend} style={styles.sendBtn} accessibilityRole="button">
            <Ionicons name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0a1a3f' },
  noMessages: { color: '#fffa', fontSize: 14, marginTop: 8, textAlign: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 12 },
  backBtn: { marginRight: 8, padding: 6 },
  title: { color: '#fff', fontSize: 18, fontWeight: '700' },
  topRow: { paddingHorizontal: 12, paddingBottom: 4 },
  topLabel: { color: '#eaf1ff', fontWeight: '600' },
  topLabelSmall: { color: '#cfe', fontSize: 12 },
  otherInputRow: { padding: 12 },
  otherInput: { backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', padding: 10, borderRadius: 8 },
  list: { paddingHorizontal: 12, paddingBottom: 8 },
  msgRow: { marginVertical: 6, maxWidth: '80%', padding: 10, borderRadius: 10 },
  msgMine: { alignSelf: 'flex-end', backgroundColor: 'rgba(47,110,219,0.9)' },
  msgOther: { alignSelf: 'flex-start', backgroundColor: 'rgba(255,255,255,0.08)' },
  msgText: { color: '#fff' },
  msgTime: { color: '#dce', fontSize: 10, marginTop: 6, textAlign: 'right' },
  inputRow: { flexDirection: 'row', padding: 12, alignItems: 'center' },
  input: { flex: 1, backgroundColor: 'rgba(255,255,255,0.06)', color: '#fff', padding: 10, borderRadius: 10, marginRight: 8 },
  sendBtn: { backgroundColor: '#2f6edb', padding: 10, borderRadius: 10 },
});
