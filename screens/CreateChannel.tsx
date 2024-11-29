import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  Image,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { uploadImageToFirebase } from "@/services/handleImages";
import * as ImagePicker from "expo-image-picker";
import firestore from "@react-native-firebase/firestore";
import { useSession } from "@/context/ctx";

const CreateChannelPage: React.FC = () => {
  const [bannerImage, setBannerImage] = useState<string | null>(null);
  const [profilePicImage, setProfilePicImage] = useState<string | null>(null);
  const [defaultProfilePicUrl, setDefaultProfilePicUrl] = useState<
    string | null
  >(null);
  const [displayName, setDisplayName] = useState<string>("");
  const { user } = useSession();

  useEffect(() => {
    const fetchProfilePicUrl = async () => {
      if (user?.uid) {
        const url = `https://robohash.org/${user?.uid}`;
        setDefaultProfilePicUrl(url);
      }
    };

    fetchProfilePicUrl();
  }, [user]);

  const handleBannerUpload = async () => {
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

  const handleCreateChannel = async () => {
    if (!displayName.trim()) {
      Alert.alert("Error", "You must provide a display name!");
      return;
    }

    try {
      let bannerURL = null;
      let profilePicURL = null;

      if (bannerImage) {
        bannerURL = await uploadImageToFirebase(bannerImage, "banners");
      }

      if (profilePicImage) {
        profilePicURL = await uploadImageToFirebase(
          profilePicImage,
          "profilePics"
        );
      } else if (defaultProfilePicUrl) {
        profilePicURL = defaultProfilePicUrl;
      }

      await firestore()
        .collection("channels")
        .doc(user?.uid)
        .set({
          displayName: displayName,
          bannerURL: bannerURL || "",
          profilePicURL: profilePicURL,
        });

      console.log("Channel created successfully with:", {
        bannerURL,
        profilePicURL,
        displayName,
      });
    } catch (error) {
      console.error("Error uploading images or saving to Firestore: ", error);
      Alert.alert("Error", "Failed to save images. Please try again.");
    }
  };

  const handleRemoveBanner = () => {
    Alert.alert(
      "Remove Banner Image",
      "Are you sure you want to remove the banner image?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Remove",
          onPress: () => setBannerImage(null),
          style: "destructive",
        },
      ],
      { cancelable: true }
    );
  };

  const handleRemoveProfilePic = () => {
    if (profilePicImage) {
      Alert.alert(
        "Remove Profile Picture",
        "Are you sure you want to remove the profile picture?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Remove",
            onPress: () => setProfilePicImage(null),
            style: "destructive",
          },
        ],
        { cancelable: true }
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {bannerImage ? (
        <TouchableOpacity onPress={handleRemoveBanner}>
          <Image source={{ uri: bannerImage }} style={styles.bannerImage} />
        </TouchableOpacity>
      ) : (
        <Pressable
          onPress={handleBannerUpload}
          style={styles.uploadBannerButton}
        >
          <Text style={styles.uploadBannerText}>Upload Banner Image</Text>
        </Pressable>
      )}
      <View style={styles.container}>
        <View style={styles.profileSection}>
          {/* Profile Picture */}
          <Pressable onPress={handleRemoveProfilePic}>
            {profilePicImage ? (
              <Image
                source={{ uri: profilePicImage || undefined }}
                style={styles.profilePic}
              />
            ) : (
              <Image
                source={{ uri: defaultProfilePicUrl || undefined }}
                style={styles.profilePic}
              />
            )}
          </Pressable>
          {/* Upload Profile Picture Button */}
          <Pressable
            onPress={handleProfilePicUpload}
            style={styles.uploadProfilePicButton}
          >
            <Text style={styles.uploadProfilePicText}>
              Upload Profile Picture
            </Text>
          </Pressable>
        </View>

        {/* Display Name Input */}
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor="#bbb"
          value={displayName}
          onChangeText={setDisplayName}
        />

        {/* Create Channel Button */}
        <Pressable
          onPress={handleCreateChannel}
          style={styles.createChannelButton}
        >
          <Text style={styles.createChannelText}>Create Channel</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#1E1E1E",
  },
  input: {
    borderWidth: 1,
    borderColor: "#555",
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#444",
    color: "#fff",
  },
  bannerImage: {
    height: 150,
    width: "100%",
    resizeMode: "cover",
  },
  uploadBannerButton: {
    height: 150,
    backgroundColor: "#26282e",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 10,
  },
  uploadBannerText: {
    color: "#ddd",
    fontSize: 16,
    fontWeight: "bold",
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
    marginRight: 20,
  },
  uploadProfilePicButton: {
    backgroundColor: "#26282e",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  uploadProfilePicText: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "bold",
  },
  createChannelButton: {
    backgroundColor: "#1e90ff",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 10,
    marginTop: 20,
  },
  createChannelText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});

export default CreateChannelPage;
