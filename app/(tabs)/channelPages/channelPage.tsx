import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, RefreshControl, useColorScheme, Pressable } from 'react-native';
import { useSession } from '@/context/ctx';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { getChannelData } from '@/services/getUserData';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';

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

interface Course {
  picUrl: string;
  name: string;
  description: string;
}

const UserChannelPage = () => {
  const { user, isLoading } = useSession();
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [refreshing, setRefreshing] = useState(false);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const fetchUserChannel = async () => {
    if (!user) {
      return;
    }
    try {
      const channelData = (await getChannelData(user.uid)).docs[0].data() as Channel;
      setChannel(channelData);
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

  if (isLoading) {
    return (
      <View style={{ backgroundColor: isDarkMode ? '#222' : '#fff' }}>
        <Text style={{ color: isDarkMode ? '#fff' : '#000' }}>Loading...</Text>
      </View>
    );
  }

  const ChannelComponent = ({ hasBanner }: { hasBanner: boolean }) => {
    return (
      <View style={{ marginTop: hasBanner ? 0 : 20 }}>
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

  const CourseComponent = (course: Course) => {
    return (
      <Link asChild href="/channelPages/createCourse">
        <Pressable style={styles.course}>
          <Ionicons name="add-circle" size={70} color={'#3B9EBF'} />
          <View style={styles.courseInfoBox}>
            <Text style={[styles.courseName, { color: '#fff' }]}>
              {course.name || 'Default Course Name'}
            </Text>
            <Text style={[styles.courseDescription, { color: '#fff' }]}>
              {course.description || 'This course tells you about skibidi toilet and ohioans.'}
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  }

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
          <View>
            <ChannelComponent hasBanner={true} />
          </View>
        </ParallaxScrollView>
      ) : (
        <View>
          <ChannelComponent hasBanner={false} />
        </View>
      )}
      <CourseComponent />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  bannerImage: {
    height: 300,
    resizeMode: 'cover',
  },
  course: {
    borderRadius: 10,
    marginTop: '2%',
    paddingVertical: '5%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    backgroundColor: 'grey'
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  profileInfo: {
    marginLeft: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    width: '90%'
  },
  courseDescription: {
    width: '90%'
  },
  courseInfoBox: {
    marginLeft: '2%',
    width: '75%'
  }
});

export default UserChannelPage;