import { View, StyleSheet, TextInput } from "react-native";
import Feather from '@expo/vector-icons/Feather';

const SearchBar = ({term , onTermChange}) => {
    return (
        <View style={styles.viewStyle}>
            <Feather name="search" style={styles.iconStyle} />
            <TextInput
                value={term}
                onChangeText={onTermChange}
                style={styles.inputStyle}
                placeholder="Search"></TextInput>
        </View>
    )
}

const styles = StyleSheet.create({
    viewStyle: {
        backgroundColor: '#d3d3d3',
        margin: 10,
        marginLeft:20,
        height: 40,
        borderRadius: 10,
        flexDirection: 'row',
        alignItems:'stretch'
    },
    iconStyle: {
        color: 'black',
        fontSize: 25,
        alignSelf: 'center',
        marginHorizontal: 15
    },
    inputStyle: {
        fontSize: 20,
        position: 'relative',
        top: 5
    }
})

export default SearchBar;