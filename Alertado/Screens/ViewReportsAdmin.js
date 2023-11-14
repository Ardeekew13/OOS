import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, ImageBackground, ScrollView, Alert} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth, onAuthStateChanged} from '@firebase/auth';
import { collection, query, where, onSnapshot, getFirestore, updateDoc, doc, deleteDoc, getDocs, getDoc, setDoc } from '@firebase/firestore';
import { formatDistanceToNow } from 'date-fns';

const ViewReportsAdmin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('Active');
  const filterOptions = ['All', 'Active', 'Pending', 'Ongoing', 'Completed', 'Cancelled'];
  const [activeReportsCount, setActiveReportsCount] = useState(0);

  const navigation = useNavigation();

  const fetchUserReports = () => {
    const db = getFirestore();
    const reportsRef = collection(db, 'Reports');

    const unsubscribeReports = onSnapshot(reportsRef, (snapshot) => {
      const reportsData = snapshot.docs.map((doc) => doc.data());
      setReports(reportsData);
    });

    return () => {
      unsubscribeReports();
    };
  };

  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserData(user);
        fetchUserReports();
      } else {
        setUserData(null);
        setReports([]);
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

  if (!userData) {
    return <Text>Loading...</Text>;
  }

  const handleButton = () => {
    navigation.navigate('Report Crime');
  };
  const handleClick = (report) => {
    navigation.navigate('View Report Details Admin', { report });
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
  const filteredReports = () => {
    if (selectedFilter === 'All') {
      return reports;
    } else if (selectedFilter === 'Active') {
      return reports.filter(report => report.status === 'Pending' || report.status === 'Ongoing');
    } else {
      return reports.filter(report => report.status === selectedFilter);
    }
  };
  return (
    <View className="flex-1">
    <ScrollView >
<View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginRight: 20, marginTop:10, }}>
    <TouchableOpacity onPress={() => setIsFilterOpen(true)}>
      <Text className = " rounded-md p-1" style={{ fontSize: 16, color: 'black' }}>Filter: <Text style={{ fontSize: 16, color: 'black', fontWeight:'bold' }}>{selectedFilter}</Text></Text>
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
                className = "p-2 border-b-2"
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
      <View className="bg-white h-28 mx-4 rounded-lg">
        <Text className="text-lg font-bold ml-2">{report.name}</Text>
        <TouchableOpacity onPress={() => handleDeleteButtonPress(report.transactionRepId)}>
        <Text style={{
        fontWeight: 'bold',
        position: 'absolute',
        right: 10,
        color: 'red',
        fontSize: 20,
        transform: [{ translateY: -30 }], }}>X</Text>
      </TouchableOpacity>
        <Text className="ml-2">{report.date}</Text>
        <View>
          <Text className="ml-2">
            {report.barangay}, {report.street}
          </Text>
          <Text className="text-lg ml-2 text-red-500">#REPORT_{report.transactionRepId}</Text>
        </View>
        {report.timestamp && (
          <Text className="ml-2">{getMinutesAgo(report.timestamp)}</Text>
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
{userData && userData.status === 'Verified' && activeReportsCount < 3 && (
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

export default ViewReportsAdmin;