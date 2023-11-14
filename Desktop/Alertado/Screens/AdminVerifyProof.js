import { View,Alert, Text,Image, ImageBackground, TouchableOpacity, Touchable,ScrollView, Modal, StyleSheet} from 'react-native'
import React, { useState, useEffect } from 'react';
import { useNavigation } from '@react-navigation/core';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getFirestore, collection, query, where, onSnapshot,doc,updateDoc } from 'firebase/firestore';
import { AntDesign } from '@expo/vector-icons'; 
import { Picker } from '@react-native-picker/picker';


const AdminVerifyProof = ({ route }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [userRef, setUserRef] = useState(null); 
  const [selectedReason, setSelectedReason] = useState('');
    const { user } = route.params;
    const navigation=useNavigation()
    const handleCheckUser = async userId => {
      const db = getFirestore();
      const userRef = doc(db, 'User', userId);
  
      await updateDoc(userRef, { status: 'Verified' });
      setModalVisible(true);
      Alert.alert('Verification Successful!', 'This user has been verified.', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
          style: 'cancel'
        }
      ], { textAlign: 'center' });
    };
    const handleDecline = async userId => {
      try {
        const db = getFirestore();
        const userRef = doc(db, 'User', userId);
    
        // Open the modal for decline reason selection
        setModalVisible(true);
    
        // Store userRef in a variable accessible in the modal
        setUserRef(userRef);
      } catch (error) {
        console.error('Error handling decline:', error);
      }
    };
    const handleModalSubmit = async () => {
      if (selectedReason) {
        await updateDoc(userRef, { status: 'Failed', declineReason: selectedReason });
  
        // Close the modal and navigate back
        setModalVisible(false);
        navigation.goBack();
      } else {
        Alert.alert('Select Reason', 'Please select a decline reason.');
      }
    };
  
  
    return (
        <ScrollView>
        <View className="bg-white m-4 flex items-center justify-center rounded-md">
        <View style={{ borderColor: 'gray'}} className="border rounded-full mt-2">
          <Image className="m-2 w-[150] h-[150] rounded-full" source={{ uri: user.selfiePicture }} />
        </View>
          <Text className="text-2xl font-bold">{user.Lname}, {user.Fname}</Text>
          <Text className="text-l">{user.role}</Text>
          <Text className="mb-2 font-bold text-l">Email: {user.email}</Text>
        </View>
        <View className="border-0.5 mx-5"></View>
          <Text className="mx-5 text-xl text-center">Proof of Identity</Text>
        <View className="border-0.5 mx-5"></View>
        <View className="flex-row items-center justify-center">
        <View className="m-4">
          <Image className="w-[120] h-[120]" source={{ uri: user.idPicture }} />
          <Text className="text-xl font-bold mx-auto">ID</Text>
        </View>
        <View>
          <Image className="w-[120] h-[120]" source={{ uri: user.selfiePicture }} />
          <Text className="text-xl font-bold mx-auto">Selfie</Text>
        </View>
        </View>
        <View className="flex-row items-center justify-center m-4">
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'green' }]}
          onPress={() => handleCheckUser(user.id)}
        >
          <Text style={styles.buttonText}>Accept</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: 'red' }]}
          onPress={() => handleDecline(user.id)}
        >
          <Text style={styles.buttonText}>Reject</Text>
        </TouchableOpacity>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <View
          style={{
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
            <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={{
          position: 'absolute',
          top:1,
          right: 5,
          marginBottom:15,
          
        }}
      >
        <Text style={{ fontWeight: 'bold', fontSize: 18,}}>X</Text>
      </TouchableOpacity>
            <Text style={{ marginTop:10, fontWeight:'bold'}}>Select Reason for Declining</Text>
            <Picker
              selectedValue={selectedReason}
              onValueChange={(itemValue) => setSelectedReason(itemValue)}
              style={{ width: 200 }}
            >
              <Picker.Item label="Select a reason" value="" />
              <Picker.Item label="The ID card is blurry" value="The ID Card details are not clear or blurry. Please try again." />
              <Picker.Item label="The selfie picture is blurry" value="The selfie picture is blurry. Please try again." />
              <Picker.Item label="The name and ID doesn't match" value="The name registered doesn't match with the name in the ID. Please try again." />
              <Picker.Item label="ID card and Selfie doesn't match" value="The ID card picture and the selfie picture do not match" />
            </Picker>
            <View style={{ alignItems: 'center'}}>
            <TouchableOpacity
            onPress={handleModalSubmit}
            style={{
              marginTop: 20,
              backgroundColor: '#186EEE',
              width: 75,
              height: 40,
              borderRadius: 4,
              alignItems: 'center',
              justifyContent: 'center', // Center the button horizontally
            }}
          >
              <Text style={{textAlign:'center', fontWeight: 'bold', color:'white'}}>Submit</Text>
            </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
        </View>

        </ScrollView>
    );
};
const styles = StyleSheet.create({
  actionButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    paddingVertical: 15,
    marginHorizontal: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 18,
  },
});
export default AdminVerifyProof;