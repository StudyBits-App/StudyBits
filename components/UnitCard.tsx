import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Unit, defaultUnit } from "@/utils/interfaces";
import { getUnit } from "@/services/getUserData";

interface UnitCardProps {
  id: string;
  courseId: string;
  selected: boolean;
  onPress?: () => void;
}

//component for unit seperate unit card display
const UnitCard: React.FC<UnitCardProps> = ({
  id,
  courseId,
  selected,
  onPress,
}) => {
  const [unit, setUnit] = useState<Unit>(defaultUnit);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const unitDoc = await getUnit(courseId, id);
        if (unitDoc && "data" in unitDoc) {
          const unitData = unitDoc.data() as Unit;
          setUnit(unitData);
        }
      } catch (error) {
        console.error("Error fetching unit: ", error);
      }
    };

    fetchUnit();
  }, [id, courseId]);

  return (
    <Pressable
      style={[
        styles.contentContainer,
        selected ? styles.selected : styles.unselected,
      ]}
      onPress={() => {
        if (onPress) {
          onPress();
        }
      }}
    >
      <View>
        <Text style={styles.contentTitle}>{unit.name}</Text>
        <Text style={styles.subText}>{unit.description}</Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    backgroundColor: "#2E2E2E",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    marginBottom: 10,
    borderColor: "grey",
    borderWidth: 1,
  },
  contentTitle: {
    fontSize: 20,
    color: "white",
  },
  subText: {
    fontSize: 16,
    color: "white",
  },
  selected: {
    borderColor: "#ADD8E6",
    borderWidth: 2,
  },
  unselected: {
    borderColor: "grey",
    borderWidth: 1,
  },
});

export default UnitCard;
