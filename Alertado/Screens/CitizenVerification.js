import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { db, authentication, storage } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Entypo, Ionicons,Feather } from '@expo/vector-icons'; 
import { ScrollView } from 'react-native-gesture-handler';


const CitizenVerification = () => {
  const [idImage, setidImage] = useState(null);
  const [selfieImage, setselfieImage] = useState(null);
  const [user, setUser] = useState(null);
  const [Loading, setLoading] = useState(false);

  const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, [authentication]);

  const handleIdImagePick = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setidImage(result.assets[0].uri);
    }
  };

  const backButton = async () => {
    navigation.goBack();
  };

  const handleCameraPress = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status === 'granted') {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        setselfieImage(result.assets[0].uri);
      }
    }
  };

  const handleSelfieImagePick = async () => {
    const result = await launchImageLibraryAsync({
      mediaTypes: 'Images',
      allowsEditing: true,
      quality: 1,
    });

    if (!result.canceled) {
      setselfieImage(result.assets[0].uri);
    }
  };

  const uriToBlob = async (uri) => {
    const response = await fetch(uri);
    const blob = await response.blob();
    return blob;
  };

  const handleSubmit = async () => {
    if (!idImage || !selfieImage) {
      Alert.alert('Please upload both images.');
      return;
    }

    setLoading(true);
    try {
      // Convert images to blobs
      const idBlob = await uriToBlob(idImage);
      const selfieBlob = await uriToBlob(selfieImage);

      // Get references to Firebase Storage
      const storageRef = ref(getStorage());
      const idRef = ref(storageRef, `idPictures/${user.uid}.jpg`);
      const selfieRef = ref(storageRef, `selfiePictures/${user.uid}.jpg`);

      // Upload images to Firebase Storage
      await uploadBytes(idRef, idBlob);
      const idUrl = await getDownloadURL(idRef);
      await uploadBytes(selfieRef, selfieBlob);
      const selfieUrl = await getDownloadURL(selfieRef);

      // Add data to Firebase Firestore
      const db = getFirestore();
      const usersCollection = collection(db, 'User');
      const userDoc = doc(usersCollection, user.uid);
      await updateDoc(userDoc, {
        idPicture: idUrl,
        selfiePicture: selfieUrl,
        status: "Pending",
      });

      Alert.alert(
        'Submitted Successfully!',
        'You have sent your proof of identity',
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('BottomTabs', { screen: 'HomePage' });
            },
            style: 'cancel',
          },
        ],
        {
          containerStyle: {
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
          },
          contentContainerStyle: {
            justifyContent: 'center',
            alignItems: 'center',
          },
        }
      );
    } catch (error) {
      console.log(error);
      Alert.alert('Error occurred while submitting proof of identity.');
    }

    setLoading(false);
  };

  return (
    <ScrollView style={{ flex: 1 }}>
    <View style={{ backgroundColor: 'rgba(0, 128, 0, 0.1)', padding: 20, marginBottom:15,}}>
        <Text style={{ textAlign: 'center', color: 'green', fontWeight: 'bold' }}>
        "Please provide clear and legible information on your ID. For the ID picture and selfie, ensure high quality, non-blurry images. Thank you for your cooperation."
        </Text>
      </View>
    <View style={{ flex: 1 }}>
        <View style={{ marginBottom: 20 }}>
          <Text style={{ marginLeft: 4, marginBottom: 2,textAlign:'center', fontWeight:'bold' }}>Identification Card</Text>
          <TouchableOpacity onPress={handleIdImagePick}>
            <View style={{ borderWidth: 2, borderRadius: 4, borderColor: 'slategray', height: 220, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
              {idImage ? (
                <Image source={{ uri: idImage }} style={{ width: 250, height: 210 }} />
              ) : (
                <>
                  <Entypo name="upload" size={24} color="#DC2626" />
                  <Text style={{ color: 'red', fontWeight: 'bold' }}>Upload a picture of your Identification Card</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ marginBottom: 10 }}>
          <Text style={{ marginLeft: 4, marginBottom: 2, textAlign:'center', fontWeight:'bold'}}>Selfie Picture</Text>
          <TouchableOpacity onPress={handleSelfieImagePick}>
            <View style={{ borderWidth: 2, borderRadius: 4, borderColor: 'slategray', height: 220, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
              {selfieImage ? (
                <Image source={{ uri: selfieImage }} style={{ width: 250, height: 210 }} />
              ) : (
                <>
                  <Entypo name="upload" size={24} color="#DC2626" />
                  <Text style={{ color: 'red', fontWeight: 'bold' }}>Upload a picture of your Selfie</Text>
                </>
              )}
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row-reverse', width: '100%', justifyContent: 'center', marginBottom: 30 }}>
        <TouchableOpacity onPress={handleCameraPress} style={{ borderRadius: 7, backgroundColor: '#D3D3D3', width: 180, height: 40, justifyContent: 'center', alignItems: 'center', paddingLeft: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Feather name="camera" size={20} color="black" />
            <Text style={{ color: 'black', fontSize: 18, marginLeft:5}}>Take a Photo</Text>
          </View>
        </TouchableOpacity>
      </View>

        <View style={{ justifyContent: 'center', alignItems: 'center' }}>
          <TouchableOpacity onPress={handleSubmit} style={{  borderRadius:7, backgroundColor: '#DC2626', width: '90%', height: 45, justifyContent: 'center', alignItems: 'center' }}>
            <Text style={{ color: 'white', fontSize: 18 }}>Submit</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default CitizenVerification;