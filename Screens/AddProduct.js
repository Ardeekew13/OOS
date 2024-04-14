import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, Image, ScrollView, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db, storage } from './firebaseConfig'; // Import your Firebase configuration
import { Picker } from '@react-native-picker/picker';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';


export default function AddProduct() {
  const [productName, setProductName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Fish');
  const [image, setImage] = useState(null);
  const [qty, setQty] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSelectImage = async () => {
    setLoading(true); // Set loading state to true before selecting image
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Please grant permission to access the photo library.');
        setLoading(false); // Set loading state to false if permission is denied
        return;
      }
    
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });
    
      if (!result.cancelled && result.assets.length > 0 && result.assets[0].uri) {
        processImageResult(result); // Call the processing function with the result
      } else {
        console.error("Error selecting image: URI is null or undefined.");
        Alert.alert('Error', 'Failed to select image. Please try again later.');
        setLoading(false); // Set loading state to false after error
      }
    } catch (error) {
      console.error('Error selecting image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again later.');
      setLoading(false); // Set loading state to false after error
    }
  };
  
  const processImageResult = (result) => {
    const uri = result.assets[0].uri; // Get the URI from the assets array
    // Handle the image processing here
    // This is where you would handle the image URI and initiate the upload task
  
    // Update the image state with the new URI
    setImage(uri);
    setLoading(false); // Set loading state to false after processing
  };
  const handleImageUpload = async (imageURI, productName) => {
    try {
      const storage = getStorage();
      const response = await fetch(imageURI);
      const blob = await response.blob();
      const storageRef = ref(storage, `images/${productName}`);
      const uploadTask = uploadBytesResumable(storageRef, blob);
    
      await new Promise((resolve, reject) => {
        uploadTask.on('state_changed',
          (snapshot) => {
            // Handle progress, if needed
          },
          (error) => reject(error), // Reject if there's an error during upload
          resolve // Resolve when upload is completed
        );
      });
    
      return getDownloadURL(uploadTask.snapshot.ref);
    } catch (error) {
      throw new Error('Failed to upload image to Firebase Storage.');
    }
  };
  
  const handleAddProduct = async () => {
    try {
      // Check if any of the required fields are empty
      if (!productName || !price || !description || !category || !image || !qty) {
        Alert.alert('Error', 'Please fill out all the fields.');
        return;
      }
  
      // Check if product_Name contains any numbers
      if (/\d/.test(productName)) {
        Alert.alert('Error', 'Product name cannot contain numbers.');
        return;
      }

      setLoading(true); // Set loading state to true before adding product
  
      // Upload image to Firebase Storage
      const imageUrl = await handleImageUpload(image, productName);
  
      // Add product data to Firestore
      await addDoc(collection(db, 'Products'), {
        product_Name: productName,
        Price: parseFloat(price),
        Description: description,
        Category: category,
        image: imageUrl,
        added_at: serverTimestamp(),
        qty: parseInt(qty),
        Availability: parseInt(qty) !== 0,
        Sales: 0,
      });
  
      Alert.alert('Success', 'Product added successfully.');
      // Clear input fields after adding product
      setProductName('');
      setPrice('');
      setDescription('');
      setCategory('');
      setImage(null);
      setQty('');
    } catch (error) {
      console.error('Error adding product:', error);
      Alert.alert('Error', 'Failed to add product. Please try again later.');
    } finally {
      setLoading(false); // Set loading state to false after adding product
    }
  };
  
  return (
    <ScrollView>
    <View style={{ backgroundColor: '#24255F', height: 112 }} />
    <View style={{ backgroundColor: '#ffffff', width: 288, height: 48, justifyContent: 'center', alignItems: 'center' }} className="mx-auto bottom-5">
      <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', color: '#24255F' }}>Add Product</Text>
    </View>
    <View style={{padding:10}}>
    <View style={{alignItems:'center', justifyContent:'center', marginHorizontal: 'auto' }}>
    <Image source={{ uri: image }} style={{ width: 200, height: 200, marginBottom:20}} />
    </View>
      <Button title="Select Image" onPress={handleSelectImage} />
    
      <Text>Product Name:</Text>
      <TextInput
        value={productName}
        onChangeText={setProductName}
        placeholder="Enter product name"
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10, padding: 5 }}
      />
      <Text>Price:</Text>
      <TextInput
        value={price}
        onChangeText={setPrice}
        placeholder="Enter price"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10, padding: 5 }}
      />
      <Text>Description:</Text>
      <TextInput
        value={description}
        onChangeText={setDescription}
        placeholder="Enter description"
        multiline
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10, padding: 5 }}
      />
      <Text>Category:</Text>
      <Picker
        selectedValue={category}
        onValueChange={(itemValue, itemIndex) =>
          setCategory(itemValue)
        }>
        <Picker.Item label="Fish" value="Fish" />
        <Picker.Item label="Shellfish" value="Shellfish" />
        <Picker.Item label="Squid & Octopus" value="Squid & Octopus" />
        <Picker.Item label="Seaweeds" value="Seaweeds" />
      </Picker>
      <Text>Quantity:</Text>
      <TextInput
        value={qty}
        onChangeText={setQty}
        placeholder="Enter quantity"
        keyboardType="numeric"
        style={{ borderWidth: 1, borderColor: 'gray', borderRadius: 5, marginBottom: 10, padding: 5 }}
      />
     
      <Button title="Add Product" onPress={handleAddProduct} />
      
      {loading && <ActivityIndicator size="large" color="#0000ff" />}
    </View>
    </ScrollView>
  );
}
