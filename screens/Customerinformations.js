import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import externalStyle from '../components/externalStyle';

const databaseName = 'Pranch.db';
const database = SQLite.openDatabase({ name: databaseName, location: 'default' });

const Customerinformations = () => {
  const [customerName, setCustomerName] = useState('');
  const [nic, setNic] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [pickupDate, setPickupDate] = useState(new Date());
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [productQuantities, setProductQuantities] = useState({});
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState(new Set());

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = () => {
    database.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM products',
        [],
        (_, { rows }) => {
          const productsFromDB = rows.raw();
          setProducts(productsFromDB);
          initializeQuantities(productsFromDB);
        },
        (_, error) => console.error('Error fetching products', error)
      );
    });
  };

  const initializeQuantities = (products) => {
    const initialQuantities = {};
    products.forEach((product) => {
      initialQuantities[product.product_id] = 0;
    });
    setProductQuantities(initialQuantities);
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const hours = selectedDate.getHours();
      const minutes = selectedDate.getMinutes();
      const seconds = selectedDate.getSeconds();

      const updatedPickupDate = new Date(selectedDate);
      updatedPickupDate.setHours(hours, minutes, seconds);

      setPickupDate(updatedPickupDate);
    }
  };

  const addCustomer = () => {
    if (!customerName.trim()) {
      alert('Name field is required.');
      return;
    }
    if (selectedProducts.length === 0) {
      alert('At least one product must be selected.');
      return;
    }
    const invalidQuantities = selectedProducts.filter((product) => {
      const quantity = productQuantities[product.product_id];
      return isNaN(quantity) || +quantity <= 0;
    });
    if (invalidQuantities.length > 0) {
      alert('Product quantity must be a numeric value greater than 0.');
      return;
    }
    database.transaction(
      (tx) => {
        tx.executeSql(
          'INSERT INTO customers (customer_name, customer_nic, customer_phone, customer_address, pickup_date) VALUES (?, ?, ?, ?, ?)',
          [
            customerName,
            nic,
            phoneNumber,
            address,
            new Date(pickupDate.getTime() - (pickupDate.getTimezoneOffset() * 60000)).toISOString(),
          ],
          (_, { insertId }) => {
            selectedProducts.forEach((product) => {
              const quantity = productQuantities[product.product_id];
              for (let i = 0; i < quantity; i++) {
                tx.executeSql(
                  'INSERT INTO rentals (customer_id, product_id, quantity, rental_date) VALUES (?, ?, ?, ?)',
                  [
                    insertId,
                    product.product_id,
                    1,
                    new Date(pickupDate.getTime() - (pickupDate.getTimezoneOffset() * 60000)).toISOString(),
                  ],
                  (_, result) => {
                    if (result.insertId === undefined) {
                      console.error('Error adding product for customer:', customerName, 'Error:', result);
                    }
                  }
                );
              }
            });
          },
          (_, error) => console.error('Error adding customer:', customerName, 'Error:', error)
        );
      },
      (error) => console.error('Transaction error:', error),
      () => {
        alert('Customer Info Added');
        setCustomerName('');
        setNic('');
        setPhoneNumber('');
        setAddress('');
        const currentDate = new Date();
        currentDate.setHours(14);
        currentDate.setMinutes(16);
        setPickupDate(currentDate);
        setSelectedProducts([]);
        initializeQuantities(products);
      }
    );
  };

  const filteredProducts = products.filter(product => product.product_name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <ScrollView>
      <View style={{ margin: 10 }}>
        <Text style={externalStyle.textSize}>Name:</Text>
        <TextInput style={styles.textBoxStyle} value={customerName} onChangeText={(text) => setCustomerName(text)} />

        <Text style={externalStyle.textSize}>NIC or Reference:</Text>
        <TextInput style={styles.textBoxStyle} value={nic} onChangeText={(text) => setNic(text)} />

        <Text style={externalStyle.textSize}>Phone:</Text>
        <TextInput style={styles.textBoxStyle} value={phoneNumber} onChangeText={(text) => setPhoneNumber(text)} keyboardType="numeric" />

        <Text style={externalStyle.textSize}>Address:</Text>
        <TextInput style={styles.textBoxStyle} value={address} onChangeText={(text) => setAddress(text)} />

        <Text style={externalStyle.textSize}>Pickup Date:</Text>
        <Button color={'#88da09'} title="Select Date" onPress={showDatePickerModal} />
        {showDatePicker && (
          <DateTimePicker
            value={pickupDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}
        <Text style={externalStyle.textSize}>{pickupDate.toLocaleString()}</Text>

        <Text style={externalStyle.textSize}>Product:</Text>
        <TextInput
          style={styles.textBoxStyle}
          placeholder="Search Products..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        <Picker
          style={{ width: 200 }}
          selectedValue={null}
          onValueChange={(itemValue) => {
            if (itemValue) {
              if (selectedProductIds.has(itemValue)) {
                alert('This product is already selected.');
                return;
              }
              const selectedProduct = products.find((p) => p.product_id === itemValue);
              setSelectedProducts((prevProducts) => [...prevProducts, selectedProduct]);
              setSelectedProductIds((prevIds) => new Set(prevIds).add(itemValue));
            }
          }}
        >
          <Picker.Item label="Select Product" value={null} />
          {filteredProducts.map((product) => (
            <Picker.Item key={product.product_id} label={product.product_name} value={product.product_id} />
          ))}
        </Picker>


        <Text style={externalStyle.textSize}>Selected Products:</Text>
        {selectedProducts.map((product) => (
          <View key={product.product_id}>
            <Text style={externalStyle.textSize}>{product.product_name} - Quantity:</Text>
            <TextInput
              style={styles.textBoxStyle}
              placeholder="Enter Quantity"
              value={productQuantities[product.product_id]?.toString() || ''}
              onChangeText={(text) => {
                const updatedQuantities = { ...productQuantities };
                updatedQuantities[product.product_id] = parseInt(text, 10) || 0;
                setProductQuantities(updatedQuantities);
              }}
              keyboardType="numeric"
            />
            <Button
              color={'red'}
              title="Cut"
              onPress={() => {
                const updatedQuantities = { ...productQuantities };
                updatedQuantities[product.product_id] = updatedQuantities[product.product_id] - 1;
                if (updatedQuantities[product.product_id] <= 0) {
                  const remainingProducts = selectedProducts.filter(p => p.product_id !== product.product_id);
                  setSelectedProducts(remainingProducts);
                  delete updatedQuantities[product.product_id];
                  setSelectedProductIds((prevIds) => {
                    const newIds = new Set(prevIds);
                    newIds.delete(product.product_id);
                    return newIds;
                  });
                }
                setProductQuantities(updatedQuantities);
              }}
            />

          </View>
        ))}
        <Button color={'#88da09'} title="Add Customer" onPress={addCustomer} />
        <View style={{ marginBottom:50 }}></View>
      </View>
    </ScrollView>
  );
};

export default Customerinformations;

const styles = StyleSheet.create({
  textBoxStyle: {
    borderColor: 'gray',
    borderWidth: 2,
    height: 40,
    width: '90%',
    marginBottom: 10,
  },
 
});
