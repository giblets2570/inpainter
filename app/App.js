import { Dimensions, StyleSheet, Text, View, TouchableOpacity, Image, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { createStackNavigator } from '@react-navigation/stack'
import TakePhotoScreen from './TakePhotoScreen';
import AddMaskScreen from './AddMaskScreen';
import GetResultScreen from './GetResultScreen';

const Root = createStackNavigator()
const { width } = Dimensions.get('window')

export default function App() {
  return (
    <NavigationContainer>
      <Root.Navigator>
        <Root.Screen component={TakePhotoScreen} name='TakePhotoScreen'></Root.Screen>
        <Root.Screen component={AddMaskScreen} name='AddMaskScreen'></Root.Screen>
        <Root.Screen component={GetResultScreen} name='GetResultScreen'></Root.Screen>
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
