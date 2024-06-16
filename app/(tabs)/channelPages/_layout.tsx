import React from 'react';
import {
    createMaterialTopTabNavigator,
    MaterialTopTabNavigationOptions,
    MaterialTopTabNavigationEventMap,
} from '@react-navigation/material-top-tabs';
import { withLayoutContext } from 'expo-router';
import { ParamListBase, TabNavigationState } from '@react-navigation/native';

const { Navigator } = createMaterialTopTabNavigator();

export const MaterialTopTabs = withLayoutContext<
    MaterialTopTabNavigationOptions,
    typeof Navigator,
    TabNavigationState<ParamListBase>,
    MaterialTopTabNavigationEventMap
    >(Navigator);

export default function ChannelLayout() {
    return (
        <MaterialTopTabs>
            <MaterialTopTabs.Screen
                name="channelPage"
                options={{ title: 'Channel' }}
            />
            <MaterialTopTabs.Screen
                name="createChannel"
                options={{ title: 'Channel Detals' }}
            />
        </MaterialTopTabs>
    );
}
