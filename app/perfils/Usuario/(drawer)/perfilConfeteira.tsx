import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";

export default function PerfilConfeteira() {
  const router = useRouter();
  const { id } = useLocalSearchParams();

  interface Confeiteira {
    id: number;
    imagem: string;
    nome: string;
    horarioInicio: string;
    horarioFim: string;
    descricao: string;
  }

  interface Avaliacao {
    id: number;
    estrelas: number;
    comentario: string | null;
    data: string;
    cliente: {
      nome: string;
    };
  }

  interface Bolo {
    id: number;
    imagem: string;
    nome: string;
    descricao: string;
    preco: number;
  }

  const [confeiteira, setConfeiteira] = useState<Confeiteira | null>(null);
  const [catalogo, setCatalogo] = useState<Bolo[]>([]);
  const [favoritado, setFavoritado] = useState(false);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [comentario, setComentario] = useState("");
  const [estrelas, setEstrelas] = useState(0);

  useEffect(() => {
    if (!id) return;
    const IP = "localhost";

    const buscarConfeiteira = async () => {
      try {
        const response = await fetch(`http://${IP}:8081/confeiteira/${id}`);
        if (!response.ok) throw new Error("Erro ao buscar confeiteira");
        const data = await response.json();
          setConfeiteira({
          ...data,
          imagem: data.imagem
            ? data.imagem.startsWith("http")
              ? data.imagem
              : `http://${IP}:8081${data.imagem}`
            : null,
        });
      } catch (error) {
        console.error("Erro ao buscar confeiteira:", error);
      }
    };

    const buscarCatalogo = async () => {
      try {
        const response = await fetch(`http://${IP}:8081/confeiteira/${id}/catalogo`);
        if (!response.ok) throw new Error("Erro ao buscar catálogo");
        const data = await response.json();
        // Ajuste as URLs das imagens:
        const catalogoComUrl = Array.isArray(data)
          ? data.map((bolo) => ({
              ...bolo,
              imagem: bolo.imagem
                ? bolo.imagem.startsWith("http")
                  ? bolo.imagem
                  : `http://${IP}:8081${bolo.imagem}`
                : null,
            }))
          : [];
        setCatalogo(catalogoComUrl);
      } catch (error) {
        console.error("Erro ao buscar catálogo:", error);
      }
    };

    const buscarAvaliacoes = async () => {
      try {
        const response = await fetch(`http://${IP}:8081/confeiteira/${id}/avaliacoes`);
        if (response.ok) {
          const data = await response.json();
          setAvaliacoes(data);
        }
      } catch (error) {
        console.error("Erro ao buscar avaliações:", error);
      }
    };

    buscarConfeiteira();
    buscarCatalogo();
    buscarAvaliacoes();
  }, [id]);

  useEffect(() => {
    const verificarFavorito = async () => {
      const clienteId = await AsyncStorage.getItem("clienteId");
      if (!clienteId) return;
      try {
        const response = await fetch(`http://localhost:8081/cliente/${clienteId}/favoritos`);
        if (response.ok) {
          const favoritos = await response.json();
          setFavoritado(favoritos.some((fav: any) => String(fav.confeiteiraId) === String(id)));
        }
      } catch (error) {
        setFavoritado(false);
      }
    };
    if (id) verificarFavorito();
  }, [id]);

  if (!confeiteira) return <Text>Carregando...</Text>;

  const alternarFavorito = async () => {
    const clienteId = await AsyncStorage.getItem("clienteId");
    if (!clienteId) {
      Alert.alert("Erro", "Você precisa estar logado para favoritar uma confeiteira");
      return;
    }
    try {
      if (!favoritado) {
        const response = await fetch(`http://localhost:8081/cliente/${clienteId}/favoritos`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ confeiteiraId: Number(id) }),
        });
        if (!response.ok) throw new Error("Erro ao favoritar confeiteira");
        setFavoritado(true);
        Alert.alert("Sucesso", "Confeiteira adicionada aos favoritos");
      } else {
        const response = await fetch(`http://localhost:8081/cliente/${clienteId}/favoritos/${id}`, {
          method: "DELETE",
        });
        if (!response.ok && response.status !== 204) throw new Error("Erro ao remover dos favoritos");
        setFavoritado(false);
        Alert.alert("Removido", "Confeiteira removida dos favoritos!");
      }
    } catch (error) {
      Alert.alert("Erro", "Ocorreu um problema ao alterar favoritos.");
      console.error(error);
    }
  };

  const enviarAvaliacao = async () => {
    const clienteId = await AsyncStorage.getItem("clienteId");
    if (!clienteId) return Alert.alert("Erro", "Você precisa estar logado");

    try {
      const response = await fetch("http://localhost:8081/avaliacoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId: Number(clienteId),
          confeiteiraId: Number(id),
          estrelas,
          comentario,
        }),
      });
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || "Erro ao enviar avaliação");
      }
      Alert.alert("Sucesso", "Avaliação enviada!");
      setComentario("");
      setEstrelas(0);
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error);
      if (error instanceof Error) {
        Alert.alert("Erro", error.message);
      } else {
        Alert.alert("Erro", "Erro ao enviar avaliação");
      }
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={{ uri: confeiteira.imagem }} style={styles.imagem} />
        <Text style={styles.nome}>{confeiteira.nome}</Text>
        <Pressable onPress={alternarFavorito}>
          <Ionicons
            name={favoritado ? "heart" : "heart-outline"}
            size={32}
            color={favoritado ? "#FF4081" : "gray"}
            style={{ marginTop: 10 }}
          />
        </Pressable>
      </View>

      <Text style={styles.horarios}>
        Horários: {confeiteira.horarioInicio} - {confeiteira.horarioFim}
      </Text>
      <Text style={styles.descricao}>{confeiteira.descricao}</Text>

      <TouchableOpacity
        style={{
          backgroundColor: "#ff69b4",
          padding: 12,
          borderRadius: 8,
          alignItems: "center",
          marginVertical: 10,
        }}
        onPress={() => {
          router.push(`/perfils/Usuario/pedidosPersonalizados?id=${confeiteira.id}`);
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "bold" }}>
          Fazer Pedido Personalizado
        </Text>
      </TouchableOpacity>

      <Text style={styles.catalogoTitulo}>Catálogo:</Text>
      {catalogo.length === 0 ? (
        <Text style={styles.semConteudo}>Nenhum bolo cadastrado no catálogo.</Text>
      ) : (
        <View>
          {catalogo.map((item) => (
            <Pressable key={item.id} onPress={() => router.push(`../pedidos?id=${item.id}`)}>
              <View style={styles.item}>
                <Image source={{ uri: item.imagem }} style={styles.itemImagem} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemNome}>{item.nome}</Text>
                  <Text style={styles.itemDescricao}>{item.descricao}</Text>
                  <Text style={styles.itemPreco}>Preço: R$ {item.preco}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </View>
      )}

      <Text style={styles.catalogoTitulo}>Avaliações:</Text>
      {avaliacoes.length === 0 ? (
        <Text style={styles.semConteudo}>Ainda não há avaliações.</Text>
      ) : (
        <FlatList
          data={avaliacoes}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.avaliacaoItem}>
              <Text style={styles.avaliador}>{item.cliente.nome}</Text>
              <Text>⭐ {item.estrelas} estrelas</Text>
              {item.comentario ? <Text>{item.comentario}</Text> : null}
              <Text style={styles.dataComentario}>{new Date(item.data).toLocaleDateString()}</Text>
            </View>
          )}
        />
      )}

      <View style={styles.avaliacaoBox}>
        <Text>Deixe sua avaliação:</Text>
        <View style={styles.estrelas}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Pressable key={n} onPress={() => setEstrelas(n)}>
              <Ionicons name={n <= estrelas ? "star" : "star-outline"} size={24} color="#FFB300" />
            </Pressable>
          ))}
        </View>
        <TextInput
          placeholder="Escreva um comentário (opcional)"
          value={comentario}
          onChangeText={setComentario}
          style={styles.inputComentario}
        />
        <Pressable onPress={enviarAvaliacao} style={styles.botaoEnviar}>
          <Text style={styles.botaoEnviarTexto}>Enviar Avaliação</Text>
        </Pressable>
      </View>
    </View>
  );
}

