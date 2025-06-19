import {Tabs} from "expo-router"
import { Drawer } from "expo-router/drawer";
import {Ionicons} from "@expo/vector-icons"


export default function Layout() {
    return (

    <Drawer>
        <Drawer.Screen
            name="index"
            options={{
                title: "Tela Inicial"
            }}
        />
        <Drawer.Screen
        name="[id]"
        options={{
            title:"perfil"
        }}
        />
        <Drawer.Screen
        name="meuspedidos"
        options={{
            title:"Meus Pedidos"
        }}
        />
            <Drawer.Screen
    name="perfilConfeteira"
    options={{
        drawerItemStyle: { display: "none" }
    }}
    />
          <Drawer.Screen
    name="pedidosPersonalizados"
    options={{
        drawerItemStyle: { display: "none" }
    }}
    />
          <Drawer.Screen
    name="detalhePedidoPersonalizado"
    options={{
        drawerItemStyle: { display: "none" }
    }}
    />
    </Drawer>
    );
}