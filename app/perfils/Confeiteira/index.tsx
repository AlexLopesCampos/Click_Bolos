import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type PedidoPersonalizado = {
  id: number;
  status?: string;
  massa?: string;
  recheio?: string;
  cobertura?: string;
  camadas?: number;
  topo?: boolean;
  observacoes?: string;
  dataEntrega?: string;
  horaEntrega?: string;
  cliente?: {
    nome?: string;
  };
};

export default function PedidosPersonalizados() {
  const [pedidos, setPedidos] = useState<PedidoPersonalizado[]>([]);
  const router = useRouter();

  useEffect(() => {
    const buscarPedidos = async () => {
      const confeiteiraId = await AsyncStorage.getItem("confeiteiraId");
      if (!confeiteiraId) return;
      fetch(`http://localhost:8081/confeiteira/${confeiteiraId}/pedidos-personalizados`)
        .then(res => res.json())
        .then(data => setPedidos(Array.isArray(data) ? data : []))
        .catch(err => console.error("Erro ao buscar pedidos personalizados:", err));
    };
    buscarPedidos();
  }, []);

  function getStatusStyle(status?: string) {
    switch (status) {
      case "Pendente":
        return styles.pendente;
      case "Em produção":
        return styles.producao;
      case "Entregue":
        return styles.entregue;
      case "Cancelado":
        return styles.cancelado;
      default:
        return {};
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Pedidos Personalizados</Text>
      <FlatList
        data={pedidos}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pedidoBox}
            onPress={() => router.push(`/perfils/Confeiteira/pedidosClie?id=${item.id}`)}
          >
            <Text style={styles.label}>
              Cliente: <Text style={styles.valor}>{item.cliente?.nome || "Desconhecido"}</Text>
            </Text>
            <Text style={styles.label}>
              Status: <Text style={[styles.valor, getStatusStyle(item.status)]}>{item.status || "Desconhecido"}</Text>
            </Text>
            <Text style={styles.label}>
              Massa: <Text style={styles.valor}>{item.massa}</Text>
            </Text>
            <Text style={styles.label}>
              Recheio: <Text style={styles.valor}>{item.recheio}</Text>
            </Text>
            <Text style={styles.label}>
              Cobertura: <Text style={styles.valor}>{item.cobertura}</Text>
            </Text>
            <Text style={styles.label}>
              Data Entrega: <Text style={styles.valor}>{item.dataEntrega ? new Date(item.dataEntrega).toLocaleDateString("pt-BR") : "?"}</Text>
            </Text>
            <Text style={styles.link}>Ver detalhes</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Nenhum pedido personalizado encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  pedidoBox: { backgroundColor: "#f9f9f9", padding: 12, borderRadius: 8, marginBottom: 12 },
  label: { fontWeight: "bold" },
  valor: { fontWeight: "normal" },
  link: { color: "#007bff", marginTop: 8 },
  pendente: { color: "#FFA500" },
  producao: { color: "#007bff" },
  entregue: { color: "#28a745" },
  cancelado: { color: "#dc3545" },
});