const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EDE7F6", // lilás clarinho suave
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  imagem: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: "#9575CD", // roxo suave
  },
  nome: {
    fontSize: 26,
    fontWeight: "bold",
    marginTop: 10,
    color: "#6A1B9A", // roxo escuro elegante
  },
  horarios: {
    fontSize: 14,
    color: "#7E57C2", // roxo médio vivo
    textAlign: "center",
  },
  descricao: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 20,
    textAlign: "center",
    color: "#5E35B1", // roxo médio escuro
  },
  catalogoTitulo: {
    fontSize: 20,
    fontWeight: "600",
    marginVertical: 10,
    color: "#7B1FA2", // roxo vibrante forte
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fce7f3",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,

    shadowColor: "#6A1B9A",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,

    borderWidth: 1,
    borderColor: "#a05060",
    minHeight: 200,
    maxHeight: 500,
  },
  itemImagem: {
    width: 200,
    height: 200,
    borderRadius: 12,
    marginRight: 14,
    alignSelf: "center",
    resizeMode: "cover",
    backgroundColor: "#fff0f6",
  },
  itemNome: {
    fontWeight: "bold",
    marginTop: 8,
    color: "#6b1049",
    fontSize: 17,
  },
  itemDescricao: {
    fontSize: 14,
    color: "#6A1B9A", // roxo escuro elegante
  },
  itemPreco: {
    color: "#b35a70",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 4,
  },
  semConteudo: {
    fontStyle: "italic",
    color: "#B39DDB", // lilás claro
    marginBottom: 10,
  },
  avaliacaoItem: {
    marginVertical: 8,
    borderBottomWidth: 1,
    borderColor: "#D1C4E9", // lilás bem claro
    paddingBottom: 8,
  },
  avaliador: {
    fontWeight: "bold",
    color: "#6A1B9A", // roxo escuro elegante
  },
  dataComentario: {
    fontSize: 12,
    color: "#9575CD", // roxo suave
  },
  avaliacaoBox: {
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#D1C4E9", // lilás bem claro
  },
  estrelas: {
    flexDirection: "row",
    marginVertical: 8,
  },
  inputComentario: {
    borderWidth: 1,
    borderColor: "#9575CD", // roxo suave
    padding: 8,
    borderRadius: 6,
    backgroundColor: "#F3E5F5", // lilás bem clarinho
  },
  botaoEnviar: {
    backgroundColor: "#7B1FA2", // roxo vibrante forte
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  botaoEnviarTexto: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
  },
});