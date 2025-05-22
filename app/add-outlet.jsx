import { useNavigation } from '@react-navigation/native';
import * as Location from 'expo-location';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { db } from './firebase/config';

const AddOutlet = () => {
  const navigation = useNavigation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [storeName, setStoreName] = useState('');
  const [street, setStreet] = useState('');
  const [locality, setLocality] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (!firstName || firstName.trim().length < 3) {
      Alert.alert('Error', 'First name must be at least 3 characters.');
      return false;
    }

    if (!phoneNumber || !/^\+91[6-9]\d{9}$/.test(phoneNumber)) {
      Alert.alert('Error', 'Enter a valid Indian phone number with +91 prefix.');
      return false;
    }

    if (!storeName) {
      Alert.alert('Error', 'Store name is required.');
      return false;
    }

    if (pincode && pincode.length > 6) {
      Alert.alert('Error', 'Pincode cannot be more than 6 digits.');
      return false;
    }

    if (!location) {
      Alert.alert('Error', 'GPS location is required.');
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const fullAddress = `${street || ''}, ${locality || ''}, ${landmark || ''}, ${pincode || ''}`;

    const newOutlet = {
      propName: `${firstName} ${lastName || ''}`.trim(),
      phoneNumber,
      storeName,
      address: fullAddress,
      location,
      createdAt: serverTimestamp(),
    };

    try {
      setLoading(true);
      await addDoc(collection(db, 'outlets'), newOutlet);
      Alert.alert('Success', 'Outlet added successfully.');
      navigation.goBack();
    } catch (error) {
      console.error('Error adding outlet:', error);
      Alert.alert('Error', 'Failed to add outlet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Allow location permission to use this feature.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Failed to get location.');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold mb-6">Add Outlet</Text>

        <TextInput
          placeholder="Store Name"
          value={storeName}
          onChangeText={setStoreName}
          className="border border-gray-300 p-4 mb-4 rounded placeholder:text-black"
        />

        <View className="flex-row gap-2 mb-4">
          <TextInput
            placeholder="First Name"
            value={firstName}
            onChangeText={setFirstName}
            className="flex-1 border border-gray-300 p-4 rounded placeholder:text-black"
          />
          <TextInput
            placeholder="Last Name (optional)"
            value={lastName}
            onChangeText={setLastName}
            className="flex-1 border border-gray-300 p-4 rounded placeholder:text-black"
          />
        </View>

        <TextInput
          placeholder="Phone Number (+91)"
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          className="border border-gray-300 p-4 mb-4 rounded placeholder:text-black"
          keyboardType="phone-pad"
        />

        <TextInput
          placeholder="Street (optional)"
          value={street}
          onChangeText={setStreet}
          className="border border-gray-300 p-4 mb-4 rounded placeholder:text-black"
        />

        <TextInput
          placeholder="Locality / City (optional)"
          value={locality}
          onChangeText={setLocality}
          className="border border-gray-300 p-4 mb-4 rounded placeholder:text-black"
        />

        <TextInput
          placeholder="Landmark (optional)"
          value={landmark}
          onChangeText={setLandmark}
          className="border border-gray-300 p-4 mb-4 rounded placeholder:text-black"
        />

        <TextInput
          placeholder="Pincode (optional, max 6 digits)"
          value={pincode}
          onChangeText={setPincode}
          className="border border-gray-300 p-4 mb-6 rounded placeholder:text-black"
          keyboardType="numeric"
          maxLength={6}
        />

        <Pressable
          className="bg-gray-700 p-4 rounded mb-4"
          onPress={getLocation}
        >
          <Text className="text-white text-center">
            {location ? 'Location Added ✅' : 'Add GPS Location (Required)'}
          </Text>
        </Pressable>

        <Pressable
          className="bg-blue-600 p-4 rounded"
          onPress={handleSubmit}
        >
          <Text className="text-white text-center text-lg">
            {loading ? 'Saving...' : 'Save Outlet'}
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddOutlet;
