import {Alert, ScrollView, View, Text,StyleSheet, TextInput,SafeAreaView,TouchableOpacity,Keyboard,TouchableWithoutFeedback, Modal } from 'react-native'
import React  from 'react'
import { db,authentication } from '../firebaseConfig';
import { useState, useEffect, useRef } from 'react';
import firestore  from '@react-native-firebase/firestore';
import { getFirestore, doc, onSnapshot, collection, setDoc, getDoc, increment } from 'firebase/firestore';
import DatePicker from 'react-native-modern-datepicker';
import { MaterialIcons } from '@expo/vector-icons'; 
import { getToday,getFormatedDate } from 'react-native-modern-datepicker';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useNavigation } from '@react-navigation/core';
import { getAuth, signOut, onAuthStateChanged  } from '@firebase/auth';
import {Picker} from '@react-native-picker/picker';
import * as Location from 'expo-location';
const barangays = [
  "Alegria",
  "Bicao",
  "Buenavista",
  "Buenos Aires",
  "Calatrava",
  "El Progreso",
  "El Salvador",
  "Guadalupe",
  "Katipunan",
  "La Libertad",
  "La Paz",
  "La Salvacion",
  "La Victoria",
  "Matin-ao",
  "Montehermoso",
  "Montesuerte",
  "Montesunting",
  "Montevideo",
  "Nueva Fuerza",
  "Nueva Vida Este",
  "Nueva Vida Norte",
  "Nueva Vida Sur",
  "Poblacion Norte",
  "Poblacion Sur",
  "Tambo-an",
  "Vallehermoso",
  "Villaflor",
  "Villafuerte",
  "Villacayo",
];



const auth = getAuth();
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});



const FileComplaint =()=>{
  const [userData, setUserData] = useState(null);
  const [name,setName] =useState('')
  const [barangay,setBarangay] =useState('')
  const [street,setStreet] =useState('')
  const [message,setMessage] =useState('')
  const [wanted,setWanted] =useState('')
  const [complainee,setComplainee] =useState('')
  const [nameError, setNameError]= useState('');
  const [detailsError, setDetailsError]= useState('');
  const [date,setDate]=useState('12/12/2023');
  const [selectedDate, setSelectedDate] = useState('');
  const [open, setOpen]=useState(false);
  const today = new Date();
  const navigation=useNavigation();
  const startDate = getFormatedDate(today.setDate(today.getDate()), 'YYYY/MM/DD')
  const [initialRegion, setInitialRegion] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const mapRef = useRef(null);
  const userMovedMap = useRef(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      const currentUser = getAuth().currentUser;
      const db = getFirestore();
      const userRef = doc(db, 'User', currentUser.uid);
  
      const unsubscribe = onSnapshot(userRef, (doc) => {
        const data = doc.data();
        setUserData(data);
      });
  
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }
  
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
  
        setInitialRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
        setMarkerPosition({ latitude, longitude });
        setUserLocation({ latitude, longitude });
      } catch (error) {
        console.error('Error getting current location', error);
      }
  
      return unsubscribe;
    };
  
    fetchData();
  }, []);
  
  
  
  const onRegionChange = (region) => {
    if (!userMovedMap.current) {
      const { latitude, longitude } = markerPosition;
      setMarkerPosition({ latitude: region.latitude, longitude: region.longitude });
    }
  };
  function handleOnPress (){
    setOpen(!open);
  }
  function handleChange (propDate){
    setDate(propDate);
  }
  const pressSubmit = async () => {
    if (name.length === 0) {
      setNameError('Name is required');
    } else if (message.length === 0) {
      setDetailsError('Cannot be empty');
    } else if (message.length < 10) {
      setDetailsError('Cannot be less than 10 characters');
    } else if (markerPosition === null) {
      Alert.alert('Location not selected', 'Please select a location on the map');
    } 
      try {
       
  
        const db = getFirestore();
        const userDoc = doc(collection(db, 'Complaints'));
  
        // Get the current transaction ID from Firestore
        const transactionNumberDoc = doc(db, 'TransactionComp', 'transactionCompId');
        const transactionSnapshot = await getDoc(transactionNumberDoc);
        let transactionCompId = '00001'; // Default value if no transaction ID exists
  
        if (transactionSnapshot.exists()) {
          const { currentNumber } = transactionSnapshot.data();
          transactionCompId = (currentNumber + 1).toString().padStart(5, '0');
        }
  
        const location = {
          latitude: markerPosition.latitude,
          longitude: markerPosition.longitude,
        };
        const currentDate = new Date();
        await setDoc(userDoc, {
          userId: currentUser.uid,
          name,
          message,
          date,
          wanted,
          complainee,
          barangay,
          street,
          type: 'Complaints',
          status: 'Pending',
          transactionCompId,
          location,
          timestamp: currentDate.toISOString(),
        });
    const updatedTransactionNumber = transactionSnapshot.exists() ? transactionSnapshot.data().currentNumber + 1 : 1;
    const updatedTransactionNumberDoc = doc(db, 'TransactionsComp', 'transactionCompId');
    await setDoc(updatedTransactionNumberDoc, { currentNumber: updatedTransactionNumber });
    setLoading(false); // Set loading state to false
      Alert.alert('Complaint Successful!', 'Your complaint is under review.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
          style: 'cancel',
        },
      ], { textAlign: 'center' });
    } catch (error) {
      console.error('Error adding user:', error);
      Alert.alert('Error', 'An error occurred while filing the complaint.', [
        {
          text: 'OK',
          onPress: () => {}, // Optional: Handle error dismissal
        },
      ], { textAlign: 'center' });
      setLoading(false); 
    }
  
};
const handleWantedChange = (selectedValue) => {
  setWanted(selectedValue);
};
const onMarkerDragStart = () => {
  // Set the userMovedMap flag to true when the marker drag starts
  userMovedMap.current = true;
};

