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
const ViewReportDetailsPolice = ({ route }) => {
  const { report } = route.params;
  const reportId = report.id;
  const [feedback, setFeedback] = useState('');
  const [mapReady, setMapReady] = useState(false);
  const [userData, setUserData] = useState(false);
  const [mapLayout, setMapLayout] = useState(false);
  const mapRef = useRef(null);
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState(report.status);
  const [loading, setLoading] = useState(false);
  const [temporaryStatus, setTemporaryStatus] = useState(report.status);
  const [reportColor, setReportColor] = useState('black')
  const warningThreshold = 3;
  const isAccountDisabled = userData.warning === 3;
  const warningResetThresholdHours = 24;
  const [warningButtonLabel, setWarningButtonLabel] = useState('');
  const [disable, setDisable] = useState(false);
  const [finaldisable, setFinalDisable] = useState(false);


  useEffect(() => {
    if (userData.warning >= warningThreshold) {
      if (userData.warning === 3) {
        setWarningButtonLabel('Disabled');
        setFinalDisable(true);
      } else if (userData.warning === 2) {
        setWarningButtonLabel('Disable Account');
        setDisable(true);
        setFinalDisable(false);
      } else {
        setWarningButtonLabel('Warning');
        setFinalDisable(false);
        setDisable(false);
      }
    } else {
      setWarningButtonLabel('Warning');
      setFinalDisable(false);
      setDisable(false);
    }
    console.log('userData.warning:', userData.warning); // Add this line
  }, [userData.warning]);

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
    // Check and log the warning count when it changes
    console.log('Warning count has changed:', userData.warning);
  }, [report.warning]);
  useEffect(() => {
    // Check and reset the warning count on component load
    checkAndResetWarningCount();
  
    // Set up an interval to periodically check and reset the warning count
    const interval = setInterval(() => {
      checkAndResetWarningCount();
    },  1800000); // Check every 10 seconds (10000 milliseconds)
  
    return () => {
      clearInterval(interval); // Clear the interval when the component unmounts
    };
  }, []);
  
  useEffect(() => {
    if (userData.warning === 2) {
      setDisable(true);
    } else {
      setDisable(false);
    }
  }, [userData.warning]);
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const firestore = getFirestore();
        const userRef = doc(firestore, 'User', report.userId);
    
        const userSnapshot = await getDoc(userRef);
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          setUserData(userData);
    
          // Now, you can access the 'warning' count from the userData
          const warningCount = userData.warning || 0;
          console.log(`Warning count: ${warningCount}`);
          
          // Update the button label based on the warning count
          updateWarningButtonLabel(warningCount);
          setDisable(warningCount === 2);
        } else {
          // Handle the case where the user data doesn't exist
          console.log('User data not found.');
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
  
    fetchUserData();
  }, [report.userId]);
  console.log('disable',disable);
  console.log('fdisable',finaldisable);
  const updateWarningButtonLabel = (warningCount) => {
    if (warningCount >= warningThreshold) {
      if (warningCount === 3) {
        setWarningButtonLabel('Disabled');
      } else if (warningCount === 2) {
        setWarningButtonLabel('Disable Account');
      } else {
        setWarningButtonLabel('Warning');
      }
    } else {
      setWarningButtonLabel('Warning');
    }
  };
  
  const handleSaveFeedback = async () => {
    if (!feedback) {
      // If feedback is empty, display an error message and return early
      Alert.alert('Error', 'Feedback cannot be empty.');
      return;
    }
  
    try {
      setLoading(true); // Show loading indicator while sending feedback
  
      const firestore = getFirestore();
      const reportRef = collection(firestore, 'Reports');
      const querySnapshot = await getDocs(
        query(reportRef, where('transactionRepId', '==', report.transactionRepId))
      );
  
      if (!querySnapshot.empty) {
        const reportDoc = querySnapshot.docs[0];
        const reportRef = doc(firestore, 'Reports', reportDoc.id);
  
        const existingFeedback = report.PoliceFeedback || ''; // Get existing feedback
        const timestamp = new Date().toLocaleString(); // Get current timestamp
  
        let newFeedback = feedback + ': ' + timestamp; // Create new feedback message
  
        if (existingFeedback) {
          newFeedback = existingFeedback + '\n' + newFeedback; // Append new feedback with timestamp
        }
  
        await updateDoc(reportRef, { PoliceFeedback: newFeedback }, { merge: true });
  
        console.log('Complaint feedback successfully sent');
  
        report.PoliceFeedback = newFeedback; // Update the component state
        Alert.alert('Feedback Sent', 'Your feedback has been submitted successfully.');
        setFeedback('');
      } else {
        console.log('Document with transactionRepId does not exist');
      }
    } catch (error) {
      console.log('Error updating report status:', error);
      Alert.alert('Error', 'An error occurred while sending feedback.');
    } finally {
      setLoading(false);
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
  const checkAndResetWarningCount = async () => {
    try {
      const firestore = getFirestore();
      const userRef = doc(firestore, 'User', report.userId);
      const userSnapshot = await getDoc(userRef);
      const userData = userSnapshot.data();
  
      if (userData && userData.warning >= warningThreshold && userData.lastWarningTime) {
        const currentTime = new Date();
        const lastWarningTime = new Date(userData.lastWarningTime);
        const hoursPassed = (currentTime - lastWarningTime) / (1000 * 60 * 60);
        if (hoursPassed >= warningResetThresholdHours) {
          // Reset the warning count
          await setDoc(userRef, { warning: 0, lastWarningTime: null }, { merge: true });
          
          // Update the local state to reflect the change
          userData.warning = 0;
          userData.lastWarningTime = null;
          setFinalDisable(false);
          setDisable(false);
        }
      }
    } catch (error) {
      console.error('Error checking and resetting warning count:', error);
    }
  };
  useEffect(() => {
    // Check and log the warning count when it changes
    console.log('Warning count has changed:', userData.warning);
  }, [userData.warning]);
 
const handleWarning = async () => {
  if (userData.warning >= warningThreshold) {
    if (userData.warning === 3) {
      Alert.alert(
        'User Disabled',
        'The user is disabled for 24 hours due to excessive warnings. You can report again after 24 hours.',
        [
          {
            text: 'OK',
            onPress: () => console.log('OK Pressed'), // Handle the OK button action
          },
        ]
      );
      return;
    } else if (userData.warning === 2 || updatedWarnings === 2) {
      // Handle the logic for the "Disable Account" button
      Alert.alert(
        'Confirm Disable Account',
        'Are you sure you want to disable this user\'s account?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Disable Account',
            style: 'destructive',
            onPress: () => {
              // Implement logic to disable the user's account here
              // You should set userData.warning to 3 and update the Firestore record
              // Additionally, set a timestamp for the lastWarningTime if not set
              Alert.alert('Account Disabled', 'The user\'s account has been disabled.');
              // You can add additional code to handle the account disabling logic
            },
          },
        ]
      );
    }
  } else {
    // Handle the "Warning" button logic
    Alert.alert(
      'Confirm Warning',
      'Are you sure you want to warn this user for using the reporting system inappropriately?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Warn',
          style: 'destructive',
          onPress: async () => {
            // Implement logic to increment the warning count
            try {
              const firestore = getFirestore();
              const userRef = doc(firestore, 'User', report.userId);

              // Retrieve the existing warning count from Firestore
              const userSnapshot = await getDoc(userRef);
              const existingWarnings = userSnapshot.data().warning || 0; // Default to 0 if it's not defined

              // Increment the warning count
              const updatedWarnings = existingWarnings + 1;
              console.log('Updating warning count to', updatedWarnings);
              await setDoc(userRef, { warning: updatedWarnings }, { merge: true },);

              if (updatedWarnings === 2) {
                // Alert the user
                Alert.alert(
                  'Warning Issued',
                  'The user has received 2 warnings. Their account can now be disabled.',
                  [
                    {
                      text: 'OK',
                      onPress: async () => {
                        // Update userData.warning to 2
                        const firestore = getFirestore();
                        const userRef = doc(firestore, 'User', report.userId);

                        const userSnapshot = await getDoc(userRef);
                        const updatedWarnings = existingWarnings + 1;
                        await setDoc(userRef, { warning: updatedWarnings }, { merge: true });
                        setDisable(true);
                        console.log('OK Pressed');
                      },
                    },
                  ]
                );
              
              } else if (updatedWarnings === 3) {
                // Set the lastWarningTime only when the warning count reaches 3
                await setDoc(userRef, { warning: updatedWarnings, lastWarningTime: new Date().toISOString(), isAccountDisabled:true, }, { merge: true });
                setFinalDisable(true);
                // Handle the "Disabled" button state here
                Alert.alert(
                  'Account Disabled',
                  'The user has been disabled due to excessive warnings. They can be re-enabled after 24 hours.',
                  [
                    {
                      text: 'OK',
                      onPress: () => console.log('OK Pressed'),
                    },
                  ]
                );
                // You can also add additional logic to disable the user's account here
              } else {
                // Increment the warning count without setting lastWarningTime
                await setDoc(userRef, { warning: updatedWarnings }, { merge: true });
                // Update the local state to reflect the change
                setUserData({ ...userData, warning: updatedWarnings });
                Alert.alert('User Warned', 'The user has been warned.');
              }
            } catch (error) {
              console.error('Error updating user account:', error);
            }
          },
        },
      ]
    );
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
  console.log('Warning jrjr',userData.warning)
  return (
    <ScrollView style={styles.flexContainer}>
      <View style={styles.flexContainer}>
        <View style={styles.contentContainer}>
          <Text style={styles.boldText}>Reported By: </Text>
          <Text style={styles.normalText}>{report.name}</Text>
          <Text style={styles.boldText}>Date Incident: </Text>
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
        <TextInput
        style={styles.textInput}
        value={feedback}
        onChangeText={setFeedback}
        placeholder="Enter your feedback here"
        multiline={true}
      />
      <TouchableOpacity style={{backgroundColor: 'red',
      borderRadius: 5,
      padding: 10,
      width: '80%',
      alignSelf: 'center', // Center horizontally within the parent view
      marginBottom: 10,
      justifyContent: 'center',}} onPress={handleSaveFeedback}  disabled={loading}>
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <Text style={styles.buttonText}>Send Feedback</Text>
      )}
       </TouchableOpacity>
       
       <TouchableOpacity
        style={{
          backgroundColor: (userData.warning === 3 || finaldisable) ? 'gray' : 'orange',
          borderRadius: 5,
          padding: 10,
          width: '80%',
          alignSelf: 'center',
          marginBottom: 10,
          justifyContent: 'center',
        }}
        onPress={(userData.warning === 3 || finaldisable) ? null : handleWarning}
        disabled={userData.warning === 3 || finaldisable}
      >
       <Text style={{ textAlign: 'center', color: 'white', fontWeight: 'bold' }}>
         {finaldisable
           ? 'Disabled'
           :  disable // Check if 'disable' is true
           ? 'Disable Account'
           : 'Warning'}
       </Text>
     </TouchableOpacity>
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
  ButtonText: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
  },

  disabledButton: {
    backgroundColor: 'gray',
    // Add other button styles as needed
  },

  warningButtonText: {
    color: 'white',
    fontSize: 16,
  },
});

export default ViewReportDetailsPolice;