import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Pressable } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Pedido = {
id: number;
tipo?: "normal" | "personalizado";
NumeroPedido?: number;
status?: string;
dataPedido?: string;
valorTotal?: number;
pagamento?: string;
cliente?: {
nome?: string;
endereco?: string;
telefone?: string;
};
itenspedido?: {
bolo?: {
nome?: string;
peso?: number;
preco?: number;
};
quantidade?: number;
}[];
// Campos de personalizado:
massa?: string;
recheio?: string;
cobertura?: string;
camadas?: number;
topo?: boolean;
observacoes?: string;
dataEntrega?: string;
horaEntrega?: string;
};

export default function PedidosClie() {
const [pedidos, setPedidos] = useState<Pedido[]>([]);
const [pedidosPersonalizados, setPedidosPersonalizados] = useState<Pedido[]>([]);
const router = useRouter();

// Defina a função fora do useEffect
async function buscarPedidos() {
const confeiteiraId = await AsyncStorage.getItem("confeiteiraId");
if (!confeiteiraId) return;

// Normais
const resNormais = await fetch(`http://localhost:8081/confeiteira/${confeiteiraId}/pedidos`);
const normais = await resNormais.json();

// Personalizados
const resPers = await fetch(`http://localhost:8081/confeiteira/${confeiteiraId}/pedidos-personalizados`);
const personalizados = await resPers.json();

setPedidos(Array.isArray(normais) ? normais : []);
setPedidosPersonalizados(Array.isArray(personalizados) ? personalizados : []);
}

useEffect(() => {
buscarPedidos();
}, []);

// Junta os dois arrays e marca o tipo
const todosPedidos: Pedido[] = [
  ...pedidos.map(p => ({ ...p, tipo: "normal" as "normal" })),
  ...pedidosPersonalizados.map(p => ({ ...p, tipo: "personalizado" as "personalizado" })),
].sort((a, b) => {
  // Ordena por data (se quiser)
  const dataA = new Date(a.dataPedido || a.dataEntrega || "").getTime();
  const dataB = new Date(b.dataPedido || b.dataEntrega || "").getTime();
  return dataB - dataA;
});

async function atualizarStatus(pedidoId: number, novoStatus: string, tipo: "normal" | "personalizado") {
  try {
    let url = "";
    if (tipo === "normal") {
      url = `http://localhost:8081/pedidos/${pedidoId}/status`;
    } else {
      url = `http://localhost:8081/pedidos-personalizados/${pedidoId}/status`;
    }
    const res = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: novoStatus }),
    });
    if (res.ok) {
      buscarPedidos(); // Agora funciona!
    }
  } catch (err) {
    console.error("Erro ao atualizar status:", err);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  pedidoItem: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#eee",
  },
  label: { fontWeight: "bold" },
  value: { fontWeight: "normal", marginTop: 4 },
});

return (
  <View style={styles.container}>
    <Button title="Voltar" onPress={() => router.back()} />
    <Text style={styles.titulo}>Todos os Pedidos</Text>
    <FlatList
      data={todosPedidos}
      keyExtractor={item => item.id.toString()}
      renderItem={({ item }) => (
        <View style={styles.pedidoItem}>
          <Text style={styles.label}>
            {item.tipo === "personalizado" ? "Pedido Personalizado" : "Pedido Normal"}
          </Text>
          {item.tipo === "personalizado" ? (
            <>
              <Text style={styles.value}>Massa: {item.massa}</Text>
              <Text style={styles.value}>Recheio: {item.recheio}</Text>
              <Text style={styles.value}>Cobertura: {item.cobertura}</Text>
              <Text style={styles.value}>Camadas: {item.camadas}</Text>
              <Text style={styles.value}>Topo: {item.topo ? "Sim" : "Não"}</Text>
              <Text style={styles.value}>Observações: {item.observacoes || "Nenhuma"}</Text>
              <Text style={styles.value}>Data Entrega: {item.dataEntrega ? new Date(item.dataEntrega).toLocaleDateString("pt-BR") : "?"}</Text>
              <Text style={styles.value}>Hora Entrega: {item.horaEntrega}</Text>
              <Text style={styles.value}>Cliente: {item.cliente?.nome || "Desconhecido"}</Text>
              <Text style={styles.value}>Status: {item.status || "Pendente"}</Text>
            </>
          ) : (
            <>
              <Text style={styles.value}>Nº Pedido: {item.NumeroPedido}</Text>
              <Text style={styles.value}>Status: {item.status}</Text>
              <Text style={styles.value}>Data: {item.dataPedido ? new Date(item.dataPedido).toLocaleString("pt-BR") : "?"}</Text>
              <Text style={styles.value}>Cliente: {item.cliente?.nome || "Desconhecido"}</Text>
              <Text style={styles.value}>Valor Total: R$ {item.valorTotal?.toFixed(2) ?? "?"}</Text>
              <Text style={styles.value}>Pagamento: {item.pagamento || "Desconhecido"}</Text>
            </>
          )}
          <View style={{ flexDirection: "row", gap: 8, marginVertical: 8 }}>
            {["Pendente", "Em produção", "Entregue", "Cancelado"].map(status => (
              <Button
                key={status}
                title={status}
                color={
                  status === "Pendente" ? "#FFA500" :
                  status === "Em produção" ? "#007bff" :
                  status === "Entregue" ? "#28a745" :
                  status === "Cancelado" ? "#dc3545" : "#888"
                }
                onPress={() => atualizarStatus(item.id, status, item.tipo!)}
                disabled={item.status === status}
              />
            ))}
          </View>
        </View>
      )}
    />
  </View>
)
}
