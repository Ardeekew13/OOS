import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Alert, ScrollView, TouchableOpacity, Button } from 'react-native';
import { doc, onSnapshot, getFirestore, updateDoc } from '@firebase/firestore';
import { getAuth, signOut, onAuthStateChanged } from '@firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/core';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getStorage } from 'firebase/storage';
import firebaseConfig from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { AntDesign, Ionicons, FontAwesome, MaterialIcons, Entypo } from '@expo/vector-icons'; 
const storage = getStorage(firebaseConfig);
const auth = getAuth();

const barangays = ["Alegria",
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
"Villacayo",];

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [newFName, setNewFName] = useState('');
  const [newLName, setNewLName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(userData?.address || 'Select a barangay');
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const currentUser = getAuth().currentUser;
    const db = getFirestore();
    const userRef = doc(db, 'User', currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (doc) => {
      const data = doc.data();
      setUserData(data);
      setNewFName(data.Fname);
      setNewLName(data.Lname);
      setNewEmail(data.email);
      setNewPhone(data.phone);
      setNewAddress(data.address);
       setSelectedAddress(data.address);
    });

    return unsubscribe;
  }, []);

  if (!userData) {
    return <Text>Loading...</Text>;
  }
  const clearSelection = () => {
    setSelectedBarangay('');
  };
  const handleBarangaySelect = (barangay) => {
    setSelectedAddress(barangay);
    setIsPickerOpen(false);
  };
  const saveChanges = async () => {
    try {
      const currentUser = getAuth().currentUser;
      const db = getFirestore();
      const userRef = doc(db, 'User', currentUser.uid);

      const updatedData = {
        Fname: newFName,
        Lname: newLName,
        email: newEmail,
        phone: newPhone,
        address: selectedAddress,
      };

      await updateDoc(userRef, updatedData);
      Alert.alert('Changes saved successfully!');
    } catch (error) {
      console.error('Error saving changes:', error);
    }
  };
  
  
  // Check if the user has a profile picture URL
  const hasProfilePicture = userData.profilePictureURL !== undefined && userData.profilePictureURL !== null;
  
  // If the user has a profile picture URL, display it; otherwise, display the default image
  const profilePicture = hasProfilePicture ? { uri: userData.profilePictureURL } : require('./images/user.jpg');
  
  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4,3],
        quality: 1
    });
    const source = {uri: result.assets[0].uri}
    console.log(source)
    setImage(source)
};
const uploadImage = async () => {
  setUploading(true);
  const currentUser = getAuth().currentUser;
  const db = getFirestore();
  const response = await fetch(image.uri);
  const blob = await response.blob();
  const filename = currentUser.uid;
  const storageRef = ref(storage, 'profilePictures/${filename}id');

  
  try {
    await uploadBytes(storageRef, blob);
    Alert.alert('Photo uploaded!');

  } catch (e) {
    console.log(e);
  }
  
  setUploading(false);

  setImage(null);
}
const Signout =()=>{
const auth = getAuth();
signOut(auth).then(() => {
  navigation.navigate('LoginForm');
}).catch((error) => {
  // An error happened.
});
}
const handleVerify = () => {
  navigation.navigate('Citizen Verification');
};

return (
  <ScrollView>
  <SafeAreaView> 
      
      <Text className="mx-auto font-bold text-xl mb-4 ">Personal Information</Text>
      <View className="mx-auto mb-2 ">
      <View className="flex-row">
      <View className="justify-center mr-2">
      <FontAwesome name="user" size={32} color="black" />
      </View>
      <View className="flex-col">
      <Text className=" text-sm text-stone-500">First Name</Text>
      <TextInput className=" text-lg " value={newFName} onChangeText={setNewFName} editable={true} />
      <View className="border-0.5 w-56 justify-center mx-auto"></View>
</View>
</View>
</View>
<View className="mx-auto mt-5 mb-2 ">
<View className="flex-row">
<View className="justify-center mr-2">
<Entypo name="user" size={30} color="black" />
</View>
<View className="flex-col">
<Text className=" text-sm text-stone-500">Last Name</Text>
<TextInput className=" text-lg " defaultValue={userData.Lname} onChangeText={setNewLName} editable={true}/>
<View className="border-0.5 w-56 justify-center mx-auto"></View>

</View>
</View>
</View>
      
      <View className="mx-auto mt-5 mb-2 ">
      <View className="flex-row">
      <View className="justify-center mr-2">
      <MaterialIcons name="email" size={30} color="black" />
      </View>
      <View className="flex-col">
      <Text className=" text-sm text-stone-500">Email</Text>
      <TextInput className=" text-lg " defaultValue={userData.email} onChangeText={setNewEmail} editable={true}/>
      <View className="border-0.5 w-56 justify-center mx-auto"></View>

      </View>
      </View>
      </View>
      <View className="mx-auto mt-5 mb-2 ">
      <View className="flex-row">
      <View className="justify-center mr-2">
      <FontAwesome name="phone" size={30} color="black" />
      </View>
      <View className="flex-col justify-center">
      <Text className=" text-sm text-stone-500">Phone Number</Text>
      <TextInput className=" text-lg " defaultValue={userData.phone} onChangeText={setNewPhone} editable={true}/>
    <View className="border-0.5 w-56 justify-center mx-auto"></View>

      </View>
      </View>
      </View>
      <View className="mx-auto mt-4">
      <View className="flex-row">
      <View className="justify-center mb-12 mr-2 flex-col">
      <Ionicons name="location-sharp" size={30} color="black" />
    </View>
    <View className="flex-col justify-center relative">
      <Text className="text-sm text-stone-500">Barangay</Text>
      <TouchableOpacity
    onPress={() => setIsPickerOpen(!isPickerOpen)}
    style={{
      flexDirection: 'row',
    }}
  >
        <Text className="text-base">{selectedAddress}</Text>
        <Ionicons
          name={isPickerOpen ? 'chevron-up' : 'chevron-down'}
          size={24}
          color="black"
        />
      </TouchableOpacity>
      {isPickerOpen && (
        <View>
      <ScrollView style={{ maxHeight: 250, backgroundColor:'white', paddingHorizontal:10, paddingVertical:10, borderRadius:20 }}>
          {barangays.map((barangay, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => handleBarangaySelect(barangay)}
              
            >
              <Text className="text-lg mt-2 mb-1">{barangay}</Text>
              
            </TouchableOpacity>
          ))}
          </ScrollView>
        </View>
      )}
      <View className="border-0.5 w-56 justify-center mx-auto"></View>
    <TouchableOpacity
    style={{
      width: '80%',
      alignSelf: 'center',
      backgroundColor: 'red',
      padding: 10,
      borderRadius: 5,
      marginTop: 20,
    }}
    onPress={saveChanges}
  >
    <Text style={{ color: 'white', textAlign: 'center' }}>Save</Text>
  </TouchableOpacity>
      </View>
      </View>
      </View> 

  </SafeAreaView> 
  </ScrollView>
);
}
export default Profile;