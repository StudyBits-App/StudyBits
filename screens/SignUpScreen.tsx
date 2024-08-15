import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Pressable, TextInput } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import { Link, Redirect} from "expo-router";
import RNDateTimePicker from '@react-native-community/datetimepicker';
import { useSession } from "@/context/ctx";

GoogleSignin.configure({
    webClientId: '1098397225551-4fo48u8pni4nct9f1msj5n81nes8b3oe.apps.googleusercontent.com'
});

export default function SignUpScreen() {
    const [email, onChangeEmail] = React.useState('');
    const [password, onChangePassword] = React.useState('');
    const [confirmPassword, onChangeConfirmPassword] = React.useState('');
    const [enteredUsername, setEnteredUsername] = React.useState(false);
    const [birthday, setBirthday] = React.useState<Date>(new Date());
    const { user } = useSession();

    const signUp = async () => {
        setEnteredUsername(true);
        if (!enteredUsername) return;
        if (email === '' || password === '') return;
        return auth().createUserWithEmailAndPassword(email, password);
    }

    return (
        <SafeAreaView style={styles.safeview}>
            {user && <Redirect href={'/(tabs)'} />}
            <LinearGradient
                colors={['#510083', '#8D39AB', '#EE7200']}
                style={styles.background}
            />
            <View style={styles.container}>
                <Text style={styles.titleText}>StudyBits</Text>
                <Text style={styles.headText}>Welcome</Text>
                <Text style={styles.subText}>Get ready to be an intellectual</Text>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                        style={[styles.input, { marginBottom: 0 }]}
                        onChangeText={onChangeEmail}
                        value={email}
                        placeholder="email@domain.com"
                        placeholderTextColor={'#868686'}
                    />
                </View>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangePassword}
                        secureTextEntry
                        value={password}
                        placeholder="mysupersafepassword123"
                        placeholderTextColor={'#868686'}
                    />
                </View>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Confirm Password</Text>
                    <TextInput
                        style={styles.input}
                        onChangeText={onChangeConfirmPassword}
                        secureTextEntry
                        value={confirmPassword}
                        placeholder="mysupersafepassword123"
                        placeholderTextColor={'#868686'}
                    />
                </View>
                <View style={styles.labelContainer}>
                    <Text style={styles.label}>Birthday</Text>
                    <RNDateTimePicker value={birthday || new Date()} onChange={(event, date) => setBirthday(date || new Date())} />
                </View>
                <Pressable
                    style={styles.button}
                    onPress={signUp}>
                    <Text style={styles.signuptext}>Sign Up</Text>
                </Pressable>
                <View style={{ flexDirection: "row", justifyContent: 'center', alignItems: 'center' }}>
                    <Text style={[styles.text, styles.policies]}>Already have an account?</Text>
                    <Link href={'/authentication/signIn'} style={[styles.text, styles.link]}>Sign In</Link>
                </View>
            </View>
        </SafeAreaView >
    )
}

const styles = StyleSheet.create({
    labelContainer: {
        width: '75%',
        justifyContent: 'center',
        alignItems: 'center'
    },
    label: {
        color: 'white',
        fontWeight: 'bold',
        fontSize: 15,
        marginBottom: 0,
        alignSelf: 'flex-start',
        marginTop: '3%'
    },
    link: {
        fontWeight: 'bold'
    },
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
        marginRight: '2%'
    },
    text: {
        color: 'white',
        textAlign: 'center'
    },
    input: {
        backgroundColor: "#000000",
        color: 'white',
        alignItems: "center",
        borderRadius: 5,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: '3%',
        paddingHorizontal: '3%',
        borderColor: 'white',
        borderStyle: 'solid',
        borderWidth: 1,
        marginTop: '2%'
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
    errorText: {
        fontWeight: 'bold',
        color: 'red',
        shadowColor: 'black',
        shadowOffset: {
            width: 0,
            height: 0
        },
        shadowOpacity: 1
    }
});
