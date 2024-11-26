import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Unit, defaultUnit } from "@/utils/interfaces";
import { getUnit } from "@/services/getUserData";

interface UnitCardProps {
  id: string;
  courseId: string;
  selected: boolean;
  onPress?: () => void;
  onUnitNotFound?: (unitId: string) => void; 
}

const UnitCard: React.FC<UnitCardProps> = ({
  id,
  courseId,
  selected,
  onPress,
  onUnitNotFound,
}) => {
  const [unit, setUnit] = useState<Unit | null>(null);

  useEffect(() => {
    const fetchUnit = async () => {
      try {
        const unitDoc = await getUnit(courseId, id);
        if (unitDoc && "data" in unitDoc) {
          const unitData = unitDoc.data() as Unit;
          setUnit(unitData);
        } else {
          if (onUnitNotFound) {
            onUnitNotFound(id);
          }
        }
      } catch (error) {
        console.error("Error fetching unit: ", error);
        if (onUnitNotFound) {
          onUnitNotFound(id);
        }
      }
    };

    fetchUnit();
  }, [id, courseId, onUnitNotFound]);

  return (
    <Pressable
      style={[
        styles.contentContainer,
        selected ? styles.selected : styles.unselected,
        unit ? null : styles.disabled, 
      ]}
      onPress={() => {
        if (onPress && unit) {
          onPress();
        }
      }}
      disabled={!unit} 
    >
      <View>
        <Text style={styles.contentTitle}>
          {unit ? unit.name : "Loading..."}
        </Text>
        <Text style={styles.subText}>
          {unit ? unit.description : "Please wait"}
        </Text>
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
    marginVertical: 5,
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
  disabled: {
    backgroundColor: "#555555",
  },
});

export default UnitCard;
