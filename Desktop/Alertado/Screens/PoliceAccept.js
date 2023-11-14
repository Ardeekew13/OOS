import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Button, Image, Text, TextInput, ActivityIndicator, TouchableOpacity, Alert    } from 'react-native';
import MapView, { Marker, Circle, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import axios from 'axios';
import { collection, onSnapshot, doc, setDoc,getDocs, getDoc, getFirestore, updateDoc, query, where, addDoc} from 'firebase/firestore';
import { initializeApp } from 'firebase/app';
import firebaseConfig, { db } from '../firebaseConfig';
import { getAuth, onAuthStateChanged } from '@firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const CustomMarker = ({ coordinate, zoomLevel, isPinned }) => {
  const defaultMarkerSize = 30; // Increase the marker size value
  const maxZoom = 20;

  const calculateMarkerSize = (zoom) => {
    const baseSize = defaultMarkerSize * (1 + (1 - zoom / maxZoom));
    const aspectRatio = originalImageWidth / originalImageHeight;
    let width, height;

    if (baseSize / aspectRatio > defaultMarkerSize) {
      width = baseSize;
      height = baseSize / aspectRatio;
    } else {
      width = defaultMarkerSize * aspectRatio;
      height = defaultMarkerSize;
    }

    return { width, height };
  };

  const originalImageWidth = 860; // Replace with the actual width of your image
  const originalImageHeight = 1060; // Replace with the actual height of your image

  const markerSize = calculateMarkerSize(zoomLevel);

  const submitPoliceFeedback = () => {
    const transactionSosId = '12345'; // Replace with the actual transactionSosId
    const feedbackText = 'This is the police feedback text.'; // Replace with the actual feedback text

    // Call the function to update police feedback
    updatePoliceFeedback(transactionSosId, feedbackText);
  };
  const updatePoliceFeedback = async (transactionSosId, feedback) => {
    try {
      const db = getFirestore();
      const emergencyRef = doc(db, 'Emergencies', transactionSosId);

      // Update the 'policeFeedback' field with the provided feedback
      await updateDoc(emergencyRef, {
        policeFeedback: feedback,
        // Add any other fields you want to update here if needed
      });

      console.log('Police feedback updated successfully');
    } catch (error) {
      console.error('Error updating police feedback:', error);
    }
  };
  return (
    <Marker coordinate={coordinate}>
      <Image
        source={require('./images/SosPIN.png')}
        style={markerSize}
        resizeMode="contain" // This ensures the image maintains its aspect ratio and doesn't crop
      />
    </Marker>
  );
};

