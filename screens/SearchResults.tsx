import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, StyleSheet, Pressable } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { searchCourses } from '@/utils/searchAlgorithm';
import CourseCardShort from '@/components/CourseCardShort';

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
    router.push({ pathname: '/homePages/search', params: { query: query } });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Pressable style={styles.searchBarContainer} onPress={search}>
        <Text style={styles.searchBar}>{query}</Text>
      </Pressable>
      {searchResults?.map((id) => (
        <CourseCardShort action={false} id={id} key={id} />
      ))}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  searchBarContainer: {
    padding: 10,
  },
  searchBar: {
    padding: 15,
    backgroundColor: '#333',
    color: '#fff',
    paddingHorizontal: 10,
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resultsList: {
    padding: 10,
  },
});

export default Results;
