
import { useState } from "react";
import { TextInput, TouchableOpacity, View, StyleSheet, Image, Text } from "react-native";



export default function SignupScreen({navigation}) {

    const [userName,setUserName] = useState('');
        const [password, setPassword] = useState('');
        const [inviteCode, setInviteCode] = useState('');

    const handleSignup = async() =>{
        
    }

    return (
        <View>
            <Image source=".../assets/images/app_log.svga"
            />
            <Text>Register to Augwa</Text>
            <TextInput value={userName} onChangeText={setUserName} placeholder="Username" />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password" />
            <TextInput value={inviteCode} onChangeText={setInviteCode} placeholder="Invite Code" />

            <TouchableOpacity onPress={handleSignup} style={styles.signupButton}>
                signup
            </TouchableOpacity>
        </View>
    )

}

const styles = StyleSheet.create({
    signupButton: {
        textTransform: 'uppercase'
    }
})