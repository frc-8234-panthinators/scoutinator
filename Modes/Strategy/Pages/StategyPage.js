import * as React from 'react';
import { Text, View, Button, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Colors from '../../../colors';
import * as NavigationBar from 'expo-navigation-bar';


import StratSettings from './stratSettings';
import MyTabBar from '../Components/StratTabBar';
import VisualView from '../Components/DataVis';
import Search from './Search';
import EventPicker from './EventPicker';
import YearPicker from './YearPicker';
import ErrorPage from '../../CommonComponents/ErrorPage';



function TestScreen() {
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center'}}>
			<Text>Test!</Text>
		</View>
	);
}

/*function HomeScreen() {
  
	return (
    
 
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background }}>
			<Text>Home!</Text>
      <FontAwesome name="search" size={24} color="black" />
		</View>
	);
}*/

function HomeScreen(props) {
	const gotoTestStackScreen = () => {
		props.navigation.navigate('Test');
	};
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: (Colors.background)}}>
			<Text>Home!</Text>
			<Button title="Go to test stack screen" onPress={gotoTestStackScreen} />
		</View>
	);
}

function SettingsScreen(props) {
    const gotoTestStackScreen = () => {
		props.navigation.navigate('AdminMode');
	};

    return (
        <Search navigation={props.navigation}/>
	);
}


const Tab = createBottomTabNavigator();

function MyTabs() {
	return (
		<Tab.Navigator /*screenOptions={{headerShown: false}}*/   tabBar={props => <MyTabBar {...props} />}>
			<Tab.Screen name="StratHome" component={HomeScreen}  options={{ headerStyle: {
              backgroundColor: (Colors.tab)
           }}}/>
            <Tab.Screen name="Search" component={SettingsScreen} />
			<Tab.Screen name="StratSettings" component={StratSettings} />
		</Tab.Navigator>
	);
}

const Stack = createStackNavigator();

export default function Strategy() {
	return (
		
			<Stack.Navigator initialRouteName="Tabs" independant={true}   screenOptions={{
                cardStyle: { backgroundColor: (Colors.background) } // Set the background color to blue
              }}/*screenOptions={{headerShown: false}}*/>
				<Stack.Screen name="Tabs" component={MyTabs} options={{headerShown:false}} />
				<Stack.Screen name="EventPicker" component={EventPicker} />
				<Stack.Screen name="YearPicker" component={YearPicker} />
				<Stack.Screen name="VisualView" component={VisualView} />
				<Stack.Screen name="ErrorPage" component={ErrorPage} />
      	        <Stack.Screen name="Test" component={TestScreen} />
			</Stack.Navigator>
		
	);
}




/* import { Text, View, Button, TouchableOpacity } from 'react-native';


export default function Home(props) {

    const gotoTestStackScreen = () => {
		props.navigation.navigate('Test');
	};
	return (
		<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
			<Text>Home!</Text>
			<Button title="Go to test stack screen" onPress={gotoTestStackScreen} />
		</View>
	);
}*/