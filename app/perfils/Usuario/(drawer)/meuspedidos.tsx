import AsyncStorage from "@react-native-async-storage/async-storage";
import { use, useEffect, useState } from "react";
import { FlatList, Pressable, Text, View, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function MeusPedidos(){
    interface Pedido {
        id: number | string;
        NumeroPedido: number | string;
        nomeConfeiteira: string;
        dataPedido: string;
        valorTotal: number;
        status: string;
        confeiteira?: {
            nomeloja?: string;
        };
        // add other properties as needed
    }

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState (true);
    const [clienteId, setClienteId] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("clienteId").then((id) => {
            setClienteId(id);
        });
    }, []);
    useEffect (()=>{
        if(!clienteId) return;
        async function fetchPedidos(){
            try{
                const response = await fetch(`http://localhost:8081/clientes/${clienteId}/pedidos`);
                const data =  await response.json();
                setPedidos(data);
            }catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            }finally{
                setLoading(false);
            }
        }
        fetchPedidos();
    }, [clienteId]);
    if (loading) {
        return(
            <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#ff69b4" />
        <Text>Carregando pedidos...</Text>
      </View>
    );
    }

    const excluirPedido = async (id: number | string) => {
        Alert.alert(
            "Excluir Pedido",
            "Você tem certeza que deseja excluir este pedido?",
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Excluir",
                    onPress: async () => {
                        try {
                            const response = await fetch(`http://localhost:8081/pedidos/${id}`, {
                                method: "DELETE"
                            });
                            if (response.status === 204) {
                                setPedidos(pedidos.filter(pedido => pedido.id !== id));
                                Alert.alert("Sucesso", "Pedido excluído com sucesso.");
                            } else if (response.status === 404) {
                                Alert.alert("Aviso", "Este pedido já foi removido ou não existe.");
                                setPedidos(pedidos.filter(pedido => pedido.id !== id)); // Remove da tela mesmo assim
                            } else {
                                Alert.alert("Erro", "Não foi possível excluir o pedido.");
                            }
                        } catch (error) {
                            console.error("Erro ao excluir pedido:", error);
                            Alert.alert("Erro", "Ocorreu um erro ao excluir o pedido.");
                        }
                    }
                }
            ]
        )
    }

    return(
        <View>
            <View style={{ alignItems: "center", marginVertical: 10 }}>
  <Text style={styles.title}>Meus Pedidos</Text>
</View>
            <View>
                <FlatList
                data = {pedidos}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({item})=>(
                     <Pressable style={styles.pedidoItem}>
            <Text style={styles.label}>Pedido Nº: <Text style={styles.value}>{item.NumeroPedido}</Text></Text>
            <Text style={styles.label}>Confeiteira: <Text style={styles.value}>{item.nomeConfeiteira || item.confeiteira?.nomeloja || "Desconhecida"}</Text></Text>
            <Text style={styles.label}>Data: <Text style={styles.value}>{item.dataPedido ? new Date(item.dataPedido).toLocaleDateString() : ""}</Text></Text>
            <Text style={styles.label}>Total: R$ <Text style={styles.value}>{item.valorTotal ? item.valorTotal.toFixed(2) : "0.00"}</Text></Text>
            <Text style={styles.label}>Status: <Text style={styles.value}>{item.status}</Text></Text>
            <TouchableOpacity
    style={{ position: "absolute", top: 10, right: 10 }}
    onPress={() => excluirPedido(item.id)}
  >
    <Ionicons name="trash" size={24} color="red" />
  </TouchableOpacity>
          </Pressable>
        )}/>
            </View>
        </View>
    )
}
const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  pedidoItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    marginBottom: 10,
    borderRadius: 10,
    elevation: 2,
  },
  label: {
    fontWeight: '600',
    marginBottom: 4,
  },
  value: {
    fontWeight: 'normal',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});