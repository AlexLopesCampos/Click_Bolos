import React, { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { FlatList, Pressable, Text, View, ActivityIndicator, StyleSheet, Alert, TouchableOpacity } from "react-native";
import { Ionicons } from '@expo/vector-icons';

export default function MeusPedidos() {
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
    }

    const [pedidos, setPedidos] = useState<Pedido[]>([]);
    const [loading, setLoading] = useState(true);
    const [clienteId, setClienteId] = useState<string | null>(null);

    useEffect(() => {
        AsyncStorage.getItem("clienteId").then((id) => {
            setClienteId(id);
        });
    }, []);

    useEffect(() => {
        if (!clienteId) return;
        async function fetchPedidos() {
            try {
                const response = await fetch(`http://localhost:8081/cliente/${clienteId}/pedidos`);
                const data = await response.json();
                setPedidos(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Erro ao buscar pedidos:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchPedidos();
    }, [clienteId]);

    const excluirPedido = async (id: number | string) => {
        Alert.alert(
            "Excluir Pedido",
            "Você tem certeza que deseja excluir este pedido?",
            [
                { text: "Cancelar", style: "cancel" },
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
                                setPedidos(pedidos.filter(pedido => pedido.id !== id));
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
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff69b4" />
                <Text>Carregando pedidos...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Meus Pedidos</Text>
            <FlatList
                data={pedidos}
                keyExtractor={(item) => item.id.toString()}
                ListEmptyComponent={<Text style={styles.value}>Nenhum pedido encontrado.</Text>}
                renderItem={({ item }) => (
                    <Pressable style={styles.pedidoItem}>
                        <Text style={styles.label}>
                            Pedido Nº: <Text style={styles.value}>{item.NumeroPedido}</Text>
                        </Text>
                        <Text style={styles.label}>
                            Confeiteira: <Text style={styles.value}>{item.nomeConfeiteira || item.confeiteira?.nomeloja || "Desconhecida"}</Text>
                        </Text>
                        <Text style={styles.label}>
                            Data: <Text style={styles.value}>{item.dataPedido ? new Date(item.dataPedido).toLocaleDateString() : ""}</Text>
                        </Text>
                        <Text style={styles.label}>
                            Total: R$ <Text style={styles.value}>{item.valorTotal ? Number(item.valorTotal).toFixed(2) : "0.00"}</Text>
                        </Text>
                        <Text style={styles.label}>
                            Status: <Text style={styles.status}>{item.status}</Text>
                        </Text>
                        <TouchableOpacity
                            style={styles.trashButton}
                            onPress={() => excluirPedido(item.id)}
                        >
                            <Ionicons name="trash" size={24} color="red" />
                        </TouchableOpacity>
                    </Pressable>
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#ffe6f0",
    },
    title: {
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 16,
        color: "#6b1049",
        textAlign: "center",
    },
    pedidoItem: {
        backgroundColor: "#fce7f3",
        padding: 16,
        borderRadius: 12,
        marginBottom: 14,
        borderWidth: 1,
        borderColor: "#a05060",
        elevation: 2,
        position: "relative",
    },
    label: {
        fontWeight: "bold",
        color: "#6b1049",
        marginBottom: 2,
    },
    value: {
        fontWeight: "normal",
        color: "#4a0c34",
    },
    status: {
        fontWeight: "bold",
        marginTop: 4,
        color: "#b35a70",
    },
    trashButton: {
        position: "absolute",
        top: 10,
        right: 10,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#ffe6f0",
    },
});