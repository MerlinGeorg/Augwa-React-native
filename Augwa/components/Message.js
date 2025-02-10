import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { View } from "react-native";
const Message = () =>{
    return(
        <View>
            <MaterialCommunityIcons name="message-processing-outline" 
            size={32} color="#fff" />
            {/* triggering the action from the search bar in the list, 
            write in the searchbar(child) and move into the list(parent)*/}
        </View>
    )

}
export default Message