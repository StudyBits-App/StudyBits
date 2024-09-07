import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  StyleSheet,
  Pressable,
  View,
  ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { searchCourses } from "@/utils/searchAlgorithm";
import CourseCardShort from "@/components/CourseCardShort";

const Results: React.FC = () => {
  const { query } = useLocalSearchParams<{ query: string }>();
  const [searchResults, setSearchResults] = useState<string[]>([]);
  const [lastQuery, setLastQuery] = useState<string>("");

  useEffect(() => {
    if (query) {
      handleSearch();
    } else if (lastQuery) {
      handleSearch(lastQuery);
    }
  }, [query]);

  const handleSearch = async (searchQuery?: string) => {
    const searchTerm = searchQuery ?? query;
    if (searchTerm && searchTerm.trim()) {
      const results = await searchCourses(searchTerm.trim());
      setSearchResults(results);
      setLastQuery(searchTerm);
    }
  };

  const search = () => {
    router.push({ pathname: "/homePages/search", params: { query: query } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.contentContainer}>
        <Pressable onPress={search}>
          <Text style={styles.searchBar}>{query || lastQuery}</Text>
        </Pressable>
        <ScrollView>
          {searchResults?.map((id) => (
            <CourseCardShort
              channelDisplay={true}
              id={id}
              key={id}
              link="/homePages/viewCourse"
            />
          ))}
        </ScrollView>
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
  },
  resultsList: {
    padding: 10,
  },
});

export default Results;
