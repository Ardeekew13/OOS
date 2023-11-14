import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions,TextInput } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { getFirestore, deleteDoc, doc, collection, query, where, getDocs, updateDoc,getDoc,setDoc } from '@firebase/firestore';

const mapCustomStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ]

const ViewComplaintDetails = ({ route }) => {
  const { complaint } = route.params;
  const complaintId = complaint.id;
  const navigation = useNavigation();
  const [newStatus, setNewStatus] = useState(complaint.status);
  const [complaintColor, setComplaintColor] = useState('black')
  const [mapLayout, setMapLayout]=useState(false);
  
  useEffect(() => {
    if (newStatus === 'Pending') {
      setComplaintColor('orange');
    } else if (newStatus === 'Ongoing') {
      setComplaintColor('#08BAE1');
    } else if (newStatus === 'Completed') {
      setComplaintColor('green');
    } else if (newStatus === 'Cancelled') {
      setComplaintColor('red');
    } else {
      setComplaintColor('black');
    }
  }, [newStatus, complaint.status]);
  const handleMapLayout = () => {
    setMapLayout(true);
  };
  const onMapReady = () => {
    setMapReady(true);
  };

  useEffect(() => {
    if (mapLayout && mapRef.current) {
      mapRef.current.fitToElements(true);
    }
  }, [mapLayout]);

  useEffect(() => {
  }, []);
  const handleSaveFeedback = async () => {
    try {
      const firestore = getFirestore();
      const querySnapshot = await getDocs(
        collection(firestore, 'Complaints'),
        where('transactionCompId', '==', complaint.transactionCompId)
      );
  
      if (!querySnapshot.empty) {
        const complaintDoc = querySnapshot.docs[0];
        const complaintRef = doc(firestore, 'Complaints', complaintDoc.id);
  
        await updateDoc(complaintRef, { PoliceFeedback: feedback }, { merge: true });
  
        console.log('Report feedback  successfully sent');
  
        // Update the status property of the report directly
        complaint.PoliceFeedback = feedback;
      } else {
        console.log('Document with transactionRepId does not exist');
      }
    } catch (error) {
      console.log('Error updating report status:', error);
    }
  };
  const changeStatus = async () => {
    try {
      const firestore = getFirestore();
  
      const querySnapshot = await getDocs(
        collection(firestore, 'Complaints'),
        where('transactionCompId', '==', complaint.transactionCompId)
      );
  
      if (!querySnapshot.empty) {
        const complaintDoc = querySnapshot.docs[0];
        const complaintRef = doc(firestore, 'Complaints', complaintDoc.id);
  
        await updateDoc(complaintRef, { status: newStatus });
  
        console.log('Report status updated successfully');
        setModalVisible(false);
        setNewStatus(newStatus);
  
        // Update the status property of the report directly
        complaint.status = newStatus;
      } else {
        console.log('Document with transactionRepId does not exist');
      }
    } catch (error) {
      console.log('Error updating report status:', error);
    }
  };
  return (
    <ScrollView style={styles.flexContainer}>
    <View style={styles.flexContainer}>
      <View style={styles.contentContainer}>
        <Text style={styles.boldText}>Complaint filed By: </Text>
        <Text style={styles.normalText}>{complaint.name}</Text>
        <Text style={styles.boldText}>Date filed : </Text>
        <Text style={styles.normalText}>{complaint.date}</Text>
        <Text style={styles.boldText}>Complainee: </Text>
        <Text style={styles.normalText}>{complaint.complainee}</Text>
        <Text style={styles.boldText}>Wanted or not? </Text>
        <Text style={styles.normalText}>{complaint.wanted}</Text>
        <Text style={styles.boldText}>Details: </Text>
        <Text style={styles.normalText}>{complaint.message}</Text>
        <Text style={styles.boldText}>Complaint Transaction ID: </Text>
        <Text style={styles.largeText}>#{complaint.transactionCompId}</Text>
        <Text style={styles.boldText}>Status:</Text>
        <View
        style={[
          styles.statusContainer,
          { backgroundColor: complaintColor }, 
        ]}
      >
        <Text style={styles.statusText}>{newStatus}</Text>
        </View>

        <View>
          <View style={styles.separator} />
          <Text style={styles.largeText}>Address Information</Text>
          <View style={styles.separator} />
        </View>
        <Text style={styles.normalText}>{complaint.barangay}, {complaint.street}</Text>
      </View>
      {complaint.location && (
        <MapView
        provider={PROVIDER_GOOGLE}
        customMapStyle= {mapCustomStyle}
          style={{ flex:1,  height: Dimensions.get('window').height * 0.3,
          marginLeft: 20,
          marginRight: 20,
          marginTop: 20,}}
          initialRegion={{
            latitude: complaint.location.latitude,
            longitude: complaint.location.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
        >
          <Marker coordinate={complaint.location} title={complaint.name} />
          {/* Add more Marker components for additional markers */}
        </MapView>
      )}
      <View>
      <View style={styles.separator} />
      <Text style={styles.largeText}>Police Feedbacks</Text>
      <View style={styles.separator} />
      {complaint.PoliceFeedback ? (
        complaint.PoliceFeedback.split('\n').map((feedbackLine, index) => (
          <View key={index} style={styles.feedbackItem}>
            <View style={styles.chatBubble}>
              <Text style={styles.feedbackText}>
                {feedbackLine.split(': ')[1]} {/* Extract feedback message */}
              </Text>
              <Text style={styles.timestampText}>
                {feedbackLine.split(': ')[0]} {/* Extract timestamp */}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <Text>No Police Feedback available</Text>
      )}
      <View style={styles.separator} />
        </View>
        </View>
    </ScrollView>
  );
};
const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    margin: 5,
  },
  // Define other styles as needed
  boldText: {
    fontWeight: 'bold',
  },
  normalText: {
    fontWeight: 'normal',
  },
  separator: {
    borderBottomColor: 'black',
    borderBottomWidth: 0.5,
    marginTop: 10,
    marginBottom: 5,
    color: '#808080',
  },
  statusContainer: {
    backgroundColor: 'black',
    padding: 2,
    borderRadius: 5,
    marginTop: 2,
    width: 90,
  },
  
  statusText: {
    color: 'white',
    justifyContent: 'center',
    textAlign: 'center',
    padding:1,
  },
  largeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    justifyContent: 'center',
  },
  feedbackText: {
    color: 'black',
    textAlign: 'right', // Center-align the feedback message
    fontStyle:'italic',
  },
  timestampText: {
    color: 'black',
    fontSize:18,
    textAlign: 'left', // Right-align the timestamp
  },
  chatBubble: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    flexDirection: 'column-reverse',
   },
    feedbackItem: {
    marginBottom: 10,
    maxWidth: '70%',
  },
  // Add more styles as needed
});
export default ViewComplaintDetails;