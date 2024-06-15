import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, RefreshControl, useColorScheme } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSession } from '@/context/ctx';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { Redirect } from 'expo-router';

interface Channel {
  user: string;
  bannerURL: string;
  profilePicURL: string;
  displayName: string;
}

const defaultChannel: Channel = {
  user: '',
  bannerURL: '',
  profilePicURL: '',
  displayName: '',
};

const UserChannelPage = () => {
  const { user, isLoading } = useSession();
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [redirectTo, setRedirectTo] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const fetchUserChannel = async () => {
    if (!user) {
      return;
    }
    try {
      const channelsSnapshot = await firestore()
        .collection('channels')
        .where('user', '==', user.uid)
        .get();

      if (!channelsSnapshot.empty) {
        const channelData = channelsSnapshot.docs[0].data() as Channel;
        setChannel(channelData);
      } else {
        setRedirectTo('channelPages/createChannel');
      }
    } catch (error) {
      console.error('Error fetching user channel: ', error);
    }
  };

  useEffect(() => {
    fetchUserChannel();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserChannel().finally(() => setRefreshing(false));
  }, [user]);

  if (redirectTo) {
    return <Redirect href={redirectTo} />;
  }

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: isDarkMode ? '#222' : '#fff' }]}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Loading...</Text>
      </View>
    );
  }

  const ChannelComponent = ({ channel, hasBanner }: { channel: Channel; hasBanner: boolean }) => {
    return (
      <View style={[styles.profileWrapper, { marginTop: hasBanner ? -50 : 20 }]}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: channel.profilePicURL || `https://robohash.org/${channel.user}` }}
            style={[styles.profilePic, { borderColor: isDarkMode ? '#fff' : '#000' }]}
          />
          <View style={styles.profileInfo}>
            <Text style={[styles.displayName, { color: isDarkMode ? '#fff' : '#000' }]}>
              {channel.displayName || 'Default DisplayName'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: isDarkMode ? '#111' : '#fff' }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {channel.bannerURL ? (
        <ParallaxScrollView
          headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
          headerImage={<Image source={{ uri: channel.bannerURL }} style={styles.bannerImage} />}
        >
          <View style={[styles.container, styles.contentContainer]}>
            <ChannelComponent channel={channel} hasBanner={true} />
          </View>
        </ParallaxScrollView>
      ) : (
        <View style={[styles.container, styles.contentContainer]}>
          <ChannelComponent channel={channel} hasBanner={false} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  contentContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 15,
  },
  bannerImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  profileWrapper: {
    width: '100%',
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  profileInfo: {
    marginLeft: 20,
    alignItems: 'center',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default UserChannelPage;
