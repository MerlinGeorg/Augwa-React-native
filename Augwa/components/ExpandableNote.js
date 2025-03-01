import { Ionicons } from "@expo/vector-icons";
import { useCallback, useState } from "react";
import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";

export const ExpandableNote = ({ note }) => {
  const [expanded, setExpanded] = useState(false);
  const [hasLongContent, setHasLongContent] = useState(false);

  const onTextLayout = useCallback(e => {
    setHasLongContent(e.nativeEvent.lines.length > 3);
  }, []);

  //const hasLongContent = note.content && note.content.split("\n").length > 3;

  const toggleExpand = () => {
    setExpanded((prev) => !prev);
  };

  return (
    <View style={styles.note}>
      <View style={styles.row}>
        <Text style={styles.noteAuthor}>{note.author}</Text>
        <Text style={styles.noteDate}>
          {new Date(note.dateCreated).toLocaleString()}
        </Text>
      </View>

      <TouchableOpacity onPress={toggleExpand} style={styles.contentContainer}>
        <View style={styles.textRow}>
          {note.imageUrl && (
            <Ionicons name="image-outline" size={18} color="#177de1" style={styles.imageIcon} />
          )}
          <Text 
            numberOfLines={!expanded && hasLongContent ? 3 : undefined} 
            onTextLayout={onTextLayout}
            style={styles.noteText}
          >
            {note.content}
          </Text>
        </View>
        {(hasLongContent || note.imageUrl) && (
          <Ionicons
            name={expanded ? "chevron-up-outline" : "chevron-down-outline"}
            size={20}
            color="#888"
            style={styles.expandIcon}
          />
        )}
      </TouchableOpacity>

      {expanded && note.imageUrl && (
        <Image source={{ uri: note.imageUrl }} style={styles.noteImage} />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  note: {
    backgroundColor: "#F1F1F1",
    padding: 10,
    borderRadius: 5,
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 5,
  },
  noteAuthor: {
    fontWeight: "bold",
  },
  noteDate: {
    fontSize: 12,
    color: "#888",
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  textRow: {
    flexDirection: 'row',
    flex: 1,
  },
  imageIcon: {
    marginRight: 5,
    marginTop: 2,
  },
  noteText: {
    flex: 1,
  },
  expandIcon: {
    marginLeft: 5,
  },
  noteImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
    marginTop: 10,
    borderRadius: 5,
  },
});
