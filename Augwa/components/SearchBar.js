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
        backgroundColor: '#F0EEEE',
        height: 50,
        borderRadius: 5,
        flexDirection: 'row',
        alignItems:'stretch'
    },
    iconStyle: {
        color: 'black',
        fontSize: 35,
        alignSelf: 'center',
        marginHorizontal: 15
    },
    inputStyle: {
        fontSize: 20,
        flex: 1,
    
    }
})

export default SearchBar;