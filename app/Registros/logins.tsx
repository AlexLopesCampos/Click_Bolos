import { useRouter } from "expo-router";
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Index() {
    const router = useRouter();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎂 Bem-vindo! Faça seu login</Text>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/Registros/Login_Confeiteira')}>
                <Text style={styles.buttonText}>Confeiteira</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={() => router.push('/Registros/Login_Cliente')}>
                <Text style={styles.buttonText}>Cliente</Text>
            </TouchableOpacity>

            {/* <TouchableOpacity style={[styles.button, styles.secondaryButton]} onPress={() => router.push('/Registros/Registro')}>
                <Text style={styles.buttonText}>Registrar</Text>
            </TouchableOpacity> */}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFF0F5', // Rosa claro
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
        paddingVertical: 40,
    },
    title: {
        fontSize: 24,
        fontWeight: '700',
        color: '#D81B60',
        textAlign: 'center',
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 16,
        color: '#777',
        textAlign: 'center',
        marginBottom: 28,
    },
    button: {
        backgroundColor: '#D81B60',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 12,
        marginVertical: 8,
        width: '85%',
        alignItems: 'center',
        elevation: 4, // Sombra (Android)
        shadowColor: '#000', // Sombra (iOS)
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
    },
    secondaryButton: {
        backgroundColor: '#C2185B', // Um tom um pouco diferente para o botão de registro
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
});