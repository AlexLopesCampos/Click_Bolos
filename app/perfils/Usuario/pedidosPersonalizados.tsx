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

    // Busca o id do cliente logado
    const clienteId = await AsyncStorage.getItem("clienteId");
    if (!clienteId) {
      Alert.alert("Erro", "Usuário não identificado.");
      return;
    }

    try {
      const dataEntregaISO = dataEntrega.toISOString();
      const horaEntregaStr = `${horaEntrega.getHours().toString().padStart(2, "0")}:${horaEntrega.getMinutes().toString().padStart(2, "0")}`;

      console.log({
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
      });

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

    console.log({ clienteId, confeiteiraId: id, massa, recheio, cobertura, camadas: numCamadas, topo, observacoes, dataEntrega, horaEntrega });
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <TouchableOpacity
        style={{ marginBottom: 16, alignSelf: "flex-start", padding: 8 }}
        onPress={() => router.back()}
      >
        <Text style={{ color: "#007bff", fontWeight: "bold" }}>← Voltar para o perfil</Text>
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
        <Picker
          selectedValue={recheio}
          onValueChange={setRecheio}
          style={styles.picker}
        >
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
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDate(true)}
        >
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

      <Text style={styles.label}>Hora de Entrega</Text>
      {Platform.OS === "web" ? (
        <input
          type="time"
          value={
            horaEntrega
              ? `${horaEntrega.getHours().toString().padStart(2, "0")}:${horaEntrega.getMinutes().toString().padStart(2, "0")}`
              : ""
          }
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
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowHora(true)}
        >
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
  container: { padding: 16, backgroundColor: "#fff", flexGrow: 1 },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  label: { fontWeight: "bold", marginTop: 12 },
  opcoes: { flexDirection: "row", flexWrap: "wrap", marginVertical: 6 },
  opcao: { padding: 8, borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginRight: 8, marginBottom: 8 },
  opcaoSelecionada: { backgroundColor: "#ffe4e1", borderColor: "#ff69b4" },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 8, marginTop: 4, marginBottom: 8 },
  botao: { backgroundColor: "#ff69b4", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  pickerBox: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 8 },
  picker: { height: 44, width: "100%" },
})