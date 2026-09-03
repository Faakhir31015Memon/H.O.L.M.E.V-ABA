import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, SafeAreaView } from 'react-native';

export default function App() {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState("H.O.L.M.E.V Companion Ready");

  const toggleMic = () => {
    setListening(!listening);
    setStatus(!listening ? "Listening..." : "Idle");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>H.O.L.M.E.V</Text>
        <Text style={styles.subtitle}>Mobile Remote Companion</Text>
      </View>

      <View style={styles.coreContainer}>
        <TouchableOpacity 
          style={[styles.micButton, listening && styles.micActive]} 
          onPress={toggleMic}
        >
          <Text style={styles.micText}>{listening ? "LISTENING" : "TAP TO TALK"}</Text>
        </TouchableOpacity>
        <Text style={styles.statusText}>{status}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#050b14',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#00f3ff',
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
  },
  coreContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  micButton: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: 'rgba(0, 243, 255, 0.1)',
    borderWidth: 2,
    borderColor: '#00f3ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  micActive: {
    backgroundColor: 'rgba(50, 255, 126, 0.2)',
    borderColor: '#32ff7e',
  },
  micText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  statusText: {
    color: '#00f3ff',
    marginTop: 20,
    fontSize: 14,
  },
});
