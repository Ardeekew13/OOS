import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, Modal } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import { getFirestore, collection, onSnapshot, getDocs, query, where,updateDoc } from '@firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const ViewSOSAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [emergencies, setEmergencies] = useState([]); 
  const [currentUser, setCurrentUser] = useState(null);
  const navigation = useNavigation();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('Active');
  const filterOptions = ['All', 'Active', 'Pending', 'Ongoing', 'Completed', 'Cancelled'];


  const fetchEmergencies = () => {
    const db = getFirestore();
    const emergenciesRef = collection(db, 'Emergencies');

    const unsubscribeEmergencies = onSnapshot(emergenciesRef, (snapshot) => {
      const emergenciesData = snapshot.docs.map((doc) => doc.data());
      setEmergencies(emergenciesData);
    });

    return () => {
      unsubscribeEmergencies();
    };
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData(user);
        fetchEmergencies();
      } else {
        setUserData(null);
        setEmergencies([]);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      setIsModalOpen(false);
    }, [])
  );


  const handleButton = () => {
    navigation.navigate('Report Crime');
  };
  const handleClick = (emergency) => {
    navigation.navigate('View SOS Details Admin', { emergency });
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
  const handleFilterChange = (filter) => {
    setSelectedFilter(filter);
    setIsFilterOpen(false); // Close the modal when a filter is selected
  };
  const filteredEmergencies = () => {
    if (selectedFilter === 'All') {
      return emergencies;
    } else if (selectedFilter === 'Active') {
      return emergencies.filter(emergency => emergency.status === 'Pending' || emergency.status === 'Ongoing');
    } else {
      return emergencies.filter(emergency => emergency.status === selectedFilter);
    }
  };
  const handleCancelButtonPress = (emergencyId) => {
    Alert.alert(
      'Cancel Emergency',
      'Are you sure you want to cancel the emergency?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm ',
          style: 'destructive',
          onPress: () => updateComplaintStatus(emergencyId),
        },
      ],
    );
  };

  const updateComplaintStatus = async (transactionSosId) => {
    try {
      const db = getFirestore();
      const complaintsRef = collection(db, 'Emergencies');
      const querySnapshot = await getDocs(query(complaintsRef, where('transactionSosId', '==', transactionSosId.toString())));

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
    <ScrollView className="flex-1">
    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20, marginTop:2 }}>
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
   

    {filteredEmergencies().map((emergency) => (
        <View key={emergency.transactionSosId} className="flex flex-col mt-5 ">
          <TouchableOpacity onPress={() => handleClick(emergency)}>
            <View style={styles.emergencyContainer}>
              <Text style={styles.emergencyHeader}>{emergency.userFirstName}</Text>
              <TouchableOpacity onPress={() => handleCancelButtonPress(emergency.transactionSosId)}>
              <Text style={{
                fontSize: 25,
              fontWeight: 'bold',
              position: 'absolute',
              right: 10,
              color: 'red',
              transform: [{ translateY: -30 }], }}>X</Text>
            </TouchableOpacity>
              <Text style={styles.normalText}>{emergency.type}</Text>
              <View>
                <Text style={styles.emergencyId}>#EMERGENCY_{emergency.transactionSosId}</Text>
              </View>
              {emergency.timestamp && (
                <Text style={styles.normalText}>{getMinutesAgo(emergency.timestamp)}</Text>
              )}
              <Text
                style={[
                  
                  styles.statusText,
                  { backgroundColor:
                    emergency.status === 'Pending'
                      ? 'orange'
                      :  emergency.status === 'Ongoing'
                      ? '#186EEE'
                      :  emergency.status === 'Completed'
                      ? 'green'
                      :  emergency.status === 'Cancelled'
                      ? 'red'
                      : 'black',
                          padding: 8,
                          borderRadius: 4,
                          zIndex: 1,
                       },
                ]}
              >
             
                {emergency.status}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  emergencyContainer: {
    backgroundColor: 'white',
    height: 120,
    marginHorizontal: 16,
    borderRadius: 8,
    padding: 8,
  },
  emergencyHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emergencyTimestamp: {
    marginLeft: 8,
  },
  emergencyId: {
    fontSize: 18,
    marginLeft: 8,
    color: 'red',
  },
  normalText: {
    marginLeft: 8,
    fontSize: 16,
  },
  statusText: {
    position: 'absolute',
    top: '50%',
    right: 8,
    transform: [{ translateY: -8 }],
    padding: 8,
    borderRadius: 4,
    zIndex: 1,
  },
});

export default ViewSOSAdmin;