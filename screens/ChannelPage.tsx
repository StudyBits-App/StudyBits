import React, { useEffect, useState, useCallback } from 'react';
import { StyleSheet, Text, View, Image, ScrollView, RefreshControl, Pressable, Dimensions } from 'react-native';
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
      if (channelData.courses) {
        const coursePromises = channelData.courses.map(async (courseId: string) => {
          const courseDoc = await getCourseData(courseId);
          return courseDoc.data() as Course;
        });
        const courses = await Promise.all(coursePromises);
        setCourses(courses);
      }
    } catch (error) {
      console.error('Error fetching user courses: ', error);
    }
  };

  useEffect(() => {
    setChannel(defaultChannel)
    fetchUserChannel();
    fetchUserCourses();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchUserChannel().finally(() => setRefreshing(false));
    fetchUserCourses().finally(() => setRefreshing(false));
  }, [user]);

  if (isLoading || channel === defaultChannel) {
    return (
      <LoadingScreen />
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
      <Link
        asChild
        href={{
          pathname: "/channelPages/manageCourse",
          params: { id: course.key, isEditing: '0' },
        }}
        key={course.key}
      >

        <Pressable style={styles.course}>
          {course.picUrl && <Image source={{ uri: course.picUrl }} style={styles.coursePic}/>}
          <View style={[styles.courseInfoBox, course.picUrl ? {marginLeft: '5%'}: null]}>
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
          <View style={{...styles.courseInfoBox, marginLeft: '3%'}}>
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
    backgroundColor: "#1E1E1E",
    paddingHorizontal: 15
  },
  bannerImage: {
    height: 300,
    resizeMode: 'cover',
  },
  course: {
    borderRadius: 10,
    marginTop: '2%',
    flexDirection: 'row',
    borderColor: 'white',
    borderWidth: 1,
    backgroundColor: '#2E2E2E',
    padding: 20,
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
    borderRadius: Math.round((Dimensions.get('window').height + Dimensions.get('window').width) / 2),
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
    width: '75%',
    justifyContent:'center'
  },
  coursePic: {
    width: 70,
    height: 70,
    borderRadius: Math.round((Dimensions.get('window').height + Dimensions.get('window').width) / 2),
    borderWidth: 1,
    borderColor: '#fff'
  },
});

export default UserChannelPage;
