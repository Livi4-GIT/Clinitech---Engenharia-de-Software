import AsyncStorage from '@react-native-async-storage/async-storage';

const keyFor = (medId, pacId) => `chat:${String(medId)}:${String(pacId)}`;

export async function getConversation(medId, pacId) {
  try {
    const key = keyFor(medId || 'medico_unknown', pacId || 'paciente_unknown');
    const json = await AsyncStorage.getItem(key);
    return json ? JSON.parse(json) : [];
  } catch (err) {
    console.warn('getConversation error', err);
    return [];
  }
}

export async function saveConversation(medId, pacId, messages) {
  try {
    const key = keyFor(medId || 'medico_unknown', pacId || 'paciente_unknown');
    await AsyncStorage.setItem(key, JSON.stringify(messages || []));
  } catch (err) {
    console.warn('saveConversation error', err);
  }
}

export async function appendMessage(medId, pacId, message) {
  try {
    const msgs = await getConversation(medId, pacId);
    msgs.push(message);
    await saveConversation(medId, pacId, msgs);
    return msgs;
  } catch (err) {
    console.warn('appendMessage error', err);
    return [];
  }
}

export async function clearConversation(medId, pacId) {
  try {
    const key = keyFor(medId || 'medico_unknown', pacId || 'paciente_unknown');
    await AsyncStorage.removeItem(key);
  } catch (err) {
    console.warn('clearConversation error', err);
  }
}

export async function findConversationsForPaciente(pacId) {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const chatKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith('chat:'));
    const matching = chatKeys
      .map((k) => {
        const parts = k.split(':');
        if (parts.length < 3) return null;
        const med = parts[1];
        const pac = parts.slice(2).join(':');
        return { key: k, medId: med, pacId: pac };
      })
      .filter((x) => x && x.pacId === String(pacId));

    const results = [];
    for (const item of matching) {
      try {
        const json = await AsyncStorage.getItem(item.key);
        const msgs = json ? JSON.parse(json) : [];
        const last = msgs && msgs.length ? msgs[msgs.length - 1].createdAt || 0 : 0;
        results.push({ medId: item.medId, key: item.key, lastTimestamp: last });
      } catch (e) {
        results.push({ medId: item.medId, key: item.key, lastTimestamp: 0 });
      }
    }

    results.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
    return results;
  } catch (err) {
    console.warn('findConversationsForPaciente error', err);
    return [];
  }
}

export async function findConversationsForMedico(medId) {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const chatKeys = allKeys.filter((k) => typeof k === 'string' && k.startsWith('chat:'));
    const matching = chatKeys
      .map((k) => {
        const parts = k.split(':');
        if (parts.length < 3) return null;
        const med = parts[1];
        const pac = parts.slice(2).join(':');
        return { key: k, medId: med, pacId: pac };
      })
      .filter((x) => x && x.medId === String(medId));

    const results = [];
    for (const item of matching) {
      try {
        const json = await AsyncStorage.getItem(item.key);
        const msgs = json ? JSON.parse(json) : [];
        const last = msgs && msgs.length ? msgs[msgs.length - 1].createdAt || 0 : 0;
        results.push({ pacId: item.pacId, key: item.key, lastTimestamp: last });
      } catch (e) {
        results.push({ pacId: item.pacId, key: item.key, lastTimestamp: 0 });
      }
    }

    results.sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0));
    return results;
  } catch (err) {
    console.warn('findConversationsForMedico error', err);
    return [];
  }
}