const onMarkerDragEnd = (e) => {
  const { latitude, longitude } = e.nativeEvent.coordinate;
  setMarkerPosition({ latitude, longitude });
  userMovedMap.current = false;
};

const onMapPanDrag = () => {
userMovedMap.current = true;
};
const onUserLocationChange = (location) => {
const { latitude, longitude } = location.coords;
setUserLocation({ latitude, longitude });

if (!userMovedMap.current) {
  setMarkerPosition({ latitude, longitude });
}
};
  return (
    <ScrollView>
    <SafeAreaView className="flex-1  bg-white">
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View className="mt-16">
    <Text className="font-bold text-xl mx-auto">File Complaint Form</Text>
    <Text className="mx-auto italic mb-4 w-44 text-center">To file a complaint, Please provide the following information</Text>
    <Text className="ml-5 mb-2 text-sm">Name</Text>
    <TextInput
    className="border-0.5 w-11/12 px-4 py-3 rounded-lg bg-gray-100 mx-auto mb-2"
    placeholder='Enter your name'
    value={name}
    onChangeText={(name)=>{setName(name)}}
    
     />
    <Text className="ml-5 mb-2 text-sm">Description</Text>
    <TextInput
    className="border-0.5 w-11/12 px-4 rounded-lg mb-2 bg-gray-100 mx-auto h-32 text-start"
    placeholder='Details of the incident'
    editable
    multiline
    numberOfLines={6}
    value={message}
    onChangeText={(message)=>{setMessage(message)}}
    style={{ textAlignVertical: 'top', paddingTop: 10, }} 
     />
     <Text className="ml-5 mb-2 text-sm">Was the suspect wanted/have or had any charges against him/her</Text>
     <View className="border-0.5 w-11/12 px-4 py-3 rounded-lg bg-gray-100 mx-auto mb-2 h-10 justify-center" >
     <Picker
       selectedValue={wanted}
       onValueChange={(itemValue) => handleWantedChange(itemValue)}
       style={{ height: 40, width: '100%' }}
     >
       <Picker.Item label="Yes" value="Yes" />
       <Picker.Item label="No" value="No" />
       <Picker.Item label="I don't know" value="I don't know" />
     </Picker>
   </View>
    <Text className="ml-5 mb-2 text-sm">Complainee</Text>
    <TextInput
    className="border-0.5 w-11/12 px-4 py-3 rounded-lg bg-gray-100 mx-auto mb-2"
    placeholder='Enter the name that is being complained'
    value={complainee}
    onChangeText={(complainee)=>{setComplainee(complainee)}}
    />
    <Text className="ml-5 mb-2 text-sm">Date of the incident</Text>
    <TouchableOpacity className="flex-row justify-center  items-start border-0.5 w-11/12 px-4 py-3 rounded-lg bg-gray-100 mx-auto mb-2"
    onPress={handleOnPress}>
    <MaterialIcons  name="date-range" size={24} color="black" />
    <Text className="text-center mx-auto text-xl justify-center">{date}</Text>
    </TouchableOpacity>
    <Modal
    animationType='slide'
    transparent={true}
    visible={open}
    >
    <View className="flex w-4/5 mx-auto mt-10 bg-white">
    <DatePicker
    mode='calendar'
    minimumDate={startDate}
    selected={selectedDate}
    onDateChange={handleChange}
    />
    <TouchableOpacity
    onPress={handleOnPress}>
    <Text className="mx-auto font-bold text-xl">Close</Text>
    </TouchableOpacity>
   
    </View>
    </Modal>
    <View className="border-t-0.5 mx-4 mt-3">
    </View>
    <View>
    <Text className="text-lg font-bold ml-5 my-2">Address Information</Text>
    <View className="border-b-0.5 mx-4">
    </View>
     </View>
     <View className="mt-2">
     <Text className="ml-5 mb-2 text-sm">Street</Text>
    <TextInput
    className="border-0.5 w-11/12 px-4 py-3 rounded-lg bg-gray-100 mx-auto mb-2"
    placeholder='Enter your street'
    value={street}
    onChangeText={(street)=>{setStreet(street)}}
     />
     </View>
     <Text className="ml-5 mb-2 text-sm">Select Barangay</Text>
     <View className="justify-center w-11/12 h-12 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2">
     <Picker
     selectedValue={barangay}
     onValueChange={(itemValue) => setBarangay(itemValue)}
   >
   <Picker.Item label="Barangay" value="" />
     {barangays.map((barangay)=>(
       <Picker.Item key={barangay} label={barangay} value={barangay} placeholder="Barangay"/>
     ))}
   </Picker>
   </View>
   {initialRegion ? (
    <MapView
          style={styles.map}
          onRegionChange={onRegionChange}
          initialRegion={initialRegion}
          ref={mapRef}
          onPanDrag={onMapPanDrag}
        >
          {markerPosition && (
            <Marker
              coordinate={markerPosition}
              draggable
              onDragEnd={onMarkerDragEnd}
            />
          )}
          {userLocation && (
            <Circle
              center={userLocation}
              radius={200}
              fillColor="rgba(0, 128, 255, 0.2)"
              strokeColor="rgba(0, 128, 255, 0.5)"
            />
      )}
    </MapView>
  ) : (
    <Text>Loading...</Text>
  )}
  <TouchableOpacity
  className="w-11/12 mt-4 px-4 py-3 rounded-lg bg-red-700 items-center mx-auto mb-4"
  onPress={pressSubmit}
  disabled={loading} // Disable the button while loading is true
>
    <Text className="text-white text-lg font-medium mx-auto">Submit</Text>

</TouchableOpacity>

    </View>
    </TouchableWithoutFeedback>
    </SafeAreaView>
    </ScrollView>
  )
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    marginHorizontal: 20,
    height:250,
  },
});
export default FileComplaint;