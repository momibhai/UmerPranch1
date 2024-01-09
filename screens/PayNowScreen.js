import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Modal, ScrollView } from 'react-native';
import SQLite from 'react-native-sqlite-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import externalStyle from '../components/externalStyle';

const PayNowScreen = ({ route, navigation }) => {
  const { rentalId, customer } = route.params;
  // console.log(customer)
  const [returnDate, setReturnDate] = useState(new Date());
  const [totalAmount, setTotalAmount] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [productDetails, setProductDetails] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [days, setDays] = useState(1);
  const [returnQuantity, setReturnQuantity] = useState(1);
  const [rentalRecords, setRentalRecords] = useState([]);
  const [myRentalId, setMyRentalId] = useState('')
  const [RentAmount, setRentAmount] = useState('')

  useEffect(() => {
    fetchProductDetails();
    fetchRentalRecords();
  }, []);

  const databaseName = 'Pranch.db';
  const db = SQLite.openDatabase({ name: databaseName, location: 'default' });

  const fetchProductDetails = () => {
    const query = `
      SELECT *
      FROM products
      WHERE product_id = ?
    `;

    db.transaction((tx) => {
      tx.executeSql(
        query,
        [customer.product_id],
        (_, result) => {
          const productData = result.rows.item(0);
          setProductDetails(productData || {});
        },
        (_, error) => console.error('Error fetching product details', error)
      );
    });
  };

  const fetchRentalRecords = () => {
    const query = `
      SELECT *
      FROM rentals
      WHERE customer_id = ?
    `;

    db.transaction((tx) => {
      tx.executeSql(
        query,
        [customer.customer_id],
        (_, result) => {
          const records = [];
          for (let i = 0; i < result.rows.length; i++) {
            records.push(result.rows.item(i));
          }
          setRentalRecords(records);
        },
        (_, error) => console.error('Error fetching rental records', error)
      );
    });
  };

  const handleReturnDatePress = () => {
    setShowDatePicker(true);
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setReturnDate(selectedDate);
      calculateDays(selectedDate, customer.rental_date);
      setModalVisible(true);
    }
  };

  const calculateDays = (endDate, startDate) => {
    const oneDay = 24 * 60 * 60 * 1000;
    const end = new Date(endDate).setHours(0, 0, 0, 0);
    const start = new Date(startDate).setHours(0, 0, 0, 0);
    const daysDifference = Math.floor((end - start) / oneDay);
    const calculatedDays = daysDifference < 0 ? 1 : daysDifference + 1;
    setDays(calculatedDays);
    calculateTotalAmount(calculatedDays, parseFloat(totalAmount) || 0);
  };

  const calculateTotalAmount = (calculatedDays, discountValue) => {
    if (calculatedDays && productDetails.product_price && returnQuantity) {
      const subtotal = productDetails.product_price * returnQuantity * calculatedDays;
      const discountedTotal = Math.max(subtotal - discountValue, 0);
      setTotalAmount(discountedTotal.toString());
    }
  };

  const handleDiscountChange = (text) => {
    const discountValue = parseFloat(text) || 0;
    calculateTotalAmount(days, discountValue);
  };

  useEffect(() => {
    calculateTotalAmount(days, parseFloat(totalAmount) || 0);
  }, [returnDate, returnQuantity]);

  const handlePayNow = () => {
    const productId = customer.products[0].product_id;

    if (returnDate === '' || isNaN(returnQuantity)) {
      alert('Please fill the fields with a valid return date and return quantity');
      return;
    }

    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'Asia/Karachi',
    };

    const formattedDate = returnDate.toLocaleString('en-US', options);

    if(totalAmount === '' && myRentalId === ''){
      return alert('Please Fill The Fields')
    }

    if(totalAmount !== '' && myRentalId === ''){
      return alert('Please Fill Rent ID Fields')
    }

    // Check if totalAmount has a value
    if (totalAmount !== '') {
      // Update return date with payment for multiple products
      const updatePaidQuery = `
        UPDATE rentals
        SET return_date = ?,
            rental_days = ?,
            total_amount = ?,
            paid_status = ?
        WHERE customer_id = ? 
          AND paid_status IS NULL
        AND ROWID IN (
          SELECT ROWID
          FROM rentals
          WHERE customer_id = ? 
            AND paid_status IS NULL
            AND rental_id = ?
          ORDER BY rental_date
        );
      `;
      const updatePaidParams = [
        formattedDate,
        days.toString(),
        totalAmount || null,
        totalAmount !== null ? 1 : null,
        customer.customer_id,
        customer.customer_id,
        myRentalId,
      ];

      db.transaction((tx) => {
        tx.executeSql(updatePaidQuery, updatePaidParams, (_, result) => {
          if (result.error) {
            console.error('Update Paid Error:', result.error);
          } else {
            alert('Payment successful');
            setModalVisible(false);
            fetchRentalRecords()
          }
        });
      });
    } else {
      // without payment
      let updateReturnQuery = `
  UPDATE rentals
  SET return_date = ?,
      rental_days = ?,
      total_rent = COALESCE(?, total_rent)  -- Use COALESCE to use existing value if parameter is null
  WHERE customer_id = ?
      AND return_date IS NULL
      AND paid_status IS NULL
      AND ROWID IN (
          SELECT ROWID
          FROM rentals
          WHERE customer_id = ?
              AND paid_status IS NULL
              AND rental_id = ?
          ORDER BY rental_date
      );      
`;

let updateReturnParams = [
  formattedDate,
  days.toString(),
  RentAmount.length >= 1 ? RentAmount.toString() : null, // Use COALESCE in the query to handle this
  customer.customer_id,
  customer.customer_id,
  myRentalId,
];

// Log your query and parameters for debugging
// console.log('====================================');
// console.log(updateReturnQuery);
// console.log('====================================');
// console.log(updateReturnParams);

db.transaction((tx) => {
  tx.executeSql(updateReturnQuery, updateReturnParams, (_, result) => {
    if (result.error) {
      console.error('Update Return Error:', result.error);
      alert('Failed to update return details.');
    } else {
      alert('Product returned. Customer has not paid yet.');
      setModalVisible(false);
      fetchRentalRecords()
    }
  });
});

    }
  };




  const formatDateTime = (dateTimeString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'Asia/Karachi',
    };

    const formattedDate = new Date(dateTimeString).toLocaleString('en-US', options);
    return formattedDate;
  };

  const isValidDate = (dateString) => {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  };

  const formatDateTim = (dateTimeString) => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZone: 'UTC',
    };

    return isValidDate(dateTimeString)
      ? new Date(dateTimeString).toLocaleString('en-US', options)
      : 'Invalid Date';
  };

  const getProductName = (productId) => {
    const product = customer.products.find((product) => product.product_id === productId);
    return product ? product.product_name : 'Product not found';
  };


  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Customer Information</Text>
      <View style={styles.infoContainer}>
        <Text style={externalStyle.textSize}>Customer Name: {customer.customer_name}</Text>
        <Text style={externalStyle.textSize}>Customer NIC: {customer.customer_nic}</Text>
        <Text style={externalStyle.textSize}>Customer Phone: {customer.customer_phone}</Text>
        <Text style={externalStyle.textSize}>Customer Address: {customer.customer_address}</Text>
      </View>

      <Text style={styles.title}>Product Information</Text>
      <View style={styles.infoContainer}>
        {customer.products.map((product, index) => (
          <View key={index}>
            <Text style={externalStyle.textSize}>Product Name: {product.product_name}</Text>
            <Text style={externalStyle.textSize}>Product Price: {product.product_price}</Text>
            <Text style={externalStyle.textSize}>Quantity: {product.quantity}</Text>
            <Text style={externalStyle.textSize}>--------------------</Text>
          </View>
        ))}
      </View>


      <Text style={styles.title}>Rental Information</Text>
      <View style={styles.infoContainer}>
        <Text style={externalStyle.textSize}>Start Date: {formatDateTim(customer.rental_date)}</Text>
        {customer.return_date && <Text style={externalStyle.textSize}>Return Date : {customer.return_date}</Text>}
        {customer.totalPrice && <Text style={externalStyle.textSize}>One Day Total Price: {customer.totalPrice}</Text>}
      </View>

      <Text style={styles.title}>Return Details</Text>
      <View style={styles.infoContainer}>
        <Text style={externalStyle.textSize}>Return Date: </Text>
        <TextInput style={styles.input} value={returnDate && formatDateTime(returnDate)} />
        {/* <Text style={externalStyle.textSize}>Return Quantity:</Text>
        <TextInput
          style={styles.input}
          value={returnQuantity.toString()}
          onChangeText={(text) => {
            setReturnQuantity(parseInt(text) || 1);
            calculateTotalAmount(days, parseFloat(totalAmount) || 0);
          }}
          keyboardType="numeric"
        /> */}

        <Button color={'#88da09'} title="Select Date" onPress={handleReturnDatePress} />
        {showDatePicker && (
          <DateTimePicker
            value={returnDate}
            mode="date"
            is24Hour={true}
            display="default"
            onChange={handleDateChange}
          />
        )}

        <Text style={externalStyle.textSize}>Total Amount:</Text>
        <TextInput
          style={styles.input}
          value={totalAmount}
          onChangeText={(text) => setTotalAmount(text)}
          keyboardType="numeric"
          placeholder='Enter total amount'
        />
        <TextInput style={styles.input} keyboardType="numeric" placeholder='Please Enter Rental Id' value={myRentalId} onChangeText={(txt) => setMyRentalId(txt)} />
        <TextInput style={styles.input} keyboardType="numeric" placeholder='Please Enter Rent Amount' value={RentAmount} onChangeText={(txt) => setRentAmount(txt)} />
      </View>

      <Button color={'#88da09'} title="Pay Now" onPress={handlePayNow} />

      <Text style={styles.title}>Rental Records</Text>
      <View>
      {rentalRecords.map((record) => (
        <View key={record.rental_id}>
          <Text style={externalStyle.textSize}>Rental ID: {record.rental_id}</Text>
           {record.total_rent ? <Text style={externalStyle.textSize}>Total Rent: {record.total_rent}</Text>:null} 
           {record.rental_days ? <Text style={externalStyle.textSize}>Days: {record.rental_days}</Text>:null} 
          <Text style={externalStyle.textSize}>Product Name: {getProductName(record.product_id)}</Text>
          <Text style={externalStyle.textSize}>Return Date: {record.return_date || 'Not returned yet'}</Text>
          <Text style={externalStyle.textSize}>Total Amount: {record.total_amount || 'Not calculated'}</Text>
          <Text style={externalStyle.textSize}>Paid Status: {record.paid_status === 1 ? 'Paid' : 'Not Paid'}</Text>
          <Text >--------------------</Text>
        </View>
      ))}
      <View style={{ marginTop:70 }}></View>
      </View>


      <Modal animationType="slide" transparent={true} visible={modalVisible}>
        <View style={styles.modalContainer}>
          <Text style={externalStyle.textSize}>Days: {days}</Text>
          <Text style={externalStyle.textSize}>Total Amount: {totalAmount}</Text>
          <Button title="Close" onPress={() => setModalVisible(false)} />
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 5,
  },
  infoContainer: {
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginVertical: 5,
    paddingHorizontal: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
  },
});

export default PayNowScreen;
