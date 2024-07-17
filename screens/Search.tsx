import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { SafeAreaView, View, TextInput, StyleSheet } from "react-native";

const Search: React.FC = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (query) {
      setSearchQuery(query);
    }
  }, [query]);
  
  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push({
        pathname: "/homePages/searchResults",
        params: { query: searchQuery },
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
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
      </View>
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
});

export default Search;
