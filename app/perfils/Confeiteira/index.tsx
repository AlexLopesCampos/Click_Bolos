import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

type Pedido = {
  id: number;
  NumeroPedido?: number;
  status?: string;
  cliente?: {
    nome?: string;
  };
  personalizado?: boolean;
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
  const [busca, setBusca] = useState("");
  const [filtroPersonalizado, setFiltroPersonalizado] = useState<null | boolean>(null);
  const router = useRouter();

  useEffect(() => {
    const buscarPedidos = async () => {
      const confeiteiraId = await AsyncStorage.getItem("confeiteiraId");
      if (!confeiteiraId) return;

      // Busca pedidos normais
      const normaisRes = await fetch(`http://localhost:8081/confeiteira/${confeiteiraId}/pedidos`);
      const normais = await normaisRes.json();

      // Busca pedidos personalizados
      const personalizadosRes = await fetch(`http://localhost:8081/confeiteira/${confeiteiraId}/pedidos-personalizados`);
      const personalizados = await personalizadosRes.json();

      setPedidos(Array.isArray(normais) ? normais : []);
      setPedidosPersonalizados(Array.isArray(personalizados) ? personalizados : []);
    };
    buscarPedidos();
  }, []);

  // Junta os dois arrays e marca o tipo
  const todosPedidos: Pedido[] = [
    ...pedidos.map(p => ({ ...p, personalizado: false })),
    ...pedidosPersonalizados.map(p => ({ ...p, personalizado: true })),
  ];

  // Filtro dos pedidos
  const pedidosFiltrados = todosPedidos.filter(item => {
    const buscaNumero = busca.trim() === "" || (item.NumeroPedido?.toString().includes(busca.trim()) ?? false);
    const buscaPersonalizado =
      filtroPersonalizado === null ||
      (!!item.personalizado === filtroPersonalizado);
    return buscaNumero && buscaPersonalizado;
  });

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
      <Text style={styles.titulo}>Pedidos Recebidos</Text>
      {/* Campo de busca */}
      <TextInput
        style={styles.input}
        placeholder="Buscar pelo número do pedido..."
        value={busca}
        onChangeText={setBusca}
        keyboardType="numeric"
        placeholderTextColor="#b07080"
      />
      <View style={{ flexDirection: "row", marginBottom: 10 }}>
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtroPersonalizado === null && styles.filtroBtnAtivo,
          ]}
          onPress={() => setFiltroPersonalizado(null)}
        >
          <Text style={filtroPersonalizado === null ? styles.filtroBtnTextAtivo : styles.filtroBtnText}>
            Todos
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtroPersonalizado === true && styles.filtroBtnAtivo,
          ]}
          onPress={() => setFiltroPersonalizado(true)}
        >
          <Text style={filtroPersonalizado === true ? styles.filtroBtnTextAtivo : styles.filtroBtnText}>
            Personalizados
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.filtroBtn,
            filtroPersonalizado === false && styles.filtroBtnAtivo,
          ]}
          onPress={() => setFiltroPersonalizado(false)}
        >
          <Text style={filtroPersonalizado === false ? styles.filtroBtnTextAtivo : styles.filtroBtnText}>
            Não personalizados
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={item => item.id?.toString() ?? Math.random().toString()}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.pedidoBox}
            onPress={() => router.push(`/perfils/Confeiteira/pedidosClie?id=${item.id}`)}
          >
            <Text style={styles.label}>
              Pedido Nº: <Text style={styles.valor}>{item.NumeroPedido ?? item.id}</Text>
            </Text>
            <Text style={styles.label}>
              Cliente: <Text style={styles.valor}>{item.cliente?.nome || "Desconhecido"}</Text>
            </Text>
            <Text style={styles.label}>
              Status: <Text style={[styles.valor, getStatusStyle(item.status)]}>{item.status || "Desconhecido"}</Text>
            </Text>
            <Text style={styles.label}>
              {item.personalizado ? "Personalizado" : "Não personalizado"}
            </Text>
            <Text style={styles.link}>Ver detalhes</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text>Nenhum pedido encontrado.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#ffe6f0" }, // rosa claro de fundo
  titulo: { fontSize: 22, fontWeight: "bold", marginBottom: 16, color: "#6b1049" }, // rosa escuro
  input: { 
    borderWidth: 1, 
    borderColor: "#b07080", // rosa médio 
    borderRadius: 8, 
    padding: 8, 
    marginBottom: 10,
    backgroundColor: "#fff0f6", // rosa bem clarinho
    color: "#6b1049", // texto rosa escuro
  },
  pedidoBox: { 
    backgroundColor: "#fce7f3", // rosa bem clarinho
    padding: 12, 
    borderRadius: 8, 
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#a05060", // marrom avermelhado
  },
  label: { fontWeight: "bold", color: "#6b1049" }, // rosa escuro
  valor: { fontWeight: "normal", color: "#4a0c34" }, // rosa escuro mais suave
  link: { color: "#7a4035", marginTop: 8, fontWeight: "bold" }, // marrom
  pendente: { color: "#b35a70" }, // rosa meio marrom
  producao: { color: "#6b1049" }, // rosa escuro
  entregue: { color: "#7a4035" }, // marrom
  cancelado: { color: "#552222" }, // marrom escuro
  filtroBtn: { 
    padding: 8, 
    borderWidth: 1, 
    borderColor: "#7a4035", // marrom
    borderRadius: 8, 
    marginRight: 8,
    backgroundColor: "#f9d6e0", // rosa claro no botão
  },
  filtroBtnAtivo: { 
    backgroundColor: "#7a4035", // marrom escuro quando ativo
  },
  filtroBtnText: {
    color: "#7a4035", // marrom
    fontWeight: "bold",
  },
  filtroBtnTextAtivo: {
    color: "#fff", // branco para texto ativo
    fontWeight: "bold",
  },
});