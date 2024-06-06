import { useSession } from "@/context/ctx";
import SignInScreen from "@/screens/SignIn";
import { Stack } from "expo-router";
import { Text } from "react-native";

export default function AuthCheck() {
    const { user, isLoading } = useSession();
    if (isLoading)
        return <Text>Loading...</Text>

    if (user) return (
        <Stack>
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
        </Stack>
    )
    else return <SignInScreen />
}