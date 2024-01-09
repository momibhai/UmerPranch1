import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Customerinformations from './screens/Customerinformations';
import FirstScreen from './screens/FirstScreen';
import PaymentInformation from './screens/PaymentInformation';
import PayNowScreen from './screens/PayNowScreen';
import AddProducts from './screens/AddProducts';
import RemoveData from './screens/RemoveData';
import UploadDatabase from './screens/UploadDatabase';

const App = () => {
  const Stack = createNativeStackNavigator();
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{
        headerBackTitle: 'center',
        headerTitleAlign: 'center',
        statusBarColor: '#6dda09',
        navigationBarColor: '#6dda09',
      }}
        initialRouteName='FirstScreen'>
        <Stack.Screen name="Welcome To Rental App" component={FirstScreen} />
        <Stack.Screen name="AddProducts" component={AddProducts} />
        <Stack.Screen name="CustomerInformations" component={Customerinformations} />
        <Stack.Screen name="PaymentInformation" component={PaymentInformation} />
        <Stack.Screen name="PayNowScreen" component={PayNowScreen} />
        <Stack.Screen name="RemoveData" component={RemoveData} />
        <Stack.Screen name="UploadDatabase" component={UploadDatabase} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App
