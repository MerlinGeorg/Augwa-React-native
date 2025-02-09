import Fontisto from '@expo/vector-icons/Fontisto';

import { View } from "react-native";
const BellIcon = () =>{
    return(
        <View>
            <Fontisto name="bell" size={36} color="white" />
            {/* triggering the action from the search bar in the list, 
            write in the searchbar(child) and move into the list(parent)*/}
        </View>
    )

}
export default BellIcon