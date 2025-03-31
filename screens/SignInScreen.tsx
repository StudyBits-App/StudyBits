import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  Image,
  Keyboard,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { GoogleSignin } from "@react-native-google-signin/google-signin";
import auth from "@react-native-firebase/auth";
import { Link, Redirect } from "expo-router";
import { useSession } from "@/context/ctx";

GoogleSignin.configure({
  webClientId:
    "1098397225551-4fo48u8pni4nct9f1msj5n81nes8b3oe.apps.googleusercontent.com",
});

export default function SignInScreen() {
  const [email, onChangeEmail] = React.useState("");
  const [password, onChangePassword] = React.useState("");
  const [enteredUsername, setEnteredUsername] = React.useState(false);
  const [authError, setAuthError] = React.useState(false);
  const { user, isLoading } = useSession();

  const signInWithEmail = async () => {
    setEnteredUsername(true);
    if (!enteredUsername) return;
    if (email === "" || password === "") return;
    return auth()
      .signInWithEmailAndPassword(email, password)
      .catch(() => {
        setAuthError(true);
      });
  };

  const signInWithGoogle = async () => {
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    // Get the users ID token
    const { idToken } = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  };

  return (
    <SafeAreaView style={styles.safeview}>
      {user && <Redirect href={"/(tabs)"} />}
      <LinearGradient
        colors={["#510083", "#8D39AB", "#EE7200"]}
        style={styles.background}
      />
      <Pressable style={styles.container} onPress={Keyboard.dismiss}>
        <Text style={styles.titleText}>StudyBits</Text>
        <Text style={styles.headText}>Welcome</Text>
        <Text style={styles.subText}>Get ready to be an intellectual</Text>
        {authError && (
          <Text style={styles.errorText}>Invalid username or password.</Text>
        )}
        <TextInput
          style={[styles.input, { marginBottom: 0 }]}
          onChangeText={onChangeEmail}
          value={email}
          placeholder="email@domain.com"
          placeholderTextColor={"#868686"}
        />
        <View style={{ marginTop: 10, width: "100%", alignItems: "center" }}>
          {enteredUsername && (
            <TextInput
              style={styles.input}
              onChangeText={onChangePassword}
              secureTextEntry
              value={password}
              placeholder="mysupersafepassword123"
              placeholderTextColor={"#868686"}
            />
          )}
        </View>
        <Pressable style={styles.button} onPress={signInWithEmail}>
          <Text style={styles.signuptext}>Sign in with email</Text>
        </Pressable>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.divider} />
          <View>
            <Text style={styles.text}>or continue with</Text>
          </View>
          <View style={styles.divider} />
        </View>
        <Pressable style={styles.button} onPress={signInWithGoogle}>
          <Image
            source={require("@/assets/images/google-logo.png")}
            style={styles.signInImage}
          ></Image>
          <Text style={styles.signuptext}>Google</Text>
        </Pressable>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={[styles.text, styles.policies]}>
            Don't have an account?
          </Text>
          <Link
            href={"/authentication/signUp"}
            style={[styles.text, styles.link]}
          >
            Sign Up
          </Link>
        </View>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  link: {
    fontWeight: "bold",
  },
  divider: {
    width: "21%",
    marginHorizontal: "2%",
    borderBottomColor: "white",
    borderBottomWidth: 2,
  },
  titleText: {
    fontSize: 24,
    color: "white",
    paddingBottom: 100,
    fontWeight: "bold",
  },
  headText: {
    fontSize: 18,
    color: "white",
    paddingBottom: 20,
    fontWeight: "bold",
  },
  subText: {
    color: "white",
    paddingBottom: 30,
  },
  signuptext: {
    color: "black",
    textAlign: "center",
  },
  safeview: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  policies: {
    marginRight: "2%",
  },
  text: {
    color: "white",
    textAlign: "center",
  },
  input: {
    backgroundColor: "#333",
    color: "white",
    borderRadius: 5,
    padding: 12,
    fontSize: 16,
    width: "75%",
  },
  background: {
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
    height: "100%",
    width: "100%",
  },
  button: {
    backgroundColor: "#ffffff",
    padding: 10,
    alignItems: "center",
    borderRadius: 5,
    width: "75%",
    marginVertical: "5%",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 32,
  },
  signInImage: {
    height: 20,
    width: 20,
    marginHorizontal: "2%",
  },
  errorText: {
    fontWeight: "bold",
    color: "red",
    shadowColor: "black",
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
  },
});
