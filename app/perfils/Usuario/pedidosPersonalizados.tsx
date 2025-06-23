import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { Text, View, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

const massas = ["Pão de Ló", "Chocolate", "Red Velvet", "Baunilha", "Nozes"];
const recheios = [
  "Brigadeiro", "Doce de Leite", "Ninho", "Morango", "Coco",
  "Mousse de Maracujá", "Mousse de Limão", "Mousse de Chocolate",
  "Mousse de Morango", "Mousse de Leite Ninho", "Nutella",
  "Abacaxi com Coco", "Prestígio", "Beijinho", "Ovomaltine",
  "Trufado", "Nozes", "Amendoim", "Creme Belga", "Ganache", "Outro"
];
const coberturas = ["Chantilly", "Ganache", "Buttercream", "Glacê", "Sem cobertura"];
const camadas = [1, 2, 3, 4, 5];

export default function PedidosPersonalizados() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [massa, setMassa] = useState("");
  const [recheio, setRecheio] = useState("");
  const [cobertura, setCobertura] = useState("");
  const [numCamadas, setNumCamadas] = useState(1);
  const [topo, setTopo] = useState(false);
  const [observacoes, setObservacoes] = useState("");
  const [dataEntrega, setDataEntrega] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [horaEntrega, setHoraEntrega] = useState(new Date());
  const [showHora, setShowHora] = useState(false);

  async function enviarPedido() {
    if (!massa || !recheio || !cobertura) {
      Alert.alert("Preencha todos os campos obrigatórios!");
      return;
    }

    const clienteId = await AsyncStorage.getItem("clienteId");
    if (!clienteId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    try {
      const dataEntregaISO = dataEntrega.toISOString();
      const horaEntregaStr = `${horaEntrega.getHours().toString().padStart(2, "0")}:${horaEntrega.getMinutes().toString().padStart(2, "0")}`;

      const response = await fetch("http://localhost:8081/pedidos-personalizados", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clienteId,
          confeiteiraId: id,
          massa,
          recheio,
          cobertura,
          camadas: numCamadas,
          topo,
          observacoes,
          dataEntrega: dataEntregaISO,
          horaEntrega: horaEntregaStr
        })
      });

      if (response.ok) {
        Alert.alert("Pedido enviado!", "Seu pedido personalizado foi enviado para a confeiteira.");
        router.back();
      } else {
        const erro = await response.json();
        Alert.alert("Erro ao enviar pedido", erro.message || "Tente novamente.");
      }
    } catch (error) {
      Alert.alert("Erro", "Não foi possível enviar o pedido.");
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={{ marginBottom: 16, alignSelf: "flex-start", padding: 8 }}
        onPress={() => router.back()}
      >
        <Text style={{ color: "#7e57c2", fontWeight: "bold" }}>← Voltar para o perfil</Text>
      </TouchableOpacity>

      <Text style={styles.titulo}>Monte seu Bolo Personalizado</Text>

      <Text style={styles.label}>Tipo de Massa *</Text>
      <View style={styles.opcoes}>
        {massas.map((m) => (
          <TouchableOpacity
            key={m}
            style={[styles.opcao, massa === m && styles.opcaoSelecionada]}
            onPress={() => setMassa(m)}
          >
            <Text>{m}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Recheio *</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={recheio} onValueChange={setRecheio} style={styles.picker}>
          <Picker.Item label="Selecione o recheio" value="" />
          {recheios.map((r) => (
            <Picker.Item key={r} label={r} value={r} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Cobertura *</Text>
      <View style={styles.opcoes}>
        {coberturas.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.opcao, cobertura === c && styles.opcaoSelecionada]}
            onPress={() => setCobertura(c)}
          >
            <Text>{c}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Número de Camadas</Text>
      <View style={styles.opcoes}>
        {camadas.map((n) => (
          <TouchableOpacity
            key={n}
            style={[styles.opcao, numCamadas === n && styles.opcaoSelecionada]}
            onPress={() => setNumCamadas(n)}
          >
            <Text>{n}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Deseja topo personalizado?</Text>
      <View style={styles.opcoes}>
        <TouchableOpacity
          style={[styles.opcao, topo && styles.opcaoSelecionada]}
          onPress={() => setTopo(true)}
        >
          <Text>Sim</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.opcao, !topo && styles.opcaoSelecionada]}
          onPress={() => setTopo(false)}
        >
          <Text>Não</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Data de Entrega</Text>
      {Platform.OS === "web" ? (
        <input
          type="date"
          value={dataEntrega.toISOString().split("T")[0]}
          onChange={e => setDataEntrega(new Date(e.target.value))}
          style={{ ...styles.input, width: "100%" }}
        />
      ) : (
        <TouchableOpacity style={styles.input} onPress={() => setShowDate(true)}>
          <Text>{dataEntrega.toLocaleDateString()}</Text>
        </TouchableOpacity>
      )}
      {showDate && Platform.OS !== "web" && (
        <DateTimePicker
          value={dataEntrega}
          mode="date"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowDate(false);
            if (date) setDataEntrega(date);
          }}
        />
      )}

      <Text style={styles.label}>Horario de Entrega</Text>
      {Platform.OS === "web" ? (
        <input
          type="time"
          value={`${horaEntrega.getHours().toString().padStart(2, "0")}:${horaEntrega.getMinutes().toString().padStart(2, "0")}`}
          onChange={e => {
            const [h, m] = e.target.value.split(":");
            const novaHora = new Date(dataEntrega);
            novaHora.setHours(Number(h));
            novaHora.setMinutes(Number(m));
            setHoraEntrega(novaHora);
          }}
          style={{ ...styles.input, width: "100%" }}
        />
      ) : (
        <TouchableOpacity style={styles.input} onPress={() => setShowHora(true)}>
          <Text>
            {horaEntrega.getHours().toString().padStart(2, "0")}:
            {horaEntrega.getMinutes().toString().padStart(2, "0")}
          </Text>
        </TouchableOpacity>
      )}
      {showHora && Platform.OS !== "web" && (
        <DateTimePicker
          value={horaEntrega}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(_, date) => {
            setShowHora(false);
            if (date) setHoraEntrega(date);
          }}
        />
      )}

      <Text style={styles.label}>Observações</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        placeholder="Ex: sem lactose, tema do topo, mensagem especial..."
        value={observacoes}
        onChangeText={setObservacoes}
        multiline
      />

      <TouchableOpacity style={styles.botao} onPress={enviarPedido}>
        <Text style={styles.botaoTexto}>Enviar Pedido</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#fdf6f0", // fundo creme
    flexGrow: 1
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#6A1B9A" // roxo forte
  },
  label: {
    fontWeight: "bold",
    marginTop: 12,
    color: "#6A1B9A",
    fontSize: 16
  },
  opcoes: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 6
  },
  opcao: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#D1B2FF",
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#fff",
    elevation: 1
  },
  opcaoSelecionada: {
    backgroundColor: "#A0522D", // chocolate médio
    borderColor: "#5D3A00" // chocolate escuro
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1B2FF",
    borderRadius: 12,
    padding: 10,
    marginTop: 4,
    marginBottom: 8,
    backgroundColor: "#fff",
    color: "#4E342E",
    fontSize: 16
  },
  botao: {
    backgroundColor: "#4A148C", // sroxo escuro no botão
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3
  },
  botaoTexto: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18
  },
  pickerBox: {
    borderWidth: 1,
    borderColor: "#D1B2FF",
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: "#fff"
  },
  picker: {
    height: 48,
    width: "100%",
    color: "#4E342E",
    fontSize: 16
  }
});