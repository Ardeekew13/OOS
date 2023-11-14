import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { doc, addDoc, collection, getDoc, setDoc, runTransaction,getDocs,getFirestore, updateDoc, onSnapshot, query, where } from 'firebase/firestore';
import MapView, { Marker, Circle, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '../firebaseConfig.js';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/core';
const CustomMarker = ({ coordinate, zoomLevel }) => {
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
const SOS = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigation = useNavigation();
  const [hasPendingSOS, setHasPendingSOS] = useState(false);
  const [hasOngoingSOS, setHasOngoingSOS] = useState(false);
  const [emergencyType, setEmergencyType] = useState(null);
  const [userSosStatus, setUserSosStatus] = useState(null);
  const [cancelledSOS, setCancelledSOS]  = useState(false);
  const [userSosLocation, setUserSosLocation] = useState(null);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [policeLocation, setPoliceLocation] = useState(null);
  const [citizenLocation, setCitizenLocation] = useState(null);
  const [realtimeLocation, setRealTimeLocation] = useState(null);
  const [isMapReady, setIsMapReady] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [userPoliceAssignedData, setUserPoliceAssignedData] = useState(null);
  const [markerPosition, setMarkerPosition] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isWaitingForPolice, setIsWaitingForPolice] = useState(false);
  const [pingingCircleRadius, setPingingCircleRadius] = useState(0);
  const [pendingSOSData, setPendingSOSData] = useState(null);
  const [ongoingSOSData, setOngoingSOSData] = useState(null);
  const [isExpanding, setIsExpanding] = useState(false);
  const [pingingPosition, setPingingPosition] = useState(null);
  const [pingingAngle, setPingingAngle] = useState(0);
  const [mapKey, setMapKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [initialRegion, setInitialRegion] = useState({
    // Set initial latitude and longitude based on userSosLocation
    latitude: userSosLocation ? userSosLocation.latitude : 0,
    longitude: userSosLocation ? userSosLocation.longitude : 0,
    latitudeDelta: 0.01, // Adjust the zoom level as needed
    longitudeDelta: 0.01,
  });

  const db = getFirestore();
 
  const mapRef = useRef(null); // Callback ref for the MapView

  const [isMapLayoutReady, setIsMapLayoutReady] = useState(false);

  const remountMap = () => {
    setMapKey(mapKey + 1);
  };
  useEffect(() => {
    console.log('Component Rendered');
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
  
        // Fetch the user's information here
        try {
          const userDocRef = doc(db, 'User', user.uid);
          const userDocSnapshot = await getDoc(userDocRef);
  
          if (userDocSnapshot.exists()) {
            const userInfo = userDocSnapshot.data(); // Change from userData to userInfo
            setUserInfo(userInfo); // Change from setUserData to setUserInfo
          }
        } catch (error) {
          console.error('Error fetching user information:', error);
        }
      } else {
        setCurrentUser(null);
      }
    });
  
    return () => {
      unsubscribeAuth();
    };
  }, []);
  useEffect(() => {
    console.log('Component Rendered');
    if (currentUser) {
        const db = getFirestore();
        const auth = getAuth();

        // Create a query to find the 'Pending' or 'Ongoing' emergency documents for the current user
        const sosQuery = query(
            collection(db, 'Emergencies'),
            where('userId', '==', currentUser.uid),
            where('status', 'in', ['Pending', 'Ongoing',''])
        );

        const unsubscribe = onSnapshot(sosQuery, async (snapshot) => {
          let hasPendingSOS = false;
          let hasOngoingSOS = false;
          let pendingSOSData = null;
          let ongoingSOSData = null;
          let cancelledSOS = false;
          for (const doc of snapshot.docs) {
            const sosData = doc.data();

        
            setUserSosStatus(sosData.status);
        
            // Set the userSosLocation state with the location data
            setUserSosLocation({
              latitude: sosData.citizenLocation.latitude,
              longitude: sosData.citizenLocation.longitude,
            });
        
            if (sosData.status === 'Ongoing') {
              // If it's an ongoing emergency, set the entire sosData
              ongoingSOSData = sosData;
              hasOngoingSOS = true;
              setPoliceLocation(ongoingSOSData.policeLocation);
              setRouteCoordinates(ongoingSOSData.routeCoordinates);
              setCitizenLocation(ongoingSOSData.citizenLocation);
              setUserData(ongoingSOSData);
            }
            if (sosData.status === 'Pending') {
              hasPendingSOS = true;
              pendingSOSData = sosData;
             
            }
            if (sosData.status === 'Cancelled'||sosData.status === '') {
              hasOngoingSOS = false;
              hasPendingSOS = false;
              cancelledSOS= true;

             
            }
          }
        
          console.log('hasPendingSOS:', hasPendingSOS);
          console.log('hasOngoingSOS:', hasOngoingSOS);
        
          setHasPendingSOS(hasPendingSOS);
          setHasOngoingSOS(hasOngoingSOS);
          setPendingSOSData(pendingSOSData);
          setOngoingSOSData(ongoingSOSData);
      
        });
        return unsubscribe;
    } 
}, [currentUser, hasPendingSOS, hasOngoingSOS]);
  const fitMapToBounds = useCallback(() => {
    if (!isMapLayoutReady || !isMapReady || !isWaitingForPolice || !mapRef.current) return;

    // Calculate bounds based on markerPosition and pingingPosition (if available)
    let bounds = [markerPosition];
    if (pingingPosition) {
      bounds.push(pingingPosition);
    }

    // Fit the map to the new bounds
    mapRef.current.fitToCoordinates(bounds, {
      edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
      animated: true,
    });
  }, [isMapLayoutReady, isMapReady, isWaitingForPolice, markerPosition, pingingPosition]);

  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.error('Permission to access location was denied');
          return;
        }

        const citizenLocation = await Location.getCurrentPositionAsync({});
        setCurrentLocation(citizenLocation.coords);
        setMarkerPosition(citizenLocation.coords);
        setInitialRegion((prevRegion) => ({
          ...prevRegion,
          latitude: citizenLocation.coords.latitude,
          longitude: citizenLocation.coords.longitude,
          
        }));
        console.log('latitue',latitude);
        console.log('longitude',longitude);
      } catch (error) {
        console.error('Error getting current location', error);
      }
    };

    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUser(user);
      } else {
        setCurrentUser(null);
      }
    });

    getLocation();

    return () => {
      unsubscribeAuth();
    };
  }, []);

  useEffect(() => {
    let animationFrameId;
  
    const updatePingingEffect = () => {
      setPingingCircleRadius((prevRadius) => {
        if (prevRadius < 2000) {
          return prevRadius + 100; // Adjust the increment as needed
        } else {
          setIsExpanding(false);
          return 0;
        }
      });
  
      setPingingAngle((prevAngle) => prevAngle + 1); // Increment the pinging angle
  
      if (markerPosition) {
        // Use the updated values directly from state
        const radiusInMeters = pingingCircleRadius;
        const angleRad = pingingAngle * (Math.PI / 180); // Convert angle to radians
        const latitude = markerPosition.latitude + (radiusInMeters / 111320) * Math.cos(angleRad);
        const longitude =
          markerPosition.longitude +
          (radiusInMeters / (111320 * Math.cos(markerPosition.latitude * (Math.PI / 180)))) *
          Math.sin(angleRad);
        setPingingPosition({ latitude, longitude });
      }
  
      animationFrameId = requestAnimationFrame(updatePingingEffect);
    };
  
    if ((isWaitingForPolice || userSosStatus === 'Pending') && markerPosition) {
      animationFrameId = requestAnimationFrame(updatePingingEffect);
    } else {
      setPingingCircleRadius(0);
      setPingingPosition(null);
      setPingingAngle(0);
    }
  
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isWaitingForPolice, userSosStatus, markerPosition, pingingAngle, pingingCircleRadius]);

  
  const handleEmergencyType = (type) => {
    setEmergencyType(type);
    setIsModalOpen(false);
  };

  const handleMarkerDragEnd = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
  };

  const handleBackButton = () => {
    setEmergencyType(null);
    setMarkerPosition(currentLocation);
  };

  const cancelEmergency = async (currentUser) => {
    try {
      const db = getFirestore();
      const sosQuery = query(
        collection(db, 'Emergencies'),
        where('userId', '==', currentUser.uid),
        where('status', '==', 'Pending') 
      );
  
      const querySnapshot = await getDocs(sosQuery);
  
      if (querySnapshot.empty) {
        console.log('No pending SOS found for the current user');
        return;
      }
  
      // Assuming there's only one pending SOS document for the current user
      const sosDoc = querySnapshot.docs[0];
      console.log('Cancelling SOS for user:', currentUser.uid);
      // Update the status field to "Cancelled"
      await updateDoc(sosDoc.ref, { status: 'Cancelled' });
     setHasPendingSOS(false);
     Alert.alert(
      'Cancelled!',
      'SOS sent is cancelled',
      [
        {
          text: 'OK',
          onPress: () => {}, // Remove the navigation from here
          style: 'cancel',
        },
      ],
      { textAlign: 'center' }
    );
      console.log('SOS status updated to "Cancelled" successfully');
    } catch (error) {
      console.error('Error cancelling SOS:', error);
    }
  
    // Hide the "Waiting for Police" UI
    setIsWaitingForPolice(false);
  };
  const handleCancel = async (currentUser) => {
    if (userSosStatus === 'Pending') {
       console.log('Cancelling SOS...');
      cancelEmergency(currentUser);
    }
  };
  
  const submitEmergency = async () => {
    if (emergencyType && markerPosition) {
      setIsWaitingForPolice(true);
   
  
      try {
        const transactionNumberDoc = doc(db, 'TransactionSOS', 'transactionSosId');
        const transactionSnapshot = await getDoc(transactionNumberDoc);
        let transactionSosId = '00001'; // Default value if no transaction ID exists
  
        if (transactionSnapshot.exists()) {
          const { currentNumber } = transactionSnapshot.data();
          const newTransactionNumber = currentNumber + 1;
          transactionSosId = String(newTransactionNumber).padStart(5, '0');
        }
  
        // Update the transaction document with the new SOS ID
        await setDoc(transactionNumberDoc, { currentNumber: Number(transactionSosId) });
  
        const currentUser = getAuth().currentUser;
        const userId = currentUser?.uid;
        let userFirstName = 'Unknown User';
  
        if (userId) {
          const userDocRef = doc(db, 'User', userId);
          const userDocSnapshot = await getDoc(userDocRef);
  
          if (userDocSnapshot.exists()) {
            const userData = userDocSnapshot.data();
            userFirstName = userData?.Fname || 'Unknown User';
          }
        }
  
        const currentDate = new Date();
  
        await addDoc(collection(db, 'Emergencies'), {
          type: emergencyType,
          citizenLocation: {
            latitude: markerPosition.latitude,
            longitude: markerPosition.longitude,
          },
          transactionSosId: transactionSosId,
          timestamp: currentDate.toISOString(),
          userFirstName: userFirstName,
          status: 'Pending',
          userId: currentUser.uid,
        });
        setIsLoading(false); // Set isLoading to false when the submission is complete
        Alert.alert(
          'SOS Successful!',
          'Help is on the way.',
          [
            {
              text: 'OK',
              onPress: () => {}, // Remove the navigation from here
              style: 'cancel',
            },
          ],
          { textAlign: 'center' }
        );
      } catch (error) {
        setIsLoading(false); // Set isLoading to false when an error occurs
        console.error('Error submitting emergency:', error);
        Alert.alert(
          'Error',
          'An error occurred while submitting the emergency.',
          [
            {
              text: 'OK',
              onPress: () => {},
            },
          ],
          { textAlign: 'center' }
        );
      }
    }
  };
 
  return (
    <SafeAreaView style={styles.container}>
    { hasOngoingSOS && userSosStatus !== 'Cancelled' ? (
        <View style={styles.container}>
        <View style={styles.ongoingContainer}>
        <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: userSosLocation.latitude,
          longitude: userSosLocation.longitude,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
        onLayout={() => setIsMapReady(true)}
        ref={mapRef}
      >
          {userSosLocation && isMapReady && (
            <Marker
            coordinate={userSosLocation}
            flat={true} // Ensure the image doesn't tilt with the map
          >
              <Image
                source={require('./images/SosPIN.png')} 
                style={{
                  width: 40,
                  height: 42, // Use the same dimensions as your custom image
                  borderRadius: 20,
                
                }}
              />
            </Marker>
          )}
          {policeLocation && isMapReady && (
            <Marker coordinate={policeLocation}
            anchor={{ x: 0.5, y: 0.5 }}>
              <Image
                source={require('./images/policeCircle.png')} 
                style={{ width: 40, height: 40 }} // Adjust the size as needed
              />
            </Marker>
          )}
            {policeLocation && isMapReady && (
              <Circle
                center={policeLocation}
              radius={500}
              fillColor="rgba(0, 128, 255, 0.2)"
              strokeColor="rgba(0, 128, 255, 0.5)"
                // Add any other marker customization you need
              />
            )}
            {routeCoordinates && (
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="blue"
                strokeWidth={4}
              />
            )}
            
          </MapView>
          <View style={styles.helpTextContainer}>
            <Text style={styles.helpText}>Help is on the way</Text>
            <Text style={styles.policeInfo}>
              Police Name: {userData.policeFname} {userData.policeLname}
            </Text>
            <Text style={styles.policeInfo}>
              Police Phone: {userData.policePhone}
            </Text>
            <Text style={styles.policeInfo}>
              Police Status: {userData.status}
            </Text>
            <Text style={styles.policeInfo}>
              Police Feedback: {userData.policeFeedback}
            </Text>
          </View>
        </View>
        </View>   
      ): hasPendingSOS ? (
        <View style={styles.waitingContainer}>
          {userSosLocation && ( // Add this conditional check
            <MapView
            provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: userSosLocation.latitude,
                longitude: userSosLocation.longitude,
                latitudeDelta: 0.02, // Adjust as needed
                longitudeDelta: 0.02, // Adjust as needed
              }}
              onLayout={() => setIsMapReady(true)}
              ref={mapRef}
            >
              {userSosLocation && isMapReady && (
                <Marker
                  coordinate={userSosLocation}
                >
                  <Image
                    source={require('./images/SosPIN.png')} 
                    style={{ width: 40, height: 43 }} // Adjust the size as needed
                  />
                </Marker>
              )}
              {pingingPosition && userSosLocation && isMapReady && (
                <Circle
                  center={userSosLocation}
                  radius={pingingCircleRadius}
                  fillColor="rgba(0, 128, 255, 0.2)"
                  strokeColor="rgba(0, 128, 255, 0.5)"
                />
              )}
            </MapView>
          )}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(currentUser)}
          >
            <View style={styles.cancelButtonInner}>
              <Text style={styles.cancelButtonText}>Cancel SOS</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) :(
        <>
        {isLoading ? (
          // Display loading state while submitting
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="blue" />
            <Text style={styles.loadingText}>Submitting SOS...</Text>
          </View>
        ) : (
          <>
      
      <View style={styles.mainContainer}>
          <Text style={styles.text}>
            Feeling unsafe? Tap SOS alert for immediate help in emergencies. Your safety matters!
          </Text>
          <TouchableOpacity
          style={[
            styles.sosButton,
            userInfo && userInfo.isAccountDisabled 
          ]}
          onPress={() => {
            if (userInfo && userInfo.isAccountDisabled) {
              const lastWarningTime = userInfo.lastWarningTime.toDate();
              const currentTime = new Date();
              const timeDifference = currentTime - lastWarningTime;
              const hoursLeft = Math.ceil((24 * 60 * 60 * 1000 - timeDifference) / (60 * 60 * 1000));
        
              if (hoursLeft <= 0) {
                // The user can send SOS, so open the SOS modal
                setIsModalOpen(true);
              } else {
                // Display an alert with the hours left
                Alert.alert(
                  'Account Disabled',
                  `Your account is temporarily disabled. You can send SOS in ${hoursLeft} hours.`
                );
              }
            } else {
              // Account is not disabled, open the SOS modal
              setIsModalOpen(true);
            }
          }}
        >
          <View style={styles.sosButtonInner}>
            <Text style={styles.sosButtonText}>Send SOS Alert</Text>
          </View>
        </TouchableOpacity>
      <Modal visible={isModalOpen} transparent={true} animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <TouchableOpacity onPress={() => setIsModalOpen(false)} style={styles.closeButton}>
              <Ionicons name="ios-close-outline" size={24} color="black" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleEmergencyType('Fire Accident')}>
              <Text style={styles.emergencyType}>Fire Accident</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleEmergencyType('Vehicular Accident')}>
              <Text style={styles.emergencyType}>Vehicular Accident</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleEmergencyType('Robbery')}>
              <Text style={styles.emergencyType}>Robbery</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </View>
      </>
      )}
      </>
      )}
      {(emergencyType && currentLocation && !isWaitingForPolice) ? (
            <>
              <TouchableOpacity style={styles.backButton} onPress={handleBackButton}>
                <Ionicons name="ios-arrow-back" size={24} color="black" />
              </TouchableOpacity>
              <View style={styles.mapContainer}>
                <MapView
                  provider={PROVIDER_GOOGLE}
                  key={mapKey}
                  style={styles.map}
                  initialRegion={initialRegion}
                  onLayout={() => setIsMapReady(true)}
                  ref={mapRef}
                >
                  {markerPosition && isMapReady && (
                    <Marker
                      coordinate={currentLocation}
                      draggable
                      onDragEnd={handleMarkerDragEnd}
                    />
                  )}
                  {currentLocation && isMapReady && (
                    <Circle
                      center={currentLocation}
                      radius={200}
                      fillColor="rgba(0, 128, 255, 0.2)"
                      strokeColor="rgba(0, 128, 255, 0.5)"
                    />
                  )}
                </MapView>
                <TouchableOpacity
                style={styles.submitButton}
                onPress={() => {
                  setIsLoading(true); // Set isLoading to true when the button is pressed
                  submitEmergency(); // Call the submitEmergency function
                }}
              >
                <Text style={styles.submitButtonText}>Submit</Text>
              </TouchableOpacity>
              </View>
            </>
      ) : null}
      {(emergencyType && markerPosition && isWaitingForPolice && hasPendingSOS) ? (
        <View style={styles.waitingContainer}>
          <MapView
          provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={initialRegion}
            onLayout={() => {
              console.log('Map layout is ready.');
              setIsMapLayoutReady(true)}} // Set the flag when the map layout occurs
            ref={mapRef}
          >
          
            {markerPosition && isMapReady && (
              <Marker
                coordinate={markerPosition}
                draggable
                onDragEnd={handleMarkerDragEnd}
              />
            )}
            {pingingPosition && isMapReady && (
              <Circle
                center={markerPosition}
                radius={pingingCircleRadius} // Use the state variable for the pinging circle radius
                fillColor="rgba(0, 128, 255, 0.2)" // Customize the color and opacity of the circle
                strokeColor="rgba(0, 128, 255, 0.5)" // Customize the color and opacity of the circle border
              />
            )}
          </MapView>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => handleCancel(currentUser)}
          >
            <View style={styles.cancelButtonInner}>
              <Text style={styles.cancelButtonText}>Cancel SOS</Text>
            </View>
          </TouchableOpacity>
        </View>
      ) : null}
      
      </SafeAreaView>
      );
            }

