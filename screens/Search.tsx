import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  TextInput,
  StyleSheet,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { trimText } from "@/utils/utils";
import * as SecureStore from 'expo-secure-store';

const Search: React.FC = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
    }
    loadRecentSearches();
  }, [query]);

  const saveSearchQuery = async (newQuery: string) => {
    try {
      let searches = [newQuery, ...recentSearches.filter((q) => q !== newQuery)];
      searches = searches.slice(0, 15);
      const trimSearches = searches.map(search => trimText(search, 100));
      await SecureStore.setItemAsync('recentSearches', JSON.stringify(trimSearches));
      setRecentSearches(searches);
    } catch (error) {
      console.error('Failed to save search query:', error);
    }
  };
  
  const loadRecentSearches = async () => {
    try {
      const storedSearches = await SecureStore.getItemAsync('recentSearches');
      if (storedSearches) {
        setRecentSearches(JSON.parse(storedSearches));
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
    }
  };
  

  const handleSearch = (query: string) => {
    if (query.trim()) {
      saveSearchQuery(query);
      router.push({
        pathname: "/homePages/searchResults",
        params: { query: query },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchBar}
          placeholder="Search..."
          placeholderTextColor="#666"
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={() => handleSearch(searchQuery)}
          returnKeyType="search"
        />
      </View>
      <ScrollView style={styles.recentSearchesList}>
        {recentSearches.map((item, index) => (
          <Pressable
            key={index}
            style={styles.recentSearchItem}
            onPress={() => {
              setSearchQuery(item);
              handleSearch(item);
            }}
          >
            <Ionicons name="time-outline" size={20} color="#888" />
            <Text style={styles.recentSearchText}>{item}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  searchBarContainer: {
    padding: 10,
  },
  searchBar: {
    padding: 15,
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  recentSearchesList: {
    marginTop: 10,
    paddingHorizontal: 10,
  },
  recentSearchItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  recentSearchText: {
    color: "#fff",
    marginLeft: 10,
  },
});

export default Search;