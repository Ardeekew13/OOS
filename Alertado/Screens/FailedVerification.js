import React, { useState, useEffect } from 'react';
import { View, Text, Image, Alert, TouchableOpacity } from 'react-native';
import { getAuth } from "firebase/auth";
import { getFirestore, collection, doc, updateDoc, getDoc} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as ImagePicker from 'expo-image-picker';
import { launchImageLibraryAsync } from 'expo-image-picker';
import { db, authentication, storage } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Entypo, Ionicons } from '@expo/vector-icons'; 

const FailedVerification = () => {
    const [idImage, setidImage] = useState(null);
    const [selfieImage, setselfieImage] = useState(null);
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
  
    const navigation = useNavigation();
  useEffect(() => {
    const unsubscribe = authentication.onAuthStateChanged((user) => {
      setUser(user);
    });
    return unsubscribe;
  }, [authentication]);
  
    useEffect(() => {
      const fetchImageData = async () => {
        if (user) {
          const db = getFirestore();
          const userDocRef = doc(collection(db, 'User'), user.uid);
          const userSnapshot = await getDoc(userDocRef);
  
          if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            setUserData(userData);
            const idImageUrl = userData.idPicture;
            const selfieImageUrl = userData.selfiePicture;
            setidImage(idImageUrl);
            setselfieImage(selfieImageUrl);
          }
        }
      };
  
      fetchImageData();
    }, [user]);
  const backButton = async () => {
    navigation.goBack();
  };
  

  return (
    <View>
        <View style={{ marginBottom: 20 }}>
          {userData && userData.declineReason ? (
            <View style={{ backgroundColor: 'rgba(0, 128, 0, 0.1)', padding: 20, marginBottom: 15 }}>
              <Text style={{ textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
                {userData.declineReason}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Citizen Verification')}><Text style={{textAlign:'center', marginTop:5, color:'red', textDecorationLine: 'underline'}}>Click here to verify!</Text></TouchableOpacity>
            </View>
          ) : null}
          <Text style={{ marginLeft: 4, marginBottom: 4, marginTop: 2, textAlign: 'center', fontWeight: 'bold' }}>Identification Card</Text>
  
          <View style={{ borderWidth: 2, borderRadius: 4, borderColor: 'slategray', height: 220, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
            {idImage ? (
              <Image source={{ uri: idImage }} style={{ width: 250, height: 210 }} />
            ) : (
              <Text>Error loading ID image</Text>
            )}
          </View>
        </View>
  
        <View style={{ marginBottom: 50 }}>
          <Text style={{ marginLeft: 4, marginBottom: 2, textAlign: 'center', fontWeight: 'bold' }}>Selfie Picture</Text>
   
          <View style={{ borderWidth: 2, borderRadius: 4, borderColor: 'slategray', height: 220, justifyContent: 'center', alignItems: 'center', marginLeft: 5 }}>
            {selfieImage && ( <Image source={{ uri: selfieImage }} style={{ width: 250, height: 210 }} /> )}
          </View>
        </View>
      </View>
  );
};

export default FailedVerification;