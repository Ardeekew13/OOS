import React, {useState} from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Alert, View, TextInput, TouchableOpacity, Text, Image, KeyboardAvoidingView, TouchableWithoutFeedback, Keyboard, Platform, ScrollView } from 'react-native';
import { collection, doc, setDoc, addDoc, getFirestore } from "firebase/firestore";
import { db, authentication, storage } from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import { createUserWithEmailAndPassword, getAuth } from 'firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { Entypo, Ionicons, Feather } from '@expo/vector-icons';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigation } from '@react-navigation/native';
import { initializeApp } from '@react-native-firebase/app';


const roles = ['Citizen', 'Tourist Police',];
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

const RegistrationForm = () => {
  const { control, watch, handleSubmit, setValue, formState: { errors } } = useForm();
  const navigation = useNavigation();
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
  const [barangay, setBarangay] = useState('');
  const [barangayError, setBarangayError] = useState('');


  const onSubmit = async (data) => {
    try {
      const userCredentials = await createUserWithEmailAndPassword(
        authentication,
        data.email,
        data.password
      );
      const user = userCredentials.user;
  
      const usersCollection = collection(db, "User");
      const userDoc = doc(usersCollection, user.uid);
      await setDoc(userDoc, {
        email: data.email,
        Fname: data.Fname,
        Lname: data.Lname,
        phone: data.number,
        role: data.role,
        idProofUrl,
        address: data.barangay,
        status: "Unverified",
        warning:0,
      });
  
      Alert.alert(
        'Registered Successfully!', 
        'You can now log in to your account', 
        [
          { text: 'Sign in', onPress: () => navigation.goBack() }
        ],
        { justifyContent: 'center', alignItems: 'center', flex: 1 }
      );
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <ScrollView>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'null'} className="flex-1">
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View className="flex-1 justify-center bg-white">
            <Image
              className="w-72 h-32 items-center justify-center mx-auto"
              source={require('./images/alertado.jpg')}
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text className="ml-5 mb-2 text-sm">First Name</Text>
                  <TextInput
                    className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
                    placeholder="Enter your First Name"
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      if (/^[a-zA-Z]{0,20}$/.test(value)) {
                        setValue('Fname', value);
                      } else {
                        setValue('Fname', '');
                      }
                      onChange(value);
                    }}
                    value={value}
                  />
                  {errors.Fname && <Text className="mx-auto color-red-500">{errors.Fname.message}</Text>}
                </>
              )}
              name="Fname"
              rules={{
                required: 'First Name is required',
                pattern: {
                  value: /^[a-zA-Z]{0,20}$/,
                  message: 'Only letters allowed, maximum 20 characters',
                },
              }}
              defaultValue=""
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text className="ml-5 mb-2 text-sm  ">Last Name</Text>
                  <TextInput
                    className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto"
                    placeholder="Enter your Last Name"
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      if (/^[a-zA-Z]{0,20}$/.test(value)) {
                        setValue('Lname', value);
                      } else {
                        setValue('Lname', '');
                      }
                      onChange(value);
                    }}
                    value={value}
                  />
                  {errors.Lname && <Text className="mx-auto color-red-500">{errors.Lname.message}</Text>}
                </>
              )}
              name="Lname"
              rules={{ 
                required: 'Last Name is required',
                pattern: {
                  value: /^[a-zA-Z]{0,20}$/,
                  message: 'Only letters allowed, maximum 20 characters',
                },
               }}
              defaultValue=""
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text className="ml-5 mb-2 text-sm  ">Mobile Number</Text>
                  <TextInput
                    className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto"
                    placeholder="Enter your Mobile Number"
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      setValue('number', value);
                      onChange(value);
                    }}
                    value={value.replace(/[^0-9]/g, '')}
                    keyboardType="numeric"
                  />
                  {errors.number && <Text className="mx-auto color-red-500">{errors.number.message}</Text>}
                </>
              )}
              name="number"
              rules={{
                required: 'Mobile Number is required',
                pattern: {
                  value: /^[0-9]{11}$/, // Exactly 11 digits, only numbers allowed
                  message: 'Mobile Number must be 11 digits long',
                },
              
              }}
              defaultValue=""
            />

            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text className="ml-5 mb-2 text-sm">Select Barangay</Text>
                  <View className="justify-center w-11/12 h-12 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2">
                    <Picker
                      selectedValue={barangay}
                      onValueChange={(value) => {
                        setBarangay(value);
                        onChange(value);
                      }}
                    >
                      <Picker.Item label="Barangay" value="" />
                      {barangays.map((address) => (
                        <Picker.Item key={address} label={address} value={address} />
                      ))}
                    </Picker>
                  </View>
                  {errors.barangay && <Text className="mx-auto color-red-500">{errors.barangay.message}</Text>}
                  {barangayError && <Text className="mx-auto color-red-500">{barangayError}</Text>}
                </>
              )}
              name="barangay"
              rules={{ required: 'Barangay is required' }}
              defaultValue=""
            />
            <Controller
              control={control}
              render={({ field: { onChange, onBlur, value } }) => (
                <>
                  <Text className="ml-5 mb-2 text-sm">Email</Text>
                  <TextInput
                    className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto"
                    placeholder="Enter your Email"
                    onBlur={onBlur}
                    onChangeText={(value) => {
                      setValue('email', value);
                      onChange(value);
                    }}
                    value={value}
                  />
                  {errors.email && <Text className="mx-auto color-red-500">{errors.email.message}</Text>}
                </>
              )}
              name="email"
              rules={{
                required: 'Email is required',
                pattern: {
                  value: /^\S+@\S+$/i,
                  message: 'Invalid email address',
                },
              }}
              defaultValue=""
            />

            <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Text className="ml-5 mb-2 text-sm  ">Password</Text>
                <TextInput
                  className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
                  placeholder="Enter your Password"
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    setValue('password', value);
                    onChange(value);
                  }}
                  secureTextEntry={true}
                  value={value}
                />  
                {errors.password && <Text className="mx-auto color-red-500">{errors.password.message}</Text>}
              </>
            )}
            name="password"
            rules={{ 
              required: 'Password is required',
              minLength: {
                value: 6,
                message: 'Password must be at least 6 characters long'
              },
              validate: (value) => {
                return value === watch('confirmPassword') || 'Passwords do not match';
              }
            }}
            defaultValue=""
            />

            <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <>
                <Text className="ml-5 mb-2 text-sm  ">Confirm Password</Text>
                <TextInput
                  className="w-11/12 px-4 py-3 rounded-lg border-2 border-[#E0E0E0] mx-auto mb-2"
                  placeholder="Enter your Password"
                  onBlur={onBlur}
                  onChangeText={(value) => {
                    setValue('confirmPassword', value);
                    onChange(value);
                  }}
                  secureTextEntry={true}
                  value={value}
                />  
                {errors.confirmPassword && <Text className="mx-auto color-red-500">{errors.confirmPassword.message}</Text>}
              </>
            )}
            name="confirmPassword"
            rules={{ 
              required: 'Password confirmation is required',
              validate: (value) => {
                return value === watch('password') || 'Passwords do not match';
              }
            }}
            defaultValue=""
            />

            <TouchableOpacity
              className="w-11/12 mt-4 px-4 py-1 rounded-lg bg-[#E31A1A] items-center mx-auto mb-4"
              onPress={handleSubmit(onSubmit)}
            >
              <Text className="text-white text-lg font-medium mx-auto mb-2">Register</Text>
            </TouchableOpacity>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </ScrollView>
  );
};

export default RegistrationForm;