const PoliceAccept = ({ route }) => {
  const [policeLocation, setPoliceLocation] = useState(null);
  const [sosLocation, setSosLocation] = useState(null);
  const [routeInstructions, setRouteInstructions] = useState([]);
  const { userSosLocation, transactionSosId, policeAssignedID, emergency } = route.params;
  const [originalUserSosLocation, setOriginalUserSosLocation] = useState(null);
  const [citizenLocation, setCitizenLocation] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [policeRealTimeLocation, setPoliceRealTimeLocation] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSubmitPressed, setIsSubmitPressed] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [policeFeedback, setPoliceFeedback] = useState('');
  const mapRef = useRef(null);
  const [policeLocationUpdated, setPoliceLocationUpdated] = useState(false);

  const [directionsFetched, setDirectionsFetched] = useState(false);

  const [directionData, setDirectionData] = useState(null);
  const navigation = useNavigation();
   useEffect(() => {
    let isMounted = true;

    const startPoliceLocationTracking = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const locationOptions = {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000, // Update location every 1 second (adjust as needed)
        };

        const locationSubscriber = await Location.watchPositionAsync(
          locationOptions,
          async (location) => {
            if (isMounted) {
              // Update the police's real-time location
              const newLocation = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };
              setPoliceLocation(newLocation);

              // Save the police's real-time location to Firebase Firestore
              try {
                const db = getFirestore();
                const emergenciesRef = collection(db, 'Emergencies');
                
                // Query for the document with a specific transactionSosId
                const querySnapshot = await getDocs(
                  query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
                );

                if (!querySnapshot.empty) {
                  // Document exists, update it
                  const emergencyDocRef = querySnapshot.docs[0].ref;
                  await updateDoc(emergencyDocRef, {
                    policeLocation: {
                      latitude: newLocation.latitude,
                      longitude: newLocation.longitude,
                    },
                  });

                  
                } else {
                  console.log('Emergency document does not exist.');
                }
              } catch (error) {
                console.error('Error updating police location:', error);
              }
            }
          }
        );
      }
    };

    startPoliceLocationTracking();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const fetchOngoingEmergencyData = async () => {
      console.log('gg')
      if (emergency.status === 'Pending' || emergency.status === 'Ongoing') {
        try {
          const db = getFirestore();
          const emergenciesRef = collection(db, 'Emergencies');
  
          // Query for the document with a specific transactionSosId
          const querySnapshot = await getDocs(
            query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
          );
  
          if (!querySnapshot.empty) {
            // Document exists, extract the data
            const emergencyDoc = querySnapshot.docs[0].data();
            setSosLocation(emergencyDoc.citizenLocation);
            console.log('Soslocat',sosLocation);
            // Check if routeCoordinates, policeLocation, and citizenLocation exist in the document
            if (emergencyDoc.routeCoordinates && emergencyDoc.policeLocation && emergencyDoc.citizenLocation) {
              // Extract the data
              const { routeCoordinates, policeLocation, citizenLocation} = emergencyDoc;
  
              // Update the state variables with the fetched data
              setRouteCoordinates(routeCoordinates);
              setPoliceLocation(policeLocation);
              setCitizenLocation(citizenLocation);
              console.log('police loc', policeLocation);
              // Set directionsFetched to true since routeCoordinates exist
              setDirectionsFetched(true);
            } else {
              console.log('Route coordinates, police location, or citizen location not found in document.');
            }
          } else {
            console.log('Emergency document does not exist.');
          }
        } catch (error) {
          console.error('Error fetching ongoing emergency data:', error);
        }
      }
    };
  
    const fetchInitialLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          // Fetch the current location of the police
          const location = await Location.getCurrentPositionAsync({});
          if (location) {
            setPoliceLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching initial location:', error);
      }
    };
  
    // Call both functions to fetch ongoing emergency data and initialLocation
    fetchOngoingEmergencyData();
    fetchInitialLocation();
  }, []);
  
  const savePoliceLocationToFirestore = async () => {
    console.log('Attempting to save police location to Firestore...');
    // Check if the "Submit" button is pressed and police location is available
      const auth = getAuth();
      const user = auth.currentUser;
  
      if (user || user.uid === emergency.policeAssignedID) {
        console.log('Attempting to save police location to Firestore...');
        try {
          const db = getFirestore();
          const emergenciesRef = collection(db, 'Emergencies');
  
          // Query for the document with a specific transactionSosId
          const querySnapshot = await getDocs(
            query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
          );
          if (!querySnapshot.empty) {
            // Document exists, update it
            const emergencyDocRef = querySnapshot.docs[0].ref;
            await updateDoc(emergencyDocRef, {
              policeLocation: {
                latitude: policeLocation.latitude,
                longitude: policeLocation.longitude,
                
              }, 
              status:'Ongoing', 
              
            });
         
            console.log('Police location updated in Emergencies collection.');
          } else {
            console.log('Emergency document does not exist.');
          }
        } catch (error) {
          console.error('Error updating police location:', error);
        }
      } else {
        console.log('User is not authorized to update the police location.');
      }
    
  };
  const handlePoliceMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setPoliceLocation({ latitude, longitude });

  };
 const handlePressFeedback = async () => {
  try {
    const firestore = getFirestore();
    const emergenciesRef = collection(firestore, 'Emergencies');

    // Query for the document with a specific transactionSosId
    const querySnapshot = await getDocs(
      query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
    );

    if (!querySnapshot.empty) {
      // Document exists, update the "policeFeedback" field
      const emergencyDocRef = querySnapshot.docs[0].ref;
      await updateDoc(emergencyDocRef, { policeFeedback });

      // Show an alert that the feedback was sent
      Alert.alert('Feedback Sent', 'Your feedback has been sent successfully.');

      // Clear the feedback input field
      setPoliceFeedback('');

      console.log('Sent');
    } else {
      console.log('Emergency document with the given transactionSosId does not exist.');
    }
  } catch (error) {
    // Handle unexpected errors
    console.error('Error sending feedback:', error);
    // Display an error message to the user or handle the error accordingly
  }
};
  const handleComplete = async () => {
    try {
      const firestore = getFirestore();
      const emergenciesRef = collection(firestore, 'Emergencies');
  
      // Query for the document with a specific transactionSosId
      const querySnapshot = await getDocs(
        query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
      );
  
      if (!querySnapshot.empty) {
        // Document exists, update the "status" field to "Completed"
        const emergencyDocRef = querySnapshot.docs[0].ref;
        await updateDoc(emergencyDocRef, { status: 'Completed' });
        Alert.alert(
          'Completed!',
          'The SOS has been marked as completed.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Navigate back to ViewSOSPolice
                navigation.navigate('ViewSOSPolice');
              },
              style: 'cancel',
            },
          ],
          { textAlign: 'center' }
        );
        console.log('Status updated to Completed');
      } else {
        console.log('Emergency document with the given transactionSosId does not exist.');
      }
    } catch (error) {
      // Handle unexpected errors
      console.error('Error updating status to Completed:', error);
      // Display an error message to the user or handle the error accordingly
    }
  };
  
  const handleCancel = async () => {
    // Show an alert to confirm cancellation
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this emergency?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              const firestore = getFirestore();
              const emergenciesRef = collection(firestore, 'Emergencies');
  
              // Query for the document with a specific transactionSosId
              const querySnapshot = await getDocs(
                query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
              );
  
              if (!querySnapshot.empty) {
                // Document exists, update the "status" field to "Cancelled"
                const emergencyDocRef = querySnapshot.docs[0].ref;
                await updateDoc(emergencyDocRef, { status: 'Cancelled' });
                console.log('Status updated to Cancelled');
  
                navigation.navigate('ViewSOSPolice');
              } else {
                console.log('Emergency document with the given transactionSosId does not exist.');
              }
            } catch (error) {
              // Handle unexpected errors
              console.error('Error updating status to Cancelled:', error);
              // Display an error message to the user or handle the error accordingly
            } finally {

            }
          },
        },
      ]
    );
  };
  const fetchDirectionsGeoapify = async () => {
    if (!policeLocation || !userSosLocation) return;
  
    try {
      // Check if direction data is already fetched
      if (directionsFetched && directionData) {
        setRouteCoordinates(directionData.routeCoordinates);
        setDirectionsFetched(true);
      } else {
        const apiKey = 'ab9f834b500a40bf9c3ed196ee1a0ead';
        const origin = `${policeLocation.latitude},${policeLocation.longitude}`;
        const destination = `${userSosLocation.latitude},${userSosLocation.longitude}`;
        const response = await fetch(
          `https://api.geoapify.com/v1/routing?waypoints=${origin}|${destination}&mode=drive&apiKey=${apiKey}`
        );
  
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          const route = data.features[0].geometry.coordinates;
          const routeCoordinate = route[0].map((coordinate) => ({
            latitude: coordinate[1],
            longitude: coordinate[0],
          }));
          setRouteCoordinates(routeCoordinate);
          setDirectionsFetched(true);
  
          // Store direction data in state
          setDirectionData({ routeCoordinates: routeCoordinate });
  
          // Update Firestore with direction data based on user ID
          const db = getFirestore();
          const user = getAuth().currentUser;
          console.log('Current User UID:', user ? user.uid : 'Not logged in');
          if (user || user.uid === emergency.policeAssignedID) {
            try {
              const emergenciesRef = collection(db, 'Emergencies');
  
              // Query for the document with a specific transactionSosId
              const querySnapshot = await getDocs(
                query(emergenciesRef, where('transactionSosId', '==', emergency.transactionSosId))
              );
  
              if (!querySnapshot.empty) {
                // Document exists, update it
                const emergencyDocRef = querySnapshot.docs[0].ref;
                await updateDoc(emergencyDocRef, { routeCoordinates: routeCoordinate });
                console.log('Direction data updated in Firestore');
                savePoliceLocationToFirestore();
              } else {
                console.log('Emergency document does not exist.');
              }
            } catch (error) {
              console.error('Error updating direction data:', error);
            }
          } else {
            console.log('User is not authorized to update the direction data.');
          }
        } else {
          console.log('No route found.');
        }
      }
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };
  return (
    <View style={{ flex: 1 }}>
      {emergency.status !== 'Completed' && emergency.status !== 'Cancelled' ? (
        <View style={{ flex: 1 }}>
          {directionsFetched ? (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                // Set the initial region for the new MapView here
                latitude: (routeCoordinates[0] && routeCoordinates[0].latitude) || 0,
                longitude: (routeCoordinates[0] && routeCoordinates[0].longitude) || 0,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
            >
              {/* Render the Polyline */}
              {routeCoordinates && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="blue"
                  strokeWidth={4}
                />
                )}
  
              {/* Render a custom marker for citizenLocation (or sosLocation) */}
              {sosLocation && (
                <CustomMarker
                  coordinate={sosLocation}
                  zoomLevel={zoomLevel} // If needed, adjust the zoom level
                  title="Citizen"
                />
                )}
  
              {/* Render a marker for policeRealTimeLocation */}
              {policeLocation && (
                <Marker
                  coordinate={policeLocation}
                  anchor={{ x: 0.5, y: 0.5 }}
                  title="Police (Real Time)"
                >
                  <Image
                    source={require('./images/policeCircle.png')} // Replace with the actual path to your real-time police marker image
                    style={{ width: 40, height: 43 }} // Adjust the size as needed
                  />
                </Marker>
                )}
  
              {policeLocation && (
                <Circle
                  center={policeLocation}
                  radius={300}
                  fillColor="rgba(0, 128, 255, 0.2)"
                  strokeColor="rgba(0, 128, 255, 0.5)"
                />
                )}
            </MapView>
          ) : (
            <MapView
              ref={mapRef}
              style={styles.map}
              initialRegion={{
                latitude: userSosLocation ? userSosLocation.latitude : 9.8500,
                longitude: userSosLocation ? userSosLocation.longitude : 124.1430,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              onRegionChange={(region) => {
                const calculatedZoomLevel = 1 / region.latitudeDelta;
                setZoomLevel(calculatedZoomLevel);
              }}
            >
              {policeLocation && (
                <Marker
                  coordinate={policeLocation}
                  title="Police"
                  draggable
                  onDragEnd={handlePoliceMarkerDragEnd}
                >
                  <Image
                    source={require('./images/PolicePin.png')} // Replace with the actual path to your circular image
                    style={{ width: 40, height: 43 }} // Adjust the size as needed
                  />
                </Marker>
                )}
              {sosLocation && (
                <Circle
                  center={sosLocation}
                  radius={500}
                  fillColor="rgba(0, 128, 255, 0.2)"
                  strokeColor="rgba(0, 128, 255, 0.5)"
                />
                )}
              {sosLocation && (
                <Marker
                  coordinate={sosLocation}
                >
                  <Image
                    source={require('./images/SosPIN.png')} // Replace with the actual path to your circular image
                    style={{ width: 40, height: 42 }} // Adjust the size as needed
                  />
                </Marker>
                )}
              {routeCoordinates && (
                <Polyline
                  coordinates={routeCoordinates}
                  strokeColor="blue"
                  strokeWidth={4}
                />
                )}
            </MapView>
          )}
          {!directionsFetched ? (
            <Button
              title={isProcessing ? 'Processing...' : 'Submit'}
              onPress={async () => {
                console.log('Submit button clicked.');
                setIsSubmitPressed(true);
                setIsProcessing(true); // Set isProcessing to true when the button is clicked
  
                // Your asynchronous operations here
                await savePoliceLocationToFirestore();
                fetchDirectionsGeoapify();
  
                setIsProcessing(false); // Set isProcessing back to false when the operations are done
              }}
              disabled={isProcessing} // Disable the button when it's processing
            />
          ) : (
            <View style={styles.directionsContainer}>
              <Text style={styles.helpText}>Help is on the way</Text>
              <TextInput
                style={styles.feedbackInput}
                placeholder="Enter police feedback"
                onChangeText={(text) => setPoliceFeedback(text)}
                value={policeFeedback}
              />
              <TouchableOpacity onPress={handlePressFeedback}>
                <View style={styles.sendFeedbackButton}>
                  <Text style={styles.sendFeedbackText}>Send Feedback</Text>
                </View>
              </TouchableOpacity>
              <View style={styles.directionsButtonsContainer}>
                <View style={styles.directionsButton}>
                  <Button title="Complete" onPress={handleComplete} color="green" />
                </View>
                <View style={styles.directionsButton}>
                  <Button title="Cancel" onPress={handleCancel} color="red" />
                </View>
              </View>
            </View>
          )}
        </View>
      ) : (
        // You can add an optional view or message here for the "Completed" or "Cancelled" status
        <View style={styles.completedStatusContainer}>
          <Text style={styles.completedStatusText}>
            This emergency has been {emergency.status === 'Completed' ? 'completed' : 'cancelled'}.
          </Text>
        </View>
      )}
    </View>
  );
      }

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  directionsContainer: {
    flex: 1,
    justifyContent: 'center', // Align the content at the top
    height: 40,
    color: 'white',
    borderTopEndRadius: 5,
  },
  directionsHeader: {
    flex: 1,
    justifyContent: 'flex-start', // Align the content at the top
    height: 40,
  },
  directionsButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  directionsButton: {
    flex: 1,
    marginHorizontal: 8,
  },
  helpText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom:20,
  },
  feedbackInputContainer: {
    alignItems: 'flex-start', // Align input container content at the top
    margin: 16,
  },
  feedbackInputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  feedbackInput: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    margin: 16,
    paddingHorizontal: 8,
    height: 100,
    marginTop: 5,
  },
  sendFeedbackButton: {
    backgroundColor: '#08BAE1',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10, 
    paddingHorizontal: 20, 
    borderRadius: 5, 
    marginHorizontal: 10,
  },
  sendFeedbackText: {
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold',
  },
});

export default PoliceAccept;