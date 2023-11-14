import React, { useState, useEffect } from 'react';
import { View, Text,ActivityIndicator, TouchableOpacity, Modal, ImageBackground, ScrollView, Alert} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged} from '@firebase/auth';
import { collection, query, where, onSnapshot, getFirestore, updateDoc, doc, deleteDoc, getDocs, getDoc, setDoc } from '@firebase/firestore';
import { formatDistanceToNow } from 'date-fns';


const ViewReports = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Active');
  const filterOptions = ['All', 'Active', 'Pending', 'Ongoing', 'Completed', 'Cancelled'];
  const [activeReportsCount, setActiveReportsCount] = useState(0);
  const navigation = useNavigation();
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();
  
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(firestore, 'User', user.uid);
        const userDocSnapshot = await getDoc(userDocRef);
  
        if (userDocSnapshot.exists()) {
          const userData = userDocSnapshot.data();
  
          if (userData.status === 'Disabled' && (!userData.lastWarningTime || (new Date() - new Date(userData.lastWarningTime)) / (1000 * 60 * 60) < 24)) {
            const remainingTime = 24 - Math.floor((new Date() - new Date(userData.lastWarningTime)) / (1000 * 60 * 60));
            const alertMessage = `Your account is disabled due to inappropriate use of reporting. Time remaining: ${remainingTime} hours.`;
  
            Alert.alert('Account Disabled', alertMessage);
          } else if ((!userData.lastWarningTime || (new Date() - new Date(userData.lastWarningTime)) / (1000 * 60 * 60) >= 24)) {
            Alert.alert('Account Enabled', 'You can now report again. Please use it correctly.');
          } else {
            // User is not disabled, proceed to fetch user data and reports
            fetchUserData(user.uid, firestore);
          }
        } else {
          setUserData(null);
          setReports([]);
        }
      } else {
        setUserData(null);
        setReports([]);
      }
    });
  
    return () => {
      unsubscribeAuth();
    };
  }, []);
  const fetchUserData = async (userId, firestore) => {
    try {
      const userDocRef = doc(firestore, 'User', userId); // Update with your collection name and structure
      const userDocSnapshot = await getDoc(userDocRef);
  
      if (userDocSnapshot.exists()) {
        setUserData(userDocSnapshot.data()); // Set user data here
      } else {
        setUserData(null);
        setReports([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    setIsModalOpen(false); // Close the modal when the component re-focuses
  }, [isFilterOpen]);

  const fetchUserReports = (userId) => {
    const db = getFirestore();
    const reportsRef = collection(db, 'Reports');
    const userReportsQuery = query(reportsRef, where('userId', '==', userId));

    const unsubscribeReports = onSnapshot(userReportsQuery, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => doc.data());
      setReports(reportsData);
      fetchActiveReportsCount(userId);
    });

    return () => {
      unsubscribeReports();
    };
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUserData(user);
  
        // Fetch additional user data from Firestore
        const db = getFirestore();
        const userDocRef = doc(db, 'User', user.uid); // Adjust the collection name if necessary
  
        try {
          const userDocSnapshot = await getDoc(userDocRef);
          if (userDocSnapshot.exists()) {
            const userDataFromFirestore = userDocSnapshot.data();
            setUserData((prevUserData) => ({
              ...prevUserData,
              ...userDataFromFirestore,
            }));
          }
        } catch (error) {
          console.error('Error fetching user data from Firestore:', error);
        }
  
        fetchUserReports(user.uid);
      } else {
        setUserData(null);
        setReports([]);
        
      }
    });
  
    return () => {
      unsubscribeAuth();
    };
  }, []);

  const fetchActiveReportsCount = async (userId) => {
    try {
      const db = getFirestore();
      const userReportsCollection = collection(db, 'Reports');
      const userReportsSnapshot = await getDocs(
        query(userReportsCollection, where('userId', '==', userId), where('status', 'in', ['Pending', 'Ongoing']))
      );
  
      setActiveReportsCount(userReportsSnapshot.size);
    } catch (error) {
      console.error('Error fetching active reports count:', error);
    }
  };
  useFocusEffect(
    React.useCallback(() => {
      setIsModalOpen(false);
    }, [])
  );

  if (!userData) {
    return <Text>Loading...</Text>;
  }
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false); // Close the modal when a filter is selected
  };
  const filteredReports = () => {
    if (selectedFilter === 'All') {
      return reports;
    } else if (selectedFilter === 'Active') {
      return reports.filter(report => report.status === 'Pending' || report.status === 'Ongoing');
    } else {
      return reports.filter(report => report.status === selectedFilter);
    }
  };
  const handleButton = () => {
    navigation.navigate('Report Crime');
  };
  const handleClick = (report) => {
    navigation.navigate('View Report Details', {
      report: report,
      userData: userData,
    });
  };
  const getMinutesAgo = (timestamp) => {
    if (!timestamp) return null;
  
    const now = new Date();
    const reportTime = new Date(timestamp);
  
    // Calculate the difference in milliseconds between the current time and the report time
    const timeDiff = now.getTime() - reportTime.getTime();
  
    // Convert the time difference to seconds
    const secondsAgo = Math.floor(timeDiff / 1000);
  
    if (secondsAgo < 60) {
      return `${secondsAgo} seconds ago`;
    } else if (secondsAgo < 3600) {
      const minutesAgo = Math.floor(secondsAgo / 60);
      return `${minutesAgo} minutes ago`;
    } else if (secondsAgo < 86400) {
      const hoursAgo = Math.floor(secondsAgo / 3600);
      return `${hoursAgo} hours ago`;
    } else {
      const daysAgo = Math.floor(secondsAgo / 86400);
      return `${daysAgo} days ago`;
    }
  };
  const handleDeleteButtonPress = (transactionRepId) => {
    Alert.alert(
      'Delete Report',
      'Are you sure you want to cancel the report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: () => {
            // Ensure that transactionRepId is defined before proceeding
            if (transactionRepId) {
              // Step 3: Set loading state to true
              setIsLoading(true);
              cancelReport(transactionRepId);
            } else {
              console.log('transactionRepId is undefined');
            }
          },
        },
      ],
    );
  };
  const cancelReport = async (transactionRepId) => {
    if (!transactionRepId) {
      console.log('transactionRepId is undefined');
      return;
    }
  
    try {
      const db = getFirestore();
      const reportsRef = collection(db, 'Reports');
      const querySnapshot = await getDocs(query(reportsRef, where('transactionRepId', '==', transactionRepId.toString())));
  
      if (querySnapshot.empty) {
        console.log('Document not found');
        return;
      }
  
      const reportDoc = querySnapshot.docs[0];
      const reportData = reportDoc.data();
  
      // Update the report document's status to "Cancelled"
      await updateDoc(reportDoc.ref, { status: 'Cancelled' });
      console.log('Report status changed to Cancelled');
  
      // Fetch the updated reports after status change
      fetchUserReports(userData.uid);
  
      // Update the count in the barangayCounts collection
      const location = reportData.barangay;
      const barangayCountsRef = doc(db, 'barangayCounts', location);
      const barangaySnapshot = await getDoc(barangayCountsRef);
  
      if (barangaySnapshot.exists()) {
        const currentCount = barangaySnapshot.data().count;
  
        // Update the count by subtracting 1
        await setDoc(barangayCountsRef, { count: currentCount - 1 }, { merge: true });
        console.log('Count updated successfully');
      }
    } catch (error) {
      console.log('Error changing report status to Cancelled:', error);
    }
  };
  return (
    <View className="flex-1">
      <ScrollView >
    <View style={{ backgroundColor: 'rgba(0, 128, 0, 0.1)', padding: 15, marginBottom:15,}}>
    <Text style={{ textAlign: 'center', color: 'green', fontWeight: 'bold' }}>
    "Reports are available at all times. However, each account can only have three active reports simultaneously. Thank you for your cooperation."
    </Text>
  </View>
  <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20 }}>
      <TouchableOpacity onPress={() => setIsFilterOpen(true)}>
        <Text style={{ fontSize: 16, color: 'black' }}>Filter: <Text style={{ fontSize: 16, color: 'black', fontWeight:'bold' }}>{selectedFilter}</Text></Text>
      </TouchableOpacity>
    </View>
    <Modal visible={isFilterOpen} transparent={true} animationType='slide'>
          <View style={{ flex: 1, justifyContent: 'flex-end' }}>
            <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 16, marginHorizontal: 16, marginBottom: 16 }}>
            <TouchableOpacity onPress={() => setIsFilterOpen(false)} style={{ alignItems: 'flex-end' }}>
            <Ionicons name="ios-close-outline" size={24} color="black" />
          </TouchableOpacity>
              {filterOptions.map(filter => (
                <TouchableOpacity
                  key={filter}
                  onPress={() => handleFilterChange(filter)}
                  style={{ paddingVertical: 8 }}
                >
                  <Text>{filter}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </Modal>
   
    <Modal visible={isModalOpen} transparent={true} animationType='slide'>
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <View style={{ backgroundColor: 'white', borderRadius: 10, padding: 16, marginHorizontal: 16, marginBottom: 16 }}>
          <TouchableOpacity onPress={() => setIsModalOpen(false)} style={{ alignItems: 'flex-end' }}>
            <Ionicons name="ios-close-outline" size={24} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleButton}>
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>Report Crime</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {filteredReports().map((report) => (
    <View key={report.transactionRepId} className="flex flex-col mt-5">
      <TouchableOpacity onPress={() => handleClick(report)}>
        <View className=" bg-white h-28 mx-4 rounded-lg">
          <Text className="text-lg font-bold ml-2">{report.name}</Text>
          {report.status !== 'Completed' && report.status !== 'Cancelled' && report.status !== 'Ongoing' &&(
          <TouchableOpacity onPress={() => handleDeleteButtonPress(report.transactionRepId)}>
          {isLoading ? ( // Step 4: Conditionally render the activity indicator
          <ActivityIndicator size="small" color="red" />
        ) : (
          <Text style={{
          fontWeight: 'bold',
          position: 'absolute',
          right: 10,
          color: 'red',
          fontSize: 20,
          transform: [{ translateY: -30 }], }}>X</Text>)}
        </TouchableOpacity>
          )}
          <Text className="ml-2">{report.date}</Text>
          <View>
            <Text className="ml-2">
              {report.barangay}, {report.street}
            </Text>
            <Text className="text-lg ml-2 text-red-500">#REPORT_{report.transactionRepId}</Text>
          </View>
          {report.timestamp && (
            <Text className="ml-2 ">{getMinutesAgo(report.timestamp)}</Text>
          )}
          <Text
            style={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: [{ translateY: -8 }],
              backgroundColor:
        report.status === 'Pending'
          ? 'orange'
          : report.status === 'Ongoing'
          ? '#186EEE'
          : report.status === 'Completed'
          ? 'green'
          : report.status === 'Cancelled'
          ? 'red'
          : 'black',
              padding: 8,
              borderRadius: 4,
              zIndex: 1,
            }}
          >
            {report.status}
            
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  ))}
</ScrollView>
{userData &&
  userData.status === 'Verified' &&
  activeReportsCount < 3 &&
  (!userData.lastWarningTime || (new Date() - new Date(userData.lastWarningTime)) / (1000 * 60 * 60) >= 24) && (
    <View style={{ position: 'absolute', bottom: 10, right: 20, zIndex: 1 }}>
      <TouchableOpacity
        style={{
          backgroundColor: '#EF4444',
          height: 60,
          width: 60,
          justifyContent: 'center',
          alignItems: 'center',
          borderRadius: 30,
        }}
        onPress={() => setIsModalOpen(true)}
      >
        <Text style={{ color: 'white', fontSize: 24 }}>+</Text>
      </TouchableOpacity>
    </View>
  )}
</View>
  );
};

export default ViewReports;