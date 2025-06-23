import React, { useEffect, useState } from "react";
import {
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";

type Confeiteira = {
  id: number;
  nome: string;
  imagem?: string;
};

type Cliente = {
  nome: string;
  favoritos: { confeiteira: Confeiteira }[];
};

export default function Perfil() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const buscarCliente = async () => {
      try {
        const userId = await AsyncStorage.getItem("clienteId");
        if (!userId) {
          setLoading(false);
          return;
        }
        const response = await fetch(`http://localhost:8081/cliente/${userId}`);
        const data = await response.json();
        setCliente(data);
      } catch (error) {
        console.error("Erro ao buscar dados do cliente:", error);
      } finally {
        setLoading(false);
      }
    };

    buscarCliente();
  }, [id]);

  if (loading) {
    return <Text style={styles.loadingText}>Carregando seu perfil...</Text>;
  }

  if (!cliente) {
    return <Text style={styles.loadingText}>Usuário não encontrado.</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Olá, {cliente.nome}!💜</Text>
      <Text style={styles.subTitle}>Aqui esta oque vc amou:</Text>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        {cliente.favoritos?.length ? (
          cliente.favoritos.map((fav, idx) => (
            <Pressable
              key={fav.confeiteira.id ?? idx}
              onPress={() =>
                router.push({
                  pathname: "/perfils/Usuario/(drawer)/perfilConfeteira",
                  params: { id: String(fav.confeiteira.id) },
                })
              }
              style={styles.card}
            >
              <ImageBackground
                source={{ uri: `http://localhost:8081${fav.confeiteira.imagem}` }}
                style={styles.image}
                imageStyle={styles.imageStyle}
              >
                <View style={styles.overlay}>
                  <Text style={styles.cardTitle}>{fav.confeiteira.nome}</Text>
                </View>
              </ImageBackground>
            </Pressable>
          ))
        ) : (
          <Text style={styles.emptyText}>Você ainda não marcou favoritos. 💜</Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f3fc", // lilás bem claro
    padding: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6A1B9A", // roxo principal
    marginBottom: 4,
    textAlign: "center",
  },
  subTitle: {
    fontSize: 16,
    color: "#8e24aa",
    textAlign: "center",
    marginBottom: 20,
  },
  scrollArea: {
    paddingBottom: 20,
  },
  card: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#E1BEE7",
    elevation: 3, // sombra no Android
    shadowColor: "#000", // sombra no iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  image: {
    height: 180,
    justifyContent: "flex-end",
  },
  imageStyle: {
    opacity: 0.75,
  },
  overlay: {
    backgroundColor: "rgba(106, 27, 154, 0.6)",
    padding: 12,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    textShadowColor: "#000",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  emptyText: {
    textAlign: "center",
    color: "#9e9e9e",
    fontStyle: "italic",
    fontSize: 16,
  },
  loadingText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
    color: "#6A1B9A",
  },
});