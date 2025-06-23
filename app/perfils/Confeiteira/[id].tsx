import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, Image, Platform, Pressable, ScrollView, Text, TextInput, View, StyleSheet } from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function Perfil() {
  const [nomeloja, setNomeloja] = useState("");
  const [horarioInicio, setHorarioInicio] = useState("");
  const [horarioFim, setHorarioFim] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [descricao, setDescricao] = useState("");
  const [modoEdicao, setModoEdicao] = useState(false);
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);
  const { id } = useLocalSearchParams();

  interface Bolo {
    nome: string;
    descricao: string;
    preco: string;
    sabor: string;
    tipo: string;
    imagem: string;
  }

  const [catalogo, setCatalogo] = useState<Bolo[]>([]);
  const router = useRouter();
  const onPress = () => router.push(`/perfils/Confeiteira/Adicionar_novo_bolo?id=${id}`);

  const validarHorario = (horario: string) => {
    const regex = /^(0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;
    return regex.test(horario);
  };

  useEffect(() => {
    const buscarDadosConfeiteira = async () => {
      try {
        const perfilResponse = await fetch(`http://localhost:8081/confeiteira/${id}`);
        const perfilData = await perfilResponse.json();
        setNomeloja(perfilData.nomeloja || "");
        setHorarioInicio(perfilData.horarioInicio || "");
        setHorarioFim(perfilData.horarioFim || "");
        setDescricao(perfilData.descricao || "");
        setImagem(perfilData.imagem ? `http://localhost:8081${perfilData.imagem}` : null);

        const catalogoResponse = await fetch(`http://localhost:8081/confeiteira/${id}/catalogo`);
        const catalogoData = await catalogoResponse.json();
        setCatalogo(Array.isArray(catalogoData) ? catalogoData : []); // <-- ajuste aqui
      } catch (error) {
        console.error("Erro ao buscar dados da confeiteira:", error);
      }
    };
    buscarDadosConfeiteira();
  }, []);

  const selecionarImagem = async () => {
    if (Platform.OS === "web") {
      alert("Use o campo abaixo para selecionar uma imagem no ambiente web.");
      return;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!modoEdicao) {
      alert("Ative o modo de edição para selecionar uma imagem.");
      return;
    }
    if (status !== "granted") {
      alert("Permissão para acessar a galeria é necessária!");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: "images",
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImagem(result.assets[0].uri);
    }
  };

  const salvarPerfil = async () => {
    if (!validarHorario(horarioInicio) || !validarHorario(horarioFim)) {
      alert("Horário inválido. O horário deve estar no formato HH:MM.");
      return;
    }

    const formData = new FormData();
    formData.append("nomeloja", nomeloja);
    formData.append("horarioInicio", horarioInicio);
    formData.append("horarioFim", horarioFim);
    formData.append("descricao", descricao);

    if (Platform.OS === "web" && imagemArquivo) {
      formData.append("imagem", imagemArquivo);
    } else if (imagem && !imagem.startsWith("http")) {
      const filename = imagem.split("/").pop();
      const match = /\.(\w+)$/.exec(filename ?? "");
      const type = match ? `image/${match[1]}` : `image`;
      formData.append("imagem", {
        uri: imagem,
        name: filename ?? "photo.jpg",
        type: type,
      } as any);
    }

    try {
      const response = await fetch(`http://localhost:8081/confeiteira/${id}`, {
        method: "PUT",
        body: formData,
      });
      if (!response.ok) throw new Error("Erro ao salvar perfil");
      alert("Perfil salvo com sucesso!");
      setModoEdicao(false);
    } catch (error) {
      console.error("Erro ao salvar perfil:", error);
      alert("Erro ao salvar perfil. Tente novamente.");
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        {Platform.OS === "web" && modoEdicao ? (
          <input type="file" accept="image/*" onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              setImagemArquivo(file);
              const reader = new FileReader();
              reader.onload = () => setImagem(reader.result as string);
              reader.readAsDataURL(file);
            }
          }} />
        ) : (
          <Pressable onPress={selecionarImagem}>
            {imagem ? (
              <Image source={{ uri: imagem }} style={styles.profileImage} />
            ) : (
              <Text style={styles.label}>Selecionar imagem</Text>
            )}
          </Pressable>
        )}

        <TextInput
          value={nomeloja}
          onChangeText={setNomeloja}
          placeholder="Nome da Loja"
          editable={modoEdicao}
          style={styles.input}
        />
        <TextInput
          value={horarioInicio}
          onChangeText={(text) => {
            let cleaned = text.replace(/\D/g, "");
            if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
            let formatted = cleaned;
            if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ":" + cleaned.slice(2);
            setHorarioInicio(formatted);
          }}
          placeholder="Horário de Abertura"
          keyboardType="numeric"
          editable={modoEdicao}
          style={styles.input}
        />
        <TextInput
          value={horarioFim}
          onChangeText={(text) => {
            let cleaned = text.replace(/\D/g, "");
            if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
            let formatted = cleaned;
            if (cleaned.length > 2) formatted = cleaned.slice(0, 2) + ":" + cleaned.slice(2);
            setHorarioFim(formatted);
          }}
          placeholder="Horário de Fechamento"
          keyboardType="numeric"
          editable={modoEdicao}
          style={styles.input}
        />
        <TextInput
          value={descricao}
          onChangeText={setDescricao}
          placeholder="Descrição da Loja"
          multiline
          editable={modoEdicao}
          style={[styles.input, { height: 80 }]}
        />
        <Pressable
          style={styles.button}
          onPress={modoEdicao ? salvarPerfil : () => setModoEdicao(!modoEdicao)}
        >
          <Text style={styles.buttonText}>{modoEdicao ? "Salvar" : "Editar Perfil"}</Text>
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Catálogo</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {catalogo.map((bolo, index) => (
            <View key={index} style={styles.card}>
              <Image source={{ uri: bolo.imagem }} style={styles.cardImage} />
              <Text style={styles.cardText}>🍰 {bolo.nome}</Text>
              <Text style={styles.cardText}>📄 {bolo.descricao}</Text>
              <Text style={styles.cardText}>💰 {bolo.preco}</Text>
              <Text style={styles.cardText}>🎂 {bolo.sabor}</Text>
              <Text style={styles.cardText}>📦 {bolo.tipo}</Text>
            </View>
          ))}
        </ScrollView>

        <Pressable style={styles.button} onPress={onPress}>
          <Text style={styles.buttonText}>Adicionar Bolo</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffe6f0", // rosa claro escuro
    padding: 20,
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  label: {
    color: "#8B4513",
    textAlign: "center",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginVertical: 5,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  button: {
    backgroundColor: "#8B4513", // marrom chocolate
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  profileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
    alignSelf: "center",
    marginBottom: 15,
    borderWidth: 4,
    borderColor: "#d08fa8",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#8B4513",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fceee3", // tom bege suave
    padding: 10,
    marginRight: 10,
    borderRadius: 12,
    width: 160,
    alignItems: "center",
  },
  cardImage: {
    width: 120,
    height: 80,
    borderRadius: 8,
    marginBottom: 5,
  },
  cardText: {
    fontSize: 12,
    textAlign: "center",
  },
});