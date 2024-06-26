import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';

GoogleSignin.configure({
    webClientId: '1098397225551-4fo48u8pni4nct9f1msj5n81nes8b3oe.apps.googleusercontent.com'
});

export default function SignIn() {
    const [email, onChangeEmail] = React.useState('');

    const signInWithEmail = () => {

    }

    const signInWithGoogle = async () => {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
        // Get the users ID token
        const { idToken } = await GoogleSignin.signIn();

        // Create a Google credential with the token
        const googleCredential = auth.GoogleAuthProvider.credential(idToken);

        // Sign-in the user with the credential
        return auth().signInWithCredential(googleCredential);
    }

    return (
        <SafeAreaView style={styles.safeview}>
            <LinearGradient
                colors={['#510083', '#8D39AB', '#EE7200']}
                style={styles.background}
            />
            <View style={styles.container}>
                <Text style={styles.titleText}>StudyBits</Text>
                <Text style={styles.headText}>Create an account</Text>
                <Text style={styles.subText}>Get ready to be an intellectual</Text>
                <TextInput
                    style={styles.input}
                    onChangeText={onChangeEmail}
                    value={email}
                    placeholder="email@domain.com"
                />
                <Pressable
                    style={styles.button}
                    onPress={signInWithEmail}>
                    <Text style={styles.signuptext}>Sign up with email</Text>
                </Pressable>

                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View
                        style={styles.divider}
                    />
                    <View>
                        <Text style={styles.text}>or continue with</Text>
                    </View>
                    <View
                        style={styles.divider}
                    />
                </View>
                <Pressable
                    style={styles.button}
                    onPress={signInWithGoogle}
                >
                    <Image source={require('@/assets/images/google-logo.png')} style={styles.signInImage}></Image>
                    <Text style={styles.signuptext}>Google</Text>
                </Pressable>
                <Text style={[styles.text, styles.policies]}>By clicking continue, you agree to our Terms of Service and Privacy Policy</Text>
            </View>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    divider: {
        width: '21%',
        marginHorizontal: '2%',
        borderBottomColor: 'white',
        borderBottomWidth: 2,
    },
    titleText: {
        fontSize: 24,
        color: "white",
        paddingBottom: 100,
        fontWeight: 'bold'
    },
    headText: {
        fontSize: 18,
        color: "white",
        paddingBottom: 20,
        fontWeight: 'bold'
    },
    subText: {
        color: "white",
        paddingBottom: 30,
    },
    signuptext: {
        color: 'black',
        textAlign: 'center'
    },
    safeview: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%'
    },
    policies: {
        paddingHorizontal: '10%'
    },
    text: {
        color: 'white',
        textAlign: 'center'
    },
    input: {
        backgroundColor: "#000000",
        padding: 10,
        alignItems: "center",
        borderRadius: 5,
        width: '75%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderColor: 'white',
        borderStyle: 'solid',
        borderWidth: 1
    },
    background: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        height: '100%',
        width: '100%'
    },
    button: {
        backgroundColor: "#ffffff",
        padding: 10,
        alignItems: "center",
        borderRadius: 5,
        width: '75%',
        marginVertical: '5%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 32,
    },
    signInImage: {
        height: 20,
        width: 20,
        marginHorizontal: '2%'
    },
});