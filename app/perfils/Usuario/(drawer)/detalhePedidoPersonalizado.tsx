import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";

export default function DetalhePedidoPersonalizado() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [pedido, setPedido] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchPedido() {
      try {
        const res = await fetch(`http://localhost:8081/pedidos-personalizados/${id}`);
        const data = await res.json();
        setPedido(data);
      } catch (error) {
        setPedido(null);
      } finally {
        setLoading(false);
      }
    }
    fetchPedido();
  }, [id]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
        <Text>Carregando detalhes...</Text>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pedido não encontrado.</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={{ color: "#007bff" }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Detalhes do Pedido Personalizado</Text>
      <Text style={styles.label}>Cliente: <Text style={styles.value}>{pedido.cliente?.nome || pedido.clienteId}</Text></Text>
      <Text style={styles.label}>Confeiteira: <Text style={styles.value}>{pedido.confeiteira?.nomeloja || pedido.confeiteiraId}</Text></Text>
      <Text style={styles.label}>Tipo de Massa: <Text style={styles.value}>{pedido.massa}</Text></Text>
      <Text style={styles.label}>Recheio: <Text style={styles.value}>{pedido.recheio}</Text></Text>
      <Text style={styles.label}>Cobertura: <Text style={styles.value}>{pedido.cobertura}</Text></Text>
      <Text style={styles.label}>Camadas: <Text style={styles.value}>{pedido.camadas}</Text></Text>
      <Text style={styles.label}>Topo personalizado: <Text style={styles.value}>{pedido.topo ? "Sim" : "Não"}</Text></Text>
      <Text style={styles.label}>Observações: <Text style={styles.value}>{pedido.observacoes || "Nenhuma"}</Text></Text>
      <Text style={styles.label}>Data de Entrega: <Text style={styles.value}>{new Date(pedido.dataEntrega).toLocaleDateString()}</Text></Text>
      <Text style={styles.label}>Hora de Entrega: <Text style={styles.value}>{pedido.horaEntrega}</Text></Text>
      <Text style={styles.label}>Status: <Text style={styles.value}>{pedido.status}</Text></Text>
      <TouchableOpacity style={styles.botao} onPress={() => router.back()}>
        <Text style={styles.botaoTexto}>Voltar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: "#fff", flexGrow: 1 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16, textAlign: "center" },
  label: { fontWeight: "bold", marginTop: 10 },
  value: { fontWeight: "normal" },
  botao: { backgroundColor: "#ff69b4", padding: 14, borderRadius: 8, alignItems: "center", marginTop: 20 },
  botaoTexto: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
});