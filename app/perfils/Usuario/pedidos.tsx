import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Button, Text, TouchableOpacity, View, StyleSheet } from "react-native";
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

  return (
    <View style={styles.container}>
      {bolo && (
        <>
          <Text style={styles.titulo}>{bolo.nome}</Text>
          <Text style={styles.valor}>Preço por Kg: R$ {bolo.preco.toFixed(2)}</Text>

          <Text style={styles.label}>Quantidade (Kg):</Text>
          <View style={styles.kgContainer}>
            <TouchableOpacity style={styles.kgButton} onPress={diminuirKg}>
              <Text style={styles.kgButtonText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.kgText}>{quantidadeKg} Kg</Text>
            <TouchableOpacity style={styles.kgButton} onPress={aumentarKg}>
              <Text style={styles.kgButtonText}>+</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.valor}>Valor total: R$ {valorTotal.toFixed(2)}</Text>

          <Text style={styles.label}>Forma de Pagamento:</Text>
          <View style={styles.pagamentoContainer}>
            {["Pix", "Crédito", "Débito", "Dinheiro"].map((forma) => (
              <TouchableOpacity
                key={forma}
                style={[
                  styles.pagamentoButton,
                  formadepagamento === forma && styles.pagamentoButtonAtivo,
                ]}
                onPress={() => setFormaDePagamento(forma)}
              >
                <Text
                  style={[
                    styles.pagamentoButtonText,
                    formadepagamento === forma && styles.pagamentoButtonTextAtivo,
                  ]}
                >
                  {forma}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Endereço de entrega:</Text>
          {endereco ? (
            <Text style={styles.endereco}>{endereco}</Text>
          ) : (
            <Text style={{ color: "#5d3a1a" }}>Carregando endereço...</Text>
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
            style={styles.datePicker}
          />

          {entregaHoje && (
            <Text style={styles.alertaEntregaHoje}>
              Entrega para hoje! Será necessário confirmar disponibilidade com a confeiteira.
            </Text>
          )}

          <TouchableOpacity style={styles.confirmarBtn} onPress={ConfirmarPedidos}>
            <Text style={styles.confirmarBtnText}>Confirmar Pedido</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelarBtn}
            onPress={() => router.push("./(drawer)/index")}
          >
            <Text style={styles.cancelarBtnText}>Cancelar</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f5f0fa", // roxo clarinho de fundo
    flex: 1,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#3b1761", // roxo escuro
    marginBottom: 10,
  },
  valor: {
    fontSize: 18,
    marginVertical: 6,
    color: "#4e2a8e", // roxo médio
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 15,
    color: "#3b1761", // roxo escuro
  },
  endereco: {
    fontSize: 16,
    marginVertical: 6,
    color: "#4e2a8e", // roxo médio
  },
  kgContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
    marginVertical: 10,
  },
  kgButton: {
    backgroundColor: "#6a4b2a", // marrom escuro
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  kgButtonText: {
    color: "#fff8f0", // quase branco
    fontSize: 20,
    fontWeight: "bold",
  },
  kgText: {
    fontSize: 20,
    color: "#3b1761", // roxo escuro
    fontWeight: "bold",
    minWidth: 80,
    textAlign: "center",
  },
  pagamentoContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 10,
  },
  pagamentoButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#6a4b2a", // marrom escuro
    backgroundColor: "#f0e6dc", // bege claro
  },
  pagamentoButtonAtivo: {
    backgroundColor: "#6a4b2a", // marrom escuro
  },
  pagamentoButtonText: {
    color: "#6a4b2a", // marrom escuro
    fontWeight: "bold",
  },
  pagamentoButtonTextAtivo: {
    color: "#f0e6dc", // bege claro
  },
  datePicker: {
    marginTop: 10,
    marginBottom: 20,
  },
  alertaEntregaHoje: {
    color: "#a63232", // vermelho meio queimado
    marginTop: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  confirmarBtn: {
    backgroundColor: "#6a4b2a", // marrom escuro
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  confirmarBtnText: {
    color: "#f0e6dc", // bege claro
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cancelarBtn: {
    backgroundColor: "#a3764a", // marrom médio
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 12,
  },
  cancelarBtnText: {
    color: "#fff8f0", // quase branco
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});