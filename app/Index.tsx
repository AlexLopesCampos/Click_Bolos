import { useRouter } from "expo-router";
import { Button, View, Text, StyleSheet, TouchableOpacity, Linking } from "react-native";

export default function Index() {
  const router = useRouter();

  const abrirInstagram = () => {
    Linking.openURL("https://www.instagram.com/clickboloss?igsh=MTR4YTQ2bGJscXNseQ==");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>🎂🤎</Text>
      <Text style={styles.title}>CLICK BOLOS</Text>
      <Text style={styles.subtitle}>O bolo perfeito a um CLICK🖱 de distancia📍</Text>
      <Text style={styles.subtitle}>Feitos com amor para cada ocasião❤</Text>

      <View style={styles.features}>
        <Text style={styles.featureItem}>✔️ Entrega rápida e segura</Text>
        <Text style={styles.featureItem}>🎂 Bolos personalizados</Text>
        <Text style={styles.featureItem}>💳 Pagamento facilitado</Text>
      </View>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#A0522D" }]} // Botão marrom
          onPress={() => router.push('../Registros/logins')}
        >
          <Text style={styles.buttonText}>Já sou cliente</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#F472B6" }]} // Rosa
          onPress={() => router.push('../Registros/Registro')}
        >
          <Text style={styles.buttonText}>Quero me cadastrar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={abrirInstagram}>
        <Text style={styles.footer}>📷 Siga-nos no Instagram @clickboloss</Text>
      </TouchableOpacity>

      <Text style={styles.version}>v1.0.0</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFE4F1",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  logo: {
    fontSize: 64,
    marginBottom: 8,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#6A0DAD",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4B0082", // índigo escuro
    marginBottom: 8,
    letterSpacing: 0.5,
    textAlign: "center",
    textShadowColor: "rgba(75, 0, 130, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 3,
  },
  features: {
    marginBottom: 30,
    alignItems: "center",
  },
  featureItem: {
    fontSize: 14,
    color: "#7C3AED",
    marginVertical: 2,
  },
  buttonGroup: {
    width: "100%",
    alignItems: "center",
    gap: 12,
    marginBottom: 30,
  },
  button: {
    width: "70%",
    paddingVertical: 12,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#000",
    elevation: 2,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  footer: {
    fontSize: 12,
    color: "#A21CAF",
    marginTop: 10,
    textDecorationLine: "underline",
  },
  version: {
    position: "absolute",
    bottom: 10,
    fontSize: 12,
    color: "#999",
  },
});