import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Button, Text, TextInput, View } from 'react-native';


export default function Login_Usuarios(){
    /*Conectar essa pagina no banco de dados para ela funcionar da maneira correta*/
    const router = useRouter();
    const [texto, setTexto] = useState('');
    const [liberarBotao, setliberarBotao] = useState(false);

const VerificarCaixadeTexto = (inputText :string) =>{
    setTexto(inputText);

    if(inputText.trim()!==''){
        setliberarBotao(true);
    }else{
        setliberarBotao(false);
    }
}
    return(
        <View>
            <Text>Login:</Text>
            <Text>Senha:</Text>
            <TextInput
                value={texto}
                onChangeText={VerificarCaixadeTexto}/>
            <Button title='Entrar' onPress={()=>router.push('/Usuario/perfil')}
                disabled={!liberarBotao}
                />
            <Button title='Voltar' onPress={()=> router.push('/Index')}/>
        </View>
    )
}