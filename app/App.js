import { Dimensions, StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import TakePhotoScreen from './TakePhotoScreen';
import AddMaskScreen from './AddMaskScreen';

console.log(AddMaskScreen)

const Root = createStackNavigator()
const { width } = Dimensions.get('window')

const Screen2 = ({ navigation, route }) => {
  return <View style={styles.screen}>
    <Image source={{ uri: route.params.imageUri }} style={styles.image} />
    <TouchableOpacity
      title="Go to Screen 1"
      onPress={() => {
        navigation.pop()
      }}
    />
  </View>
}

export default function App() {
  return (
    <NavigationContainer>
      <Root.Navigator>
        <Root.Screen component={TakePhotoScreen} name='TakePhotoScreen'></Root.Screen>
        <Root.Screen component={AddMaskScreen} name='AddMaskScreen'></Root.Screen>
      </Root.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  image: {
    width: width,
    height: width,
    marginTop: 20,
  },
});
