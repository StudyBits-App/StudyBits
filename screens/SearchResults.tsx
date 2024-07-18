import React, { useState, useEffect } from "react";
import { SafeAreaView, Text, StyleSheet, Pressable, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { searchCourses } from "@/utils/searchAlgorithm";
import CourseCardChannel from "@/components/CourseCardWithChannel";

const Results: React.FC = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchResults, setSearchResults] = useState<string[]>([]);

  useEffect(() => {
    if (query) {
      handleSearch();
    }
  }, [query]);

  const handleSearch = async () => {
    if (query && query.trim()) {
      const results = await searchCourses(query.trim());
      console.log(results);
      setSearchResults(results);
    }
  };

  const search = () => {
    router.push({ pathname: "/homePages/search", params: { query: query } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style = {styles.contentContainer}>
        <Pressable onPress={search}>
          <Text style={styles.searchBar}>{query}</Text>
        </Pressable>
        {searchResults?.map((id) => (
          <CourseCardChannel id={id} key={id} />
        ))}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1E1E1E",
  },
  contentContainer: {
    padding: 15,
  },
  searchBar: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: "#333",
    color: "#fff",
    paddingHorizontal: 10,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  resultsList: {
    padding: 10,
  },
});

export default Results;
