import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, View, StyleSheet, TouchableOpacity } from 'react-native';

export default function Registro() {
  const router = useRouter();

  return (
    <View style={style.container}>

      <Text style={style.title}>🤎💗Seja bem-vindo! Novo cliente e nova confeiteira🤎💗</Text>

      <Text style={style.subtitle}>Escolha uma das opções abaixo para fazer parte da nossa Historia</Text>

<TouchableOpacity style={style.button} onPress={() => router.push('/Registros/Registro_confeiteira')}>
        <Text style={style.buttonText}>Confeiteira</Text>
</TouchableOpacity>

      <TouchableOpacity style={style.button} onPress={() => router.push('/Registros/Registro_cliente')}>
        <Text style={style.buttonText}>Cliente</Text>
      </TouchableOpacity>
    </View>
  );
}

//estilo do app

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', // Rosa claro
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#D81B60', // Rosa escuro
    marginBottom: 10,
    textAlign:'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 30,
    textAlign:'center',
  },
  button: {
    backgroundColor: '#D81B60',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    marginVertical: 10,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});