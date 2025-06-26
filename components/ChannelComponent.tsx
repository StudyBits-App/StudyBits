import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Pressable } from "react-native";
import { getChannelData } from "@/services/getUserData";
import { Channel, ChannelDisplayProps } from "@/utils/interfaces";
import LoadingScreen from "@/screens/LoadingScreen";
import { router } from "expo-router";

const ChannelDisplay: React.FC<ChannelDisplayProps> = ({
  id,
  displayBanner,
  link,
  params,
}) => {
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    const fetchChannelData = async () => {
      try {
        const channelSnapshot = await getChannelData(id);
        if (channelSnapshot.exists()) {
          const channelData = channelSnapshot.data() as Channel;
          setChannel(channelData);
        } else {
          console.log("Channel not found");
        }
      } catch (error) {
        console.error("Error fetching channel data: ", error);
      }
    };

    fetchChannelData();
  }, [id]);

  if (!channel) {
    return <LoadingScreen />;
  }

  const handlePress = () => {
    router.push({
      pathname: link as any,
      params: { ...params, id: id },
    });
  };

  return (
    <Pressable disabled={!link} onPress={handlePress} style={styles.container}>
      {channel.bannerURL && displayBanner && (
        <View>
          <Image source={{ uri: channel.bannerURL }} style={styles.bannerImage} />
        </View>
      )}
      <View style={styles.profileSection}>
        <Image
          source={{
            uri: channel.profilePicURL || `https://robohash.org/${id}`,
          }}
          style={styles.profilePic}
        />
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>
            {channel.displayName || "Default Display Name"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#2c2c2c",
  },
  bannerImage: {
    height: 150,
    width: "100%",
    resizeMode: "cover",
  },
  profileSection: {
    paddingVertical: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: {
    marginLeft: 20,
  },
  displayName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ChannelDisplay;
