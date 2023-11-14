import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ImageBackground, ScrollView, Alert} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged} from '@firebase/auth';
import { collection, query, where, onSnapshot, getFirestore, updateDoc, doc, deleteDoc, getDocs, getDoc, setDoc } from '@firebase/firestore';



const ViewComplaints = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Active');
  const filterOptions = ['All', 'Active', 'Pending', 'Ongoing', 'Completed', 'Cancelled'];
  const navigation = useNavigation();
  const [activeComplaintsCount, setActiveComplaintsCount] = useState(0);
  const [mapLayout, setMapLayout]=useState(false);
  const [isLoading, setIsLoading] = useState(false);
  useEffect(() => {
    const auth = getAuth();
    const firestore = getFirestore();
    
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        fetchUserData(user.uid, firestore);

      } else {
        setUserData(null);
        setComplaints([]);
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
        setComplaints([]);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    setIsModalOpen(false); // Close the modal when the component re-focuses
  }, [isFilterOpen]);

  const fetchUserComplaints = (userId) => {
    const db = getFirestore();
    const complaintsRef = collection(db, 'Complaints');
    const userComplaintsQuery = query(complaintsRef, where('userId', '==', userId));

    const unsubscribeComplaints = onSnapshot(userComplaintsQuery, (snapshot) => {
      const complaintsData = snapshot.docs.map((doc) => doc.data());
      setComplaints(complaintsData);
      fetchActiveComplaintsCount(userId);
    });

    return () => {
      unsubscribeComplaints();
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
  
        fetchUserComplaints(user.uid);
      } else {
        setUserData(null);
        setComplaints([]);
        
      }
    });
  
    return () => {
      unsubscribeAuth();
    };
  }, []);
  
  const fetchActiveComplaintsCount = async (userId) => {
    try {
      const db = getFirestore();
      const userComplaintsCollection = collection(db, 'Complaints');
      const userComplaintsSnapshot = await getDocs(
        query(userComplaintsCollection, where('userId', '==', userId), where('status', 'in', ['Pending', 'Ongoing']))
      );
  
      setActiveComplaintsCount(userComplaintsSnapshot.size);
    } catch (error) {
      console.error('Error fetching active complaints count:', error);
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
  const filteredComplaints = () => {
    if (selectedFilter === 'All') {
      return complaints;
    } else if (selectedFilter === 'Active') {
      return complaints.filter(complaint => complaint.status === 'Pending' || complaint.status === 'Ongoing');
    } else {
      return complaints.filter(complaint => complaint.status === selectedFilter);
    }
  };
  const handleButton = () => {
    navigation.navigate('File Complaint');
  };
  const handleClick = (complaint) => {
    navigation.navigate('View Complaint Details',{complaint});
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
  const handleCancelButtonPress = (complaintId) => {
    Alert.alert(
      'Cancel Complaint',
      'Are you sure you want to cancel the complaint?',
      [
        {
          text: 'Confirm',
          style: 'cancel',
        },
        {
          text: 'Cancel',
          style: 'destructive',
          onPress: () => updateComplaintStatus(complaintId),
        },
      ],
    );
  };
  const updateComplaintStatus = async (transactionCompId) => {
    try {
      const db = getFirestore();
      const complaintsRef = collection(db, 'Complaints');
      const querySnapshot = await getDocs(query(complaintsRef, where('transactionCompId', '==', transactionCompId.toString())));
  
      if (querySnapshot.empty) {
        console.log('Document not found');
        return;
      }
  
      const complaintDoc = querySnapshot.docs[0];
  
      // Update the status field to "Cancel"
      await updateDoc(complaintDoc.ref, { status: 'Cancelled' });
  
      console.log('Complaint status updated to "Cancel" successfully');
    } catch (error) {
      console.log('Error updating complaint status:', error);
    }
  };

  return (
    <View className="flex-1">
    <ScrollView >
    <View style={{ backgroundColor: 'rgba(0, 128, 0, 0.1)', padding: 15, marginBottom:15,}}>
    <Text style={{ textAlign: 'center', color: 'green', fontWeight: 'bold' }}>
    "Complaints are available at all times. However, each account can only have three active complaints simultaneously. Thank you for your cooperation."
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
            <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 16 }}>File Complaint</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>

    {filteredComplaints().map((complaint) => (
    <View key={complaint.transactionCompId} className="flex flex-col mt-5">
      <TouchableOpacity onPress={() => handleClick(complaint)}>
        <View className="bg-white h-28 mx-4 rounded-lg">
          <Text className="text-lg font-bold ml-2">{complaint.name}</Text>
          <TouchableOpacity onPress={() => handleCancelButtonPress(complaint.transactionCompId)}>
          {isLoading ? ( // Step 4: Conditionally render the activity indicator
          <ActivityIndicator size="small" color="red" />
        ) : (
          <Text style={{
            fontSize: 25,
          fontWeight: 'bold',
          position: 'absolute',
          right: 10,
          color: 'red',
          transform: [{ translateY: -30 }], }}>X</Text>)}
        </TouchableOpacity>
          <Text className="ml-2">{complaint.date}</Text>
          <View>
            <Text className="ml-2">
              {complaint.barangay}, {complaint.street}
            </Text>
            <Text className="text-lg ml-2 text-red-500">#COMPLAINTS_{complaint.transactionCompId}</Text>
          </View>
          {complaint.timestamp && (
            <Text className="ml-2 ">{getMinutesAgo(complaint.timestamp)}</Text>
          )}
          <Text
            style={{
              position: 'absolute',
              top: '50%',
              right: 8,
              transform: [{ translateY: -8 }],
              backgroundColor:
        complaint.status === 'Pending'
          ? 'orange'
          :  complaint.status === 'Ongoing'
          ? '#186EEE'
          :  complaint.status === 'Completed'
          ? 'green'
          :  complaint.status === 'Cancelled'
          ? 'red'
          : 'black',
              padding: 8,
              borderRadius: 4,
              zIndex: 1,
            }}
          >
            {complaint.status}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  ))}
  </ScrollView>
  {userData &&
    userData.status === 'Verified' &&
    activeComplaintsCount < 3 &&
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

export default ViewComplaints;