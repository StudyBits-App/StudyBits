import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, RefreshControl, Pressable } from 'react-native';
import { useSession } from '@/context/ctx';
import { getChannelData, getCourseData } from '@/services/getUserData';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import LoadingScreen from './LoadingScreen';

interface Channel {
  courses: string[];
  bannerURL: string;
  profilePicURL: string;
  displayName: string;
}

const defaultChannel: Channel = {
  courses: [],
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
  const [courses, setCourses] = useState<Course[]>([]);

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

  const fetchUserCourses = async () => {
    if (!user) {
      return;
    }
    try {
      const channelDoc = await getChannelData(user.uid);
      const channelData = channelDoc.data() as Channel;
      const coursePromises = channelData.courses.map(async (courseId: string) => {
        const courseDoc = await getCourseData(courseId);
        return courseDoc.data() as Course;
      });
      const courses = await Promise.all(coursePromises);
      setCourses(courses);
    } catch (error) {
      console.error('Error fetching user courses: ', error);
    }
  };

  useEffect(() => {
    fetchUserChannel();
    fetchUserCourses();
  }, [user]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserChannel().finally(() => setRefreshing(false));
    fetchUserCourses().finally(() => setRefreshing(false));
  }, [user]);

  if (isLoading) {
    return (
        <LoadingScreen/>
    );
  }

  const ChannelComponent = ({ hasBanner }: { hasBanner: boolean }) => {
    return (
      <View style={{ marginTop: hasBanner ? 0 : 60 }}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: channel.profilePicURL || `https://robohash.org/${user?.uid}` }}
            style={styles.profilePic}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.displayName}>
              {channel.displayName || 'Default Display Name'}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCourse = (course: Course) => {
    return (
      <Link asChild href={`channelPages/manageCourse/${course.key}`} key={course.key}>
        <Pressable style={styles.course}>
          <Image
            source={{ uri: course.picUrl || `https://robohash.org/${user?.uid}` }}
            style={styles.coursePic}
          />
          <View style={styles.courseInfoBox}>
            <Text style={styles.courseName}>
              {course.name || "Default Course Name"}
            </Text>
            <Text style={styles.courseDescription}>
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
            <Text style={styles.courseName}>
              Add a Course
            </Text>
            <Text style={styles.courseDescription}>
              It can be about anything you'd like.
            </Text>
          </View>
        </Pressable>
      </Link>
    );
  };

  return (
    <ScrollView
      style={styles.container}
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
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E"
  },
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
    borderColor: 'white',
    borderWidth: 1
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
    borderColor: '#fff'
  },
  profileInfo: {
    marginLeft: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff'
  },
  courseName: {
    fontSize: 24,
    fontWeight: 'bold',
    width: '90%',
    color: '#fff'
  },
  courseDescription: {
    width: '90%',
    color: '#fff'
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
    borderColor: '#fff'
  },
});

export default UserChannelPage;
