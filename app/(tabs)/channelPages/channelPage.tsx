import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, RefreshControl, useColorScheme, Pressable } from 'react-native';
import { useSession } from '@/context/ctx';
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
  key: string;
  picUrl: string;
  name: string;
  description: string;
}

const UserChannelPage = () => {
  const { user, isLoading } = useSession();
  const [channel, setChannel] = useState<Channel>(defaultChannel);
  const [refreshing, setRefreshing] = useState(false);
  const [courses, setCourses] = useState<Course[]>([
    {
      key: 'bopb',
      picUrl: 'https://firebasestorage.googleapis.com/v0/b/studybits-fc170.appspot.com/o/profilePics%2F796f4437-8213-454c-971d-7d1b42ede8bb-12125C68-2EB7-4E3A-AADA-339BB627739B.jpg?alt=media&token=5ff931af-b029-403e-96b5-38cfd1f48c75',
      name: 'How to Rizz like an ohian',
      description: 'skibidi rizzler'
    }
  ]);
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  const fetchUserChannel = async () => {
    if (!user) {
      return;
    }
    try {
      const channelData = (await getChannelData(user.uid)).data() as Channel;
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
              {channel.displayName || 'Default Display Name'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCourse = (course: Course) => {
    return (
      <Link asChild href="/channelPages/createCourse" key={course.key}>
        <Pressable style={styles.course}>
          <Image
            source={{ uri: course.picUrl || `https://robohash.org/${channel.user}` }}
            style={[styles.coursePic, { borderColor: isDarkMode ? '#fff' : '#000' }]}
          />
          <View style={styles.courseInfoBox}>
            <Text style={[styles.courseName, { color: '#fff' }]}>
              {course.name || "Default Course Name"}
            </Text>
            <Text style={[styles.courseDescription, { color: '#fff' }]}>
              {course.description || "A course about courses, if you will."}
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  const AddCourse = () => {
    return (
      <Link asChild href="/channelPages/createCourse">
        <Pressable style={styles.course}>
          <Ionicons name="add-circle" size={70} color={'#3B9EBF'} />
          <View style={styles.courseInfoBox}>
            <Text style={[styles.courseName, { color: '#fff' }]}>
              Add a Course
            </Text>
            <Text style={[styles.courseDescription, { color: '#fff' }]}>
              It can be about anything you'd like.
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#1E1E1E" }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {channel.bannerURL ? (
        <View>
          <Image source={{ uri: channel.bannerURL }} style={styles.bannerImage} />
          <ChannelComponent hasBanner={true} />
        </View>
      ) : (
        <View>
          <ChannelComponent hasBanner={false} />
        </View>
      )}
      {courses.map((course) => renderCourse(course))}
      <AddCourse />
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
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingVertical: '5%',
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
  },
  coursePic: {
    width: 70,
    height: 70,
    borderRadius: 50,
    borderWidth: 1,
  }
});

export default UserChannelPage;
