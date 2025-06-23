import React, { useState } from "react";
import {
  Platform,
  Alert,
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  ScrollView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function AdicionarBolos() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [nomeBolo, setNomeBolo] = useState("");
  const [descricaoBolo, setDescricaoBolo] = useState("");
  const [imagem, setImagem] = useState<string | null>(null);
  const [valorBolo, setValorBolo] = useState("");
  const [pesoBolo, setPesoBolo] = useState("");
  const [saborBolo, setSaborBolo] = useState("");
  const [imagemArquivo, setImagemArquivo] = useState<File | null>(null);

  const selecionarImagem = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      const uri = result.assets[0].uri;
      setImagem(uri);
    }
  };

  const handleFileInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImagemArquivo(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagem(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const adicionarBolo = async () => {
    if (!nomeBolo || !descricaoBolo || !imagem || !valorBolo || !pesoBolo || !saborBolo) {
      alert("Preencha todos os campos e selecione uma imagem!");
      return;
    }

    const formData = new FormData();
    formData.append("nome", nomeBolo);
    formData.append("descricao", descricaoBolo);
    formData.append("preco", valorBolo);
    formData.append("peso", pesoBolo);
    formData.append("sabor", saborBolo);
    const confeiteiraId = Array.isArray(id) ? id[0] : id;
    if (!confeiteiraId || isNaN(Number(confeiteiraId))) {
      alert("ID da confeiteira inválido!");
      return;
    }
    formData.append("confeiteiraId", confeiteiraId.toString());

    if (Platform.OS === "web") {
      if (imagemArquivo) {
        formData.append("imagem", imagemArquivo);
      } else {
        alert("Selecione uma imagem!");
        return;
      }
    } else {
      if (imagem) {
        const filename = imagem.split("/").pop();
        const match = /\.(\w+)$/.exec(filename ?? "");
        const type = match ? `image/${match[1]}` : `image`;

        formData.append("imagem", {
          uri: imagem,
          name: filename ?? "photo.jpg",
          type: type,
        } as any);
      } else {
        alert("Selecione uma imagem!");
        return;
      }
    }

    try {
      const response = await fetch(`http://localhost:8081/confeiteira/${id}/bolo`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro do backend:", errorData);
        throw new Error("Erro ao adicionar bolo");
      }

      alert("Bolo adicionado com sucesso!");
      router.push(`./Confeiteira/perfilConfeiteiras/${id}`);
    } catch (error) {
      console.error("Erro ao adicionar bolo:", error);
      alert("Erro ao adicionar bolo.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🍰 Adicione um novo bolo</Text>

      <TextInput
        style={styles.input}
        placeholder="Nome do Bolo"
        value={nomeBolo}
        onChangeText={setNomeBolo}
        placeholderTextColor="#A1887F"
      />
      <TextInput
        style={styles.input}
        placeholder="Descrição do Bolo"
        value={descricaoBolo}
        onChangeText={setDescricaoBolo}
        placeholderTextColor="#A1887F"
      />
      <TextInput
        style={styles.input}
        placeholder="Valor do Bolo (ex: R$ 25,00)"
        value={valorBolo}
        onChangeText={text => setValorBolo(text.replace(/[^0-9R$r$,]/g, ""))}
        keyboardType="default"
        placeholderTextColor="#A1887F"
      />
      <TextInput
        style={styles.input}
        placeholder="Peso do Bolo (ex: 500g, 1kg)"
        value={pesoBolo}
        onChangeText={setPesoBolo}
        keyboardType="default"
        placeholderTextColor="#A1887F"
      />
      <TextInput
        style={styles.input}
        placeholder="Sabor do Bolo"
        value={saborBolo}
        onChangeText={setSaborBolo}
        placeholderTextColor="#A1887F"
      />

      <Text style={styles.imageLabel}>💝Adicione sua nova criação💝</Text>

      {Platform.OS === "web" ? (
        <>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={() => document.getElementById("fileInput")?.click()}
          >
            <Text style={styles.imageButtonText}>Selecionar Imagem 📷</Text>
          </TouchableOpacity>
          <input
            id="fileInput"
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: "none" }}
          />
        </>
      ) : (
        <TouchableOpacity style={styles.imageButton} onPress={selecionarImagem}>
          <Text style={styles.imageButtonText}>Selecionar Imagem</Text>
        </TouchableOpacity>
      )}

      {imagem && (
        <Image
          source={{ uri: imagem }}
          style={{ width: 200, height: 200, borderRadius: 16, marginVertical: 12 }}
        />
      )}

      <TouchableOpacity style={styles.submitButton} onPress={adicionarBolo}>
        <Text style={styles.submitButtonText}>Adicionar Bolo ao Catálogo 🎂</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: "#F8BBD0" }]}
        onPress={() => router.push(`./perfilConfeiteiras/${id}`)}
      >
        <Text style={[styles.submitButtonText, { color: "#6D4C41" }]}>Cancelar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFF0F5",
    flexGrow: 1,
    alignItems: "center",
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#AD1457",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderColor: "#F8BBD0",
    borderWidth: 1.5,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 12,
    color: "#4E342E",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  imageLabel: {
    fontSize: 16,
    color: "#6D4C41",
    marginTop: 20,
    marginBottom: 8,
    textAlign: "center",
    fontWeight: "500",
  },
  imageButton: {
    backgroundColor: "#F48FB1",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 14,
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    minWidth: 200,
  },
  imageButtonText: {
    color: "#4E342E",
    fontSize: 16,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: "#8D4C3F",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 20,
    width: "100%",
    alignItems: "center",
    marginVertical: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  submitButtonText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "bold",
  },
});