import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, Image, Dimensions, Pressable } from "react-native";
import { getChannelData } from "@/services/getUserData";
import { Channel } from "@/utils/interfaces";
import LoadingScreen from "@/screens/LoadingScreen";
import { router } from "expo-router";

interface ChannelDisplayProps {
  id: string;
  displayBanner: boolean;
  link?: string;
  params?: { [key: string]: string | number };
}

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
        if (channelSnapshot.exists) {
          const channelData = channelSnapshot.data() as Channel;
          setChannel(channelData);
        } else {
          console.log("Channel not found");
        }
      } catch (error) {
        console.error("Error febocpfeh data: ", error);
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
        params: { ...params, id:id },
      });
    
  };

  return (
    <Pressable disabled = {!link} onPress={handlePress}> 
      {channel.bannerURL && displayBanner && (
        <Image source={{ uri: channel.bannerURL }} style={styles.bannerImage} />
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
  bannerImage: {
    height: 300,
    resizeMode: "cover",
  },
  profileSection: {
    borderBottomRightRadius: 10,
    borderBottomLeftRadius: 10,
    paddingVertical: "5%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: Math.round(
      (Dimensions.get("window").height + Dimensions.get("window").width) / 2
    ),
    borderWidth: 3,
    borderColor: "#fff",
  },
  profileInfo: {
    marginLeft: 20,
  },
  displayName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default ChannelDisplay;
