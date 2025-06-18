import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Text, TouchableOpacity, View, StyleSheet, FlatList } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Pedidos() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [quantidadeKg, setQuantidadeKg] = useState(1);
  const [formadepagamento, setFormaDePagamento] = useState("");
  const [endereco, setEndereco] = useState<string | null>(null);
  const [dataEntrega, setDataEntrega] = useState(new Date());
  const [valorTotal, setValorTotal] = useState(0);
  const [bolo, setBolo] = useState<{
    nome: string;
    preco: number;
    nomeConfeiteira: string;
    confeiteiraId: number;
    id: number;
  } | null>(null);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [pedidosPersonalizados, setPedidosPersonalizados] = useState<any[]>([]);

  useEffect(() => {
    const fetchBolo = async () => {
      try {
        const response = await fetch(`http://localhost:8081/bolo/${id}`);
        const data = await response.json();
        setBolo(data);
        setValorTotal(data.preco);
      } catch (error) {
        Alert.alert("Erro", "Erro ao buscar dados do bolo");
      }
    };

    if (id) fetchBolo();
  }, [id]);

  useEffect(() => {
    const fetchEndereco = async () => {
      try {
        const clienteId = await AsyncStorage.getItem("clienteId");
        if (!clienteId) return;

        const response = await fetch(`http://localhost:8081/cliente/${clienteId}/endereco`);
        const enderecoTexto = await response.text();
        setEndereco(enderecoTexto);
      } catch (error) {
        Alert.alert("Erro", "Erro ao buscar endereço do cliente");
      }
    };

    fetchEndereco();
  }, []);

  useEffect(() => {
    if (bolo) {
      setValorTotal(bolo.preco * quantidadeKg);
    }
  }, [quantidadeKg, bolo]);

  useEffect(() => {
    const fetchPedidos = async () => {
      const clienteId = await AsyncStorage.getItem("clienteId");
      if (!clienteId) return;

      // Buscar pedidos normais
      const pedidosRes = await fetch(`http://localhost:8081/cliente/${clienteId}/pedidos`);
      const pedidosData = await pedidosRes.json();

      // Buscar pedidos personalizados
      const personalizadosRes = await fetch(`http://localhost:8081/cliente/${clienteId}/pedidos-personalizados`);
      const personalizadosData = await personalizadosRes.json();

      setPedidos(Array.isArray(pedidosData) ? pedidosData : []);
      setPedidosPersonalizados(Array.isArray(personalizadosData) ? personalizadosData : []);
    };

    fetchPedidos();
  }, []);

  const aumentarKg = () => setQuantidadeKg((prev) => prev + 1);
  const diminuirKg = () => {
    if (quantidadeKg > 1) setQuantidadeKg((prev) => prev - 1);
  };

  const hoje = new Date();
  const entregaHoje = dataEntrega.toDateString() === hoje.toDateString();

  const gerarNumeroPedido = () => {
    const timestamp = Date.now();
    const aleatorio = Math.floor(Math.random() * 1000);
    return parseInt(`${timestamp}${aleatorio}`.slice(-9)); // Retorna como número (int), limitando o tamanho
  };

  const ConfirmarPedidos = async () => {
    const NumeroPedido = gerarNumeroPedido();
    const clienteId = await AsyncStorage.getItem("clienteId");

    if (!formadepagamento) {
      Alert.alert("Atenção", "Escolha a Forma de pagamento.");
      return;
    }

    if (!clienteId || !bolo || !endereco) {
      Alert.alert("Erro", "Dados incompletos para realizar o pedido.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8081/pedidos", {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          NumeroPedido,
          nomeConfeiteira: bolo.nomeConfeiteira || "Confeiteira Padrão",
          endereco,
          dataPedido: new Date(),
          valorTotal,
          status: "Pendente",
          pagamento: formadepagamento,
          confeiteiraId: bolo.confeiteiraId,
          clienteId: parseInt(clienteId),
          itens: [
            {
              boloId: bolo.id,
              quantidade: quantidadeKg,
              preco_unitario: bolo.preco
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert("Pedido Enviado", `Número do Pedido: ${data.NumeroPedido}`);
        router.push("./(drawer)/index");
      } else {
        const errorData = await response.json();
        Alert.alert("Erro", errorData.message || "Erro ao enviar o pedido.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Erro ao enviar o pedido.");
    }
  };

  // Unir os dois arrays para exibir juntos
  const todosPedidos = [
    ...pedidos.map(p => ({ ...p, tipo: "normal" })),
    ...pedidosPersonalizados.map(p => ({ ...p, tipo: "personalizado" })),
  ];

  return (
    <View style={styles.container}>
      {bolo ? (
        <>
          <Text style={styles.titulo}>{bolo.nome}</Text>
          <Text style={styles.valor}>Preço por Kg: R$ {bolo.preco.toFixed(2)}</Text>

          <Text style={styles.label}>Quantidade (Kg):</Text>
          <View style={styles.kgContainer}>
            <Button title="-" onPress={diminuirKg} />
            <Text style={styles.kgText}>{quantidadeKg} Kg</Text>
            <Button title="+" onPress={aumentarKg} />
          </View>

          <Text style={styles.valor}>Valor total: R$ {valorTotal.toFixed(2)}</Text>

          <Text style={styles.label}>Forma de Pagamento:</Text>
          {["Pix", "Crédito", "Débito", "Dinheiro"].map((forma) => (
            <TouchableOpacity key={forma} onPress={() => setFormaDePagamento(forma)}>
              <Text style={{ color: formadepagamento === forma ? "blue" : "black" }}>
                {formadepagamento === forma ? "• " : ""}{forma}
              </Text>
            </TouchableOpacity>
          ))}

          <Text style={styles.label}>Endereço de entrega:</Text>
          {endereco ? (
            <Text style={styles.endereco}>{endereco}</Text>
          ) : (
            <Text>Carregando endereço...</Text>
          )}

          <Text style={styles.label}>Data de Entrega:</Text>
          <DateTimePicker
            value={dataEntrega}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={(event, selectedDate) => {
              if (selectedDate) setDataEntrega(selectedDate);
            }}
          />

          {entregaHoje && (
            <Text style={{ color: "red", marginTop: 10 }}>
              Entrega para hoje! Será necessário confirmar disponibilidade com a confeiteira.
            </Text>
          )}

          <View style={{ marginTop: 20 }}>
            <Button
              title="Confirmar Pedido"
              onPress={ConfirmarPedidos}
            />
          </View>

          <View style={{ marginTop: 10 }}>
            <Button
              title="Cancelar"
              onPress={() => router.push("./(drawer)/index")}
              color="gray"
            />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.titulo}>Meus Pedidos</Text>
          <FlatList
            data={todosPedidos}
            keyExtractor={item => `${item.tipo}-${item.id}`}
            renderItem={({ item }) => (
              <View style={styles.pedidoBox}>
                <Text style={styles.label}>
                  Pedido Nº: <Text style={styles.valor}>{item.NumeroPedido || item.id}</Text>
                </Text>
                <Text style={styles.label}>
                  Tipo: <Text style={styles.valor}>{item.tipo === "personalizado" ? "Personalizado" : "Normal"}</Text>
                </Text>
                <Text style={styles.label}>
                  Status: <Text style={styles.valor}>{item.status}</Text>
                </Text>
                {/* Adicione mais campos conforme necessário */}
              </View>
            )}
            ListEmptyComponent={<Text>Nenhum pedido encontrado.</Text>}
          />
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  titulo: { fontSize: 22, fontWeight: "bold" },
  valor: { fontSize: 16, marginVertical: 5 },
  kgContainer: { flexDirection: "row", alignItems: "center", gap: 15, marginVertical: 10 },
  kgText: { fontSize: 18 },
  label: { fontSize: 16, fontWeight: "bold", marginTop: 10 },
  endereco: { marginVertical: 5, fontSize: 16 },
  pedidoBox: { backgroundColor: "#f9f9f9", padding: 12, borderRadius: 8, marginBottom: 12 },
});
