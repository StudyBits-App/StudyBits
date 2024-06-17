import React from 'react';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';
import { ActivityIndicator } from 'react-native';
import { useUserChannel } from '@/context/userChannel';
import CreateChannelPage from '@/screens/createChannel';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
>(Navigator);

export default function ChannelLayout() {
    const { hasChannel, loading } = useUserChannel();

    if (loading) {
        return <ActivityIndicator />;
    }

    return hasChannel ? (
        <MaterialTopTabs>
            <MaterialTopTabs.Screen name="channelPage" options={{ title: 'Channel' }} />
        </MaterialTopTabs>
    ) : (
        <CreateChannelPage/>
    );
}
