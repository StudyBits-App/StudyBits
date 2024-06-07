import React, { useState } from 'react';
import { View, TextInput, Button, Image, StyleSheet, Alert, TouchableOpacity, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';

const CreateChannelPage = () => {
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profilePicImage, setProfilePicImage] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>('');

  const handleBannerUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Permission to access media library is required!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setBannerImage(result.assets[0].uri);
    }
  };

  const handleProfilePicUpload = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setProfilePicImage(result.assets[0].uri);
    }
  };

  const handleCreateChannel = () => {
    if (!displayName.trim()) {
      Alert.alert('Error', 'You must provide a display name!');
      return;
    }

    console.log('Creating channel with:', { bannerImage, profilePicImage, displayName });
  };

  const handleRemoveBanner = () => {
    Alert.alert(
      'Remove Banner Image',
      'Are you sure you want to remove the banner image?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          onPress: () => setBannerImage(null),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveProfilePic = () => {
    if (profilePicImage) {
      Alert.alert(
        'Remove Profile Picture',
        'Are you sure you want to remove the profile picture?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove',
            onPress: () => setProfilePicImage(null),
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        bannerImage ? (
          <TouchableOpacity onPress={handleRemoveBanner}>
            <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={handleBannerUpload} style={styles.uploadBannerButton}>
            <Text style={styles.uploadBannerText}>Upload Banner Image</Text>
          </TouchableOpacity>
        )
      }
    >
      <View style={styles.container}>
        <View style={styles.profileSection}>
          {/* Profile Picture */}
          <TouchableOpacity onPress={handleRemoveProfilePic}>
            {profilePicImage ? (
              <Image source={{ uri: profilePicImage }} style={styles.profilePic} />
            ) : (
              <View style={styles.placeholderPic} />
            )}
          </TouchableOpacity>
          {/* Upload Profile Picture Button */}
          <View style={styles.profileButtonSection}>
            <Button title="Upload a profile pic" onPress={handleProfilePicUpload} />
          </View>
        </View>

        {/* Display Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          value={displayName}
          onChangeText={setDisplayName}
        />

        {/* Create Channel Button */}
        <Button title="Create Channel" onPress={handleCreateChannel} />
      </View>
    </ParallaxScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    width: '100%',
  },
  bannerImage: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  uploadBannerButton: {
    width: '100%',
    height: 300,
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadBannerText: {
    color: '#888',
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginRight: 20,
  },
  placeholderPic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e1e1e1',
    marginRight: 20,
  },
  profileButtonSection: {
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
});

export default CreateChannelPage;