const styles = StyleSheet.create({
  ongoingContainer: {
    flex: 1, 
  },
  mainContainer: {
    flex: 1,
    justifyContent: 'center', 
    alignItems: 'center',     
    marginHorizontal: 5,
  },
 container: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 1,
  },
  text: {
    textAlign: 'center',
    marginBottom: 50,
  },
  sosButton: {
    marginBottom: 16,
  },
  sosButtonInner: {
    backgroundColor: 'red',
    height: 300,
    width: 300,
    borderRadius: 250,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'black',
  },
  sosButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
  },
  closeButton: {
    alignItems: 'flex-end',
  },
  emergencyType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  backButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 2,
  },
  mapContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  map: {
    flex: 1,
  },
  submitButton: {
    position: 'absolute',
    bottom: 20,
    left: 0, 
    right: 0, 
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignSelf: 'center', 
    marginHorizontal:10,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign:'center',
  },
  waitingContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  waitingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cancelButton: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center', // Center the button horizontally
  },
  cancelButtonInner: {
    backgroundColor: 'red',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    alignItems: 'center', // Center the contents horizontally
    justifyContent: 'center', // Center the contents vertically
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpTextContainer: {
    backgroundColor: '#08BAE1',
    padding: 16,
    marginBottom: 16,
  },
  helpText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  policeInfo: {
    fontSize: 16,
    color: 'white',
    marginBottom: 4,
  },
});

export default SOS;