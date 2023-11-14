import React, { useState } from 'react';
import { Alert, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView,TouchableWithoutFeedback,Keyboard, Platform, ScrollView} from 'react-native';
import { collection, doc,setDoc,addDoc, getFirestore} from "firebase/firestore"; 
import { db,authentication,storage} from '../firebaseConfig';
import {Picker} from '@react-native-picker/picker';
import {createUserWithEmailAndPassword,getAuth } from 'firebase/auth';
import firestore  from '@react-native-firebase/firestore';
import { Entypo, Ionicons, Feather } from '@expo/vector-icons'; 
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigation } from '@react-navigation/native';

const roles = ['Citizen', 'Police'];
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

const AdminRegisterPolice = () => {
  const [isSignedIn,setIsSignedIn]=useState(false);
  const [Fname, setFName] = useState('');
  const [Lname, setLName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole]=useState('');
  const [address, setAddress]=useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [emailError, setEmailError]= useState('');
  const [passwordError, setPasswordError]= useState('');
  const [roleError, setRoleError]= useState('');
  const [addressError, setAddressError]= useState('');
  const [nameError, setNameError]= useState('');
  const [idImage, setidImage] = useState(null);
  const [phoneError, setPhoneError]= useState('');
  const [idError, setIdError]= useState('');
  const [idProofUrl, setIdProofUrl]= useState(null);
  const [idProofBlob, setIdProofBlob] = useState(null);

  const navigation =useNavigation();
  
  
  const backButton= async () => {
    navigation.goBack()
  };
  const defaultPoliceImage = 'https://img.freepik.com/premium-vector/cop-icon-flat-style-design-police-officer-avatar-vector-illustration-isolated-white-background-symbol-security-law-order-policeman-sheriff_153097-648.jpg'; 
const defaultUserImage = 'https://w7.pngwing.com/pngs/223/244/png-transparent-computer-icons-avatar-user-profile-avatar-heroes-rectangle-black.png  '; 
  const handleSubmit = async () => {
    
    let errorType = null;
    switch (true) {
      case Fname.length === 0:
        errorType = "First name is required";
        break;
        case Lname.length === 0:
          errorType = "Last name is required";
          break;
      case !email.includes("@"):
        errorType = "Invalid Email";
        break;
      case password.length < 6:
        errorType = "Password must be at least 6 characters";
        break;
      case email.indexOf(" ") > 0:
        errorType = "Email cannot contain spaces";
        break;
      case email.length === 0:
        errorType = "Email is required";
        break;
      case password.indexOf(" ") > 0:
        errorType = "Password cannot contain spaces";
        break;
      case password !== confirmPassword:
        errorType = "Password does not match";
        break;
      case phone.length !== 11:
          errorType = "Phone number must be 11 digits";
          break;
      case !role:
        errorType = "Role is empty";
        case !role:
          errorType = "Address cannot be empty";
      default:
        break;
    }
  
    if (errorType) {
      switch (errorType) {
        case "First name is required":
          setNameError(errorType);
          break;
          case "Address cannot be empty":
            setAddressError(errorType);
            break;
           
          case "Last name is required":
            setNameError(errorType);
            break;
            case "Phone number must be 11 digits":
              setPhoneError(errorType);
              break;
              case "Invalid phone number":
                setPhoneError(errorType);
                break;
        case "Invalid Email":
          setEmailError(errorType);
          break;
        case "Password must be at least 6 characters":
          setPasswordError(errorType);
          break;
        case "Email cannot contain spaces":
          setEmailError(errorType);
          break;
        case "Email is required":
          setEmailError(errorType);
          break;
        case "Password cannot contain spaces":
          setPasswordError(errorType);
          break;
        case "Password does not match":
          setPasswordError(errorType);
          break;
        case "Role is empty":
          setRoleError(errorType);
          break;
        default:
          break;
      }
    } else {
      setNameError("");
      setPasswordError("");
      setEmailError("");
      setRoleError("");
      setPhoneError("");
      setAddressError("");
     
     
      let defaultImageUrl = '';
      if (role === 'Police') {
        defaultImageUrl = defaultPoliceImage;
      } else if (role === 'Citizen') {
        defaultImageUrl = defaultUserImage;
      }
    
      try {
        //Firebase auth
        const authentication = getAuth();
        const userCredentials = await createUserWithEmailAndPassword(
          authentication,
          email,
          password
        );
        const user = userCredentials.user;
          //Connect to firestore
        const db = getFirestore();
        const usersCollection = collection(db, "User");
        const userDoc = doc(usersCollection, user.uid);
        await setDoc(userDoc, {
          email,
          Fname,
          Lname,
          phone,
          role,
          selfiePicture: defaultImageUrl,
          address,
          status: role === "Police" ? "Verified" : "Unverified", // Check role and set status
        });
        console.log();
        Alert.alert(
          'Registered Successfully!', 
          'You can now use the  account created', 
          [    {      text: 'Okay',      onPress: () => navigation.goBack() }  ],
          { 
            containerStyle: { 
              justifyContent: 'center', 
              alignItems: 'center',
              flex:1
            },
            contentContainerStyle: { 
              justifyContent: 'center', 
              alignItems: 'center' 
            }
          }
        );
      } catch (error) {
        console.log(error);
      
    }
  };
}
  return (
    <ScrollView>
    <KeyboardAvoidingView behavior={Platform.OS==='ios'? 'padding':'null'} className="flex-1">
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <View className="flex-1 justify-center bg-white">
    <Image
        className="w-72 h-32 items-center justify-center mx-auto"
        source={require('./images/alertado.jpg')}
      
      />
      <Text className="ml-5 mb-2 text-sm  ">First Name</Text>
      <TextInput
          className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
          placeholder="Enter your First Name"
          value={Fname}
          onChangeText={(Fname)=>{setFName(Fname)}}
        />
        <Text className="mx-auto color-red-500">{nameError} </Text>
        <Text className="ml-5 mb-2 text-sm  ">Last Name</Text>
        <TextInput
          className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto "
          placeholder="Enter your First Name"
          value={Lname}
          onChangeText={(Lname)=>{setLName(Lname)}}
        />
        <Text className="mx-auto color-red-500">{nameError} </Text>
        <Text className="ml-5 mb-2 text-sm  ">Phone Number</Text>
        <TextInput
          className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto "
          placeholder="Enter your Phone number"
          value={phone}
          onChangeText={(phone)=>{setPhone(phone)}}
        />
        <Text className="mx-auto color-red-500">{phoneError} </Text>
        <Text className="ml-5 mb-2 text-sm">Select Barangay</Text>
        <View className="justify-center w-11/12 h-12 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2">
        <Picker
        selectedValue={address}
        onValueChange={(itemValue) => setAddress(itemValue)}
      >
      <Picker.Item label="Barangay" value="" />
        {barangays.map((address)=>(
          <Picker.Item key={address} label={address} value={address} placeholder="Barangay"/>
        ))}
      </Picker>
      </View>
        <Text className="mx-auto color-red-500">{addressError} </Text>
        <Text className="ml-5 mb-2 text-sm">Email</Text>
        <TextInput
        className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto"
          placeholder="Enter your Email"
          value={email}
          onChangeText={(email)=>{setEmail(email)}}
        />
        <Text className="mx-auto color-red-500">{emailError} </Text>
        <Text className="ml-5 mb-2 text-sm">Select a role</Text>
        <View className="justify-center w-11/12 h-12 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2">
        <Picker
        selectedValue={role}
        onValueChange={(itemValue) => setRole(itemValue)}
      >
      <Picker.Item label="Role" value="" />
        {roles.map((role)=>(
          <Picker.Item key={role} label={role} value={role}/>
        ))}
      </Picker>
      </View>
      
      <Text className="mx-auto color-red-500">{roleError} </Text>
        <Text className="ml-5 text-sm">Password</Text>
        <TextInput
        className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
          placeholder="Enter your Password"
          value={password}
          onChangeText={(password)=>{setPassword(password)}}
          secureTextEntry={true}
        />
        <Text className="mx-auto color-red-500">{passwordError} </Text>
        <Text className="ml-5 mb-2 text-sm">Confirm Password</Text>
        <TextInput
        className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={(confirmPassword)=>{setConfirmPassword(confirmPassword)}}
          secureTextEntry={true}
        />
        <TouchableOpacity
          className="w-11/12 mt-4 px-4 py-1 rounded-lg bg-[#E31A1A] items-center mx-auto mb-4"
          onPress={handleSubmit}
        >
          <Text className="text-white text-lg font-medium mx-auto mb-2">Register</Text>
        </TouchableOpacity>
      
     
      
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default AdminRegisterPolice;