import { View, StyleSheet, TextInput } from "react-native";
import Feather from '@expo/vector-icons/Feather';
import { Ionicons } from "@expo/vector-icons";

const SearchBar = ({term , onTermChange}) => {
    return (
        <View style={styles.viewStyle}>
            <Feather name="search" style={styles.iconStyle} />
            <TextInput
                value={term}
                onChangeText={onTermChange}
                style={styles.inputStyle}
                placeholder="Search"></TextInput>
                <Ionicons name="mic" style={styles.micIcon} />
        </View>
    )
}

const styles = StyleSheet.create({
    viewStyle: {
        backgroundColor: '#d3d3d3',
        marginTop: 10,
        width: "80%",
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems:'center',
        paddingHorizontal: 10,
        alignSelf: 'center'
    
    },
    iconStyle: {
        color: 'black',
        fontSize: 22,
        //alignSelf: 'center',
        //marginHorizontal: 15
        marginRight: 10
    },
    micIcon: {
        color: '#000',
        fontSize: 22,
        marginLeft: 10
    },
    inputStyle: {
        fontSize: 18,
        top: 5,
        flex: 1
    },
})

export default SearchBar;