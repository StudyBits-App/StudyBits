import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    ios: {
        googleServicesFile: process.env.GOOGLE_SERVICES_PLIST || "./GoogleService-Info.plist",
        ...config.ios
    },
    android: {
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON || "./google-services.json",
        ...config.android
    }
});