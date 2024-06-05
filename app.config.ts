import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
    ...config,
    ios: {
        googleServicesFile: process.env.GOOGLE_SERVICES_PLIST || config.ios?.googleServicesFile,
        ...config.ios
    },
    android: {
        googleServicesFile: process.env.GOOGLE_SERVICES_JSON || config.android?.googleServicesFile,
        ...config.android
    }
});