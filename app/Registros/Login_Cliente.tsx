import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Login_Usuarios() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const indentificarlogin = async () => {
    try {
      const cliente = await fetch('http://localhost:8081/login-cliente', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, senha }),
      });

      if (!cliente.ok) {
        const errorData = await cliente.json();
        Alert.alert("Erro ao fazer login", errorData.error || "Erro desconhecido");
        return;
      }

      const data = await cliente.json();
      Alert.alert('Login realizado', `ID do cliente: ${data.id}`);
      await AsyncStorage.setItem('clienteId', String(data.id));
      router.push('../perfils/Usuario/perfil');
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert('Erro ao fazer login', 'Verifique suas credenciais e tente novamente');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <Text style={styles.title}>🍰Olá, Cliente! Escolha, personalize e delicie-se. Simples assim!🍩</Text>
      <Text style={styles.subtitle}>Acesse sua conta e aproveite nossas delícias!</Text>

      <TextInput
        style={styles.input}
        value={email}
        onChangeText={setEmail}
        placeholder='Email'
        keyboardType='email-address'
        autoCapitalize="none"
        placeholderTextColor="#999"
      />
      <TextInput
        style={styles.input}
        value={senha}
        onChangeText={setSenha}
        placeholder='Senha'
        secureTextEntry
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.button} onPress={indentificarlogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EDE7F6', // lilás clarinho suave para o fundo
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#6A1B9A', // roxo escuro elegante
    marginBottom: 16,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 18,
    color: '#7E57C2', // roxo médio vivo
    marginBottom: 32,
    textAlign: 'center',
    fontWeight: '500',
    lineHeight: 24,
  },
  input: {
    width: '90%',
    backgroundColor: '#FFF',
    borderColor: '#9575CD', // borda roxa suave
    borderWidth: 1.8,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    fontSize: 18,
    color: '#333',
    marginBottom: 20,
    shadowColor: '#6A1B9A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  button: {
    backgroundColor: '#7B1FA2', // roxo vibrante forte
    paddingVertical: 16,
    borderRadius: 20,
    width: '90%',
    alignItems: 'center',
    shadowColor: '#4A148C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 14,
    elevation: 7,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
});