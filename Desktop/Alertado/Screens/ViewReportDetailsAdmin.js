import React, { useState, useRef, useEffect } from 'react';
import { View, Text, Dimensions, StyleSheet, TouchableOpacity, Alert, Modal, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { ScrollView } from 'react-native-gesture-handler';
import { getFirestore, deleteDoc, doc, collection, query, where, getDocs, updateDoc,getDoc,setDoc,addDoc } from '@firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig, { db } from '../firebaseConfig';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

const mapCustomStyle = [ { "elementType": "geometry", "stylers": [ { "color": "#242f3e" } ] }, { "elementType": "labels.text.fill", "stylers": [ { "color": "#746855" } ] }, { "elementType": "labels.text.stroke", "stylers": [ { "color": "#242f3e" } ] }, { "featureType": "administrative.locality", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "poi.park", "elementType": "geometry", "stylers": [ { "color": "#263c3f" } ] }, { "featureType": "poi.park", "elementType": "labels.text.fill", "stylers": [ { "color": "#6b9a76" } ] }, { "featureType": "road", "elementType": "geometry", "stylers": [ { "color": "#38414e" } ] }, { "featureType": "road", "elementType": "geometry.stroke", "stylers": [ { "color": "#212a37" } ] }, { "featureType": "road", "elementType": "labels.text.fill", "stylers": [ { "color": "#9ca5b3" } ] }, { "featureType": "road.highway", "elementType": "geometry", "stylers": [ { "color": "#746855" } ] }, { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [ { "color": "#1f2835" } ] }, { "featureType": "road.highway", "elementType": "labels.text.fill", "stylers": [ { "color": "#f3d19c" } ] }, { "featureType": "transit", "elementType": "geometry", "stylers": [ { "color": "#2f3948" } ] }, { "featureType": "transit.station", "elementType": "labels.text.fill", "stylers": [ { "color": "#d59563" } ] }, { "featureType": "water", "elementType": "geometry", "stylers": [ { "color": "#17263c" } ] }, { "featureType": "water", "elementType": "labels.text.fill", "stylers": [ { "color": "#515c6d" } ] }, { "featureType": "water", "elementType": "labels.text.stroke", "stylers": [ { "color": "#17263c" } ] } ]
const ViewReportDetailsAdmin = ({ route }) => {
  const { report } = route.params;
  const reportId = report.id;
  const [feedback, setFeedback] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [mapLayout, setMapLayout] = useState(false);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [loading, setLoading] = useState(false);
  const [temporaryStatus, setTemporaryStatus] = useState(report.status);
  const [reportColor, setReportColor] = useState('black')
  useEffect(() => {
    if (report.status === 'Pending') {
      setReportColor('orange');
    } else if (report.status === 'Ongoing') {
      setReportColor('#08BAE1');
    } else if (report.status === 'Completed') {
      setReportColor('green');
    } else if (report.status === 'Cancelled') {
      setReportColor('red');
    } else {
      setReportColor('black');
    }
  }, [newStatus, report.status]);
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
      setLoading(true);
      const firestore = getFirestore();
      const querySnapshot = await getDocs(
        collection(firestore, 'Reports'),
        where('transactionRepId', '==', report.transactionRepId)
      );
  
      if (!querySnapshot.empty) {
        const reportDoc = querySnapshot.docs[0];
        const reportRef = doc(firestore, 'Reports', reportDoc.id);
  
        await updateDoc(reportRef, { PoliceFeedback: feedback }, { merge: true });
  
        console.log('Report feedback  successfully sent');
  
        // Update the status property of the report directly
        report.PoliceFeedback = feedback;
      } else {
        console.log('Document with transactionRepId does not exist');
      }
    } catch (error) {
      console.log('Error updating report status:', error);
    }
  };
  const changeStatus = async () => {
    if (temporaryStatus === report.status) {
      setModalVisible(false);
      return;
    }
    if (report.status === 'Ongoing' && temporaryStatus === 'Pending') {
      
      Alert.alert('Invalid Status Change', 'You cannot change "Ongoing" to "Pending".');
      return;
    }
    if (report.status === 'Completed' && temporaryStatus !== 'Completed') {
      Alert.alert('Invalid Status Change', 'A report that is "Completed" cannot be changed.');
      return;
    }
  
    if (report.status === 'Cancelled' && temporaryStatus !== 'Cancelled') {
      Alert.alert('Invalid Status Change', 'A report that is "Cancelled" cannot be changed.');
      return;
    }
    try {
      setLoading(true);
      const firestore = getFirestore();
      const reportsRef = collection(firestore, 'Reports');
      const querySnapshot = await getDocs(
        query(reportsRef, where('transactionRepId', '==', report.transactionRepId))
      );

      if (!querySnapshot.empty) {
        const reportDoc = querySnapshot.docs[0];
        const reportRef = doc(firestore, 'Reports', reportDoc.id);

        await updateDoc(reportRef, { status: temporaryStatus });

        Alert.alert('Status Change Successful', `Status changed to "${temporaryStatus}"`);
        console.log('Report status updated successfully');
        setModalVisible(false);
        setNewStatus(temporaryStatus);
        // Update the status property of the report directly
        report.status = temporaryStatus;
      } else {
        console.log('No matching documents found for transactionRepId:', report.transactionRepId);
      }
    } catch (error) {
      console.log('Error updating report status:', error);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteButtonPress = () => {
    Alert.alert(
      'Cancel',
      'Are you sure you want to cancel the report?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: changeStatus,
        },
      ],
    );
  };
  const formatDateAndTime = (timestamp) => {
    const reportDate = new Date(timestamp);
  
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
    };
  
    return reportDate.toLocaleDateString(undefined, options);
  };
  return (
    <ScrollView style={styles.flexContainer}>
      <View style={styles.flexContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.boldText}>Reported By: </Text>
          <Text style={styles.normalText}>{report.name}</Text>
          <Text style={styles.boldText}>Date Reported: </Text>
          <Text style={styles.normalText}>{report.date}</Text>
          <Text style={styles.boldText}>Complainee: </Text>
          <Text style={styles.normalText}>{report.complainee}</Text>
          <Text style={styles.boldText}>Wanted or not? </Text>
          <Text style={styles.normalText}>{report.wanted}</Text>
          <Text style={styles.boldText}>Details: </Text>
          <Text style={styles.normalText}>{report.message}</Text>
          <Text style={styles.boldText}>Report Transaction ID: </Text>
          <Text style={styles.italicText}>#{report.transactionRepId}</Text>
          <Text style={styles.boldText}>Date and Reported: </Text>
          <Text style={styles.normalText}> {formatDateAndTime(report.timestamp)}</Text>
          <Text style={styles.boldText}>Status:</Text>
          <View
          style={[
            styles.statusContainer,
            { backgroundColor: reportColor }, 
          ]}
        >
<Text style={styles.statusText}>{newStatus}</Text>
</View>

          <View>
            <View style={styles.separator} />
            <Text style={styles.largeText}>Address Information</Text>
            <View style={styles.separator} />
          </View>
          <Text style={styles.normalText}>{report.barangay}, {report.street}</Text>
        </View>

        {report.location && (
          <MapView
          provider={PROVIDER_GOOGLE}
            style={styles.map}
            ref={mapRef}
            onLayout={handleMapLayout}
            initialRegion={{
              latitude: report.location.latitude,
              longitude: report.location.longitude,
              latitudeDelta: 0.2,
              longitudeDelta: 0.2,
            }}
            onMapReady={onMapReady}
          >
            {mapReady && (
              <Marker
                coordinate={report.location}
                title={report.name}
                description={`#${report.transactionRepId}`}
              />
            )}
            {/* Add more Marker components for additional markers */}
          </MapView>
        )}

        <View>
        <View style={styles.separator} />
        <Text style={styles.largeText}>Police Feedbacks</Text>
        <View style={styles.separator} />
        {report.PoliceFeedback ? (
          report.PoliceFeedback.split('\n').map((feedbackLine, index) => (
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
        
        {!(report.status === 'Completed' || report.status === 'Cancelled') && (
  
      <TouchableOpacity style={styles.modalButton} onPress={() => setModalVisible(true)}>
      <Text style={styles.modalButtonText}>Change Status</Text>
    </TouchableOpacity>
    )}
    <Modal visible={modalVisible} transparent={true} animationType="slide">
    <View style={styles.modalContainer}>
      <View style={styles.modalContent}>
        <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeButton}>
          <Ionicons name="ios-close-outline" size={24} color="black" />
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => setTemporaryStatus('Pending')}>
        <Text
          style={[
            styles.statusOption,
            temporaryStatus === 'Pending' && styles.selectedStatusOption,
          ]}
        >
          Pending
        </Text>
      </TouchableOpacity>
        <TouchableOpacity onPress={() => setTemporaryStatus('Ongoing')}>
          <Text
            style={[
              styles.statusOption,
              temporaryStatus  === 'Ongoing' && styles.selectedStatusOption,
            ]}
          >
            Ongoing
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => setTemporaryStatus('Completed')}>
          <Text
            style={[
              styles.statusOption,
              temporaryStatus  === 'Completed' && styles.selectedStatusOption,
            ]}
          >
            Completed
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={() => setTemporaryStatus('Cancelled')}>
          <Text
            style={[
              styles.statusOption,
              temporaryStatus  === 'Cancelled' && styles.selectedStatusOption,
            ]}
          >
            Cancel
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity onPress={changeStatus}   disabled={loading} style={styles.confirmButton}>
        {loading ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <Text style={styles.confirmButtonText}>Confirm</Text>
        )}
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
  
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
    margin: 5,
  },
  button: {
    flex: 1,
    backgroundColor: '#FE0000',
    width: 250,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: 'white',
  },
  cancelContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
  },
  contentContainer: {
    margin: 5,
  },
  boldText: {
    fontWeight: 'bold',
  },
  normalText: {
    fontWeight: 'normal',
    marginLeft: 10,
  },
  italicText: {
    fontWeight: 'normal',
    marginLeft: 10,
    fontStyle: 'italic',
    marginTop: 4,
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
  statusButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 15,
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  separator: {
    marginVertical: 10,
    borderBottomColor: 'gray',
    borderBottomWidth: 1,
  },
  largeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  textInput: {
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
    height: 100,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 10,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: 'red',
    borderRadius: 5,
    padding: 10,
    width: '82%',
    alignSelf: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center'
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
  largeText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginVertical: 5,
    justifyContent: 'center',
  },
  map: {
    flex: 1,
    height: Dimensions.get('window').height * 0.3,
    marginLeft: 20,
    marginRight: 20,
    marginTop: 20,
  },
  centeredContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
  },
  statusOption: {
    fontSize: 18,
    marginVertical: 10,
  },
  selectedStatusOption: {
    backgroundColor: 'lightgray',
    borderRadius: 5,
    padding:5,
  },
  confirmButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    alignSelf: 'center',
    marginTop: 25,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    alignSelf: 'center', // Center horizontally within the parent view
    marginBottom: 10,
    justifyContent: 'center',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default ViewReportDetailsAdmin;