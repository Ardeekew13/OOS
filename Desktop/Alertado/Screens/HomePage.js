import React, { useState, useEffect } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { NavigationContainer } from '@react-navigation/native'
import { useNavigation } from '@react-navigation/core';
import ReportCrime from './ReportCrime'
import { View, Text, Image, Button, TouchableOpacity,TextInput, Alert, Modal, ScrollView, ActivityIndicator} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, onSnapshot, getFirestore,updateDoc,getDocs,getDoc, query, where } from '@firebase/firestore';
import { getAuth, signOut, onAuthStateChanged  } from '@firebase/auth';
import { ref,getDownloadURL, uploadBytes,storageRef,getStorage ,uploadStrings} from 'firebase/storage';
import firebaseConfig from '../firebaseConfig';
import { Ionicons } from '@expo/vector-icons'; 


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
const storage = getStorage(firebaseConfig);
const auth = getAuth();
let currentUser = null;
onAuthStateChanged(auth, (user) => {
  currentUser = user;
});
const HomePage =()=>{
  const [userData, setUserData] = useState(null);
  const [barangayCounts, setBarangayCounts] = useState({});
  const [totalReportsCount, setTotalReportsCount] = useState(0);
  const [totalComplaintsCount, setComplaintsCount] = useState(0);
  const [totalEmergenciesCount,  setEmergenciesCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isAccountDisabled, setIsAccountDisabled]= useState(false);
  
  const navigation=useNavigation()
  useEffect(() => {
    console.log('userData:', userData);
console.log('isAccountDisabled:', isAccountDisabled);
    const fetchUserCounts = async () => {
      try {
        const db = getFirestore();
        const currentUser = getAuth().currentUser;
  
        // Fetch the user's data
        const userRef = doc(db, 'User', currentUser.uid);
        const userSnapshot = await getDoc(userRef);
        const userData = userSnapshot.data();
        setUserData(userData);

        if (userData.isAccountDisabled) {
          const lastWarningTime = userData.lastWarningTime.toDate();
          const currentTime = new Date();
          const timeDifference = currentTime - lastWarningTime;
        
          if (timeDifference >= 24 * 60 * 60 * 1000) {
            // 24 hours have passed, enable the account
            await updateDoc(userRef, {
              lastWarningTime: null,
              warning: 0,
              isAccountDisabled: false,
            });
            setIsAccountDisabled(false);
          } else {
            const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - timeDifference) / (60 * 60 * 1000)); // Calculate hours remaining
            setIsAccountDisabled(true);
        
            Alert.alert(
              'Account Disabled',
              `Your account is temporarily disabled. It will be enabled after ${hoursLeft} hours.`
            );
          }
        }
        // Fetch the user's report count and listen for real-time updates
        const reportsCollection = collection(db, 'Reports');
        const userReportsQuery = query(
          reportsCollection,
          where('userId', '==', currentUser.uid)
        );
  
        const unsubscribeReports = onSnapshot(userReportsQuery, (querySnapshot) => {
          // Handle updates to the user's reports count
          setTotalReportsCount(querySnapshot.size);
        });
  
        // Fetch the user's complaint count and listen for real-time updates
        const complaintsCollection = collection(db, 'Complaints');
        const userComplaintsQuery = query(
          complaintsCollection,
          where('userId', '==', currentUser.uid)
        );
  
        const unsubscribeComplaints = onSnapshot(userComplaintsQuery, (querySnapshot) => {
          // Handle updates to the user's complaints count
          setComplaintsCount(querySnapshot.size);
        });
  
        // Fetch the user's emergency count and listen for real-time updates
        const emergenciesCollection = collection(db, 'Emergencies');
        const userEmergenciesQuery = query(
          emergenciesCollection,
          where('userId', '==', currentUser.uid)
        );
  
        const unsubscribeEmergencies = onSnapshot(userEmergenciesQuery, (querySnapshot) => {
          // Handle updates to the user's emergencies count
          setEmergenciesCount(querySnapshot.size);
        });
  
        setIsLoading(false);
  
        // Clean up the listeners when the component unmounts
        return () => {
          unsubscribeReports();
          unsubscribeComplaints();
          unsubscribeEmergencies();
        };
      } catch (error) {
        console.error('Error fetching user data and counts:', error);
        setIsLoading(false);
      }
    };
  
    const fetchBarangayCounts = async () => {
      try {
        const db = getFirestore();
  
        // Fetch the barangay counts and listen for real-time updates
        const countsCollection = collection(db, 'barangayCounts');
  
        const unsubscribeCounts = onSnapshot(countsCollection, (querySnapshot) => {
          const updatedCounts = {};
          querySnapshot.forEach((doc) => {
            updatedCounts[doc.id] = doc.data().count;
          });
          setBarangayCounts(updatedCounts);
        });
  
        // Clean up the listener when the component unmounts
        return () => {
          unsubscribeCounts();
        };
      } catch (error) {
        console.error('Error fetching barangay counts:', error);
      }
    };
  
    fetchUserCounts();
    fetchBarangayCounts(); // Fetch barangay counts for all users
  
  }, []);
  
  if (!userData && isLoading) {
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <ActivityIndicator size="large" />
    </View>
  }
  if (!userData) {

    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" /></View>
  }
  const handleStatsButtonPress = () => {
   
    navigation.navigate('GenerateStat');
  };
  return (
    <ScrollView>
      <SafeAreaView className="flex-1 mt-5">
      <View className="flex-row justify-start items-center">
      <Text className="mx-4 text-lg font-light">Hello,</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center',  }}>
        <Text className="text-[#EF4444] font-bold text-lg justify-center">{userData.Fname} {userData.Lname}</Text>
        <TouchableOpacity onPress={handleStatsButtonPress}>
        <Ionicons name="ios-stats-chart-sharp" size={30} color="black" style={{ marginLeft: 150, marginRight:10 }} />
        </TouchableOpacity>
      </View>
    </View>
      <View className="mx-4">
           <Text className="text-[#817E7E] text-md">Check your activities in this dashboard</Text>
      </View>
      <View className="m-5 bg-white rounded-md p-5">
        <Text className ="font-bold text-base ">{totalReportsCount}</Text>
        <Text className ="font-bold text-base">Crime</Text>
      </View>
      <View className="mx-5 bg-white p-5 rounded-md">
        <Text className ="font-bold text-base">{totalEmergenciesCount}</Text>
        <Text className ="font-bold text-base">Emergency</Text>
      </View>
      <View className="m-5 bg-white p-5 rounded-md">
        <Text className ="font-bold text-base">{totalComplaintsCount}</Text>
        <Text className ="font-bold text-base">Complaint</Text>
      </View>
      <View className="border-0.5 mx-5"></View>
      <Text className="mx-5 text-xl text-center">Reports by Location (Barangays)</Text>
      <View className="border-0.5 mx-5 mb-5"></View>
      <View>
      {barangays.map((barangay, index) => {
        const barangayData = barangayCounts[barangay];
        const count = barangayCounts[barangay] || 0;
        return (
          <View className="mx-5 bg-white p-4 mb-3 rounded-md" key={index}>
          <View className="flex flex-row justify-between ">
            <Text className="font-bold">{barangay}</Text>
            <Text className="text-right font-bold">{count}</Text>
          </View>
          </View>
        );
      })}
</View>
    </SafeAreaView>
    </ScrollView>
    
  )
};
export default HomePage;
