import React from 'react';
import { Button, Image, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput, Alert } from 'react-native';
import { useState } from 'react';

const FirstScreen = ({ navigation }) => {

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isModalVisibleForUpload, setIsModalVisibleForUpload] = useState(false);
    const [password, setPassword] = useState('');

    const handleRemoveData = () => {
        setIsModalVisible(true);
    }

    const handleGoToUpload = () => {
        setIsModalVisibleForUpload(true);
    }

    

    const handleCheckPassword = () => {
        // Replace '12345' with your actual correct password
        if (password === '12345') {
            navigation.navigate('RemoveData');
            setIsModalVisible(false);
            setPassword('')
        } else {
            Alert.alert('Error', 'Incorrect password. Please try again.');
        }
    }

    const handleCheckPasswordForUpload = () => {
        // Replace '12345' with your actual correct password
        if (password === '12345') {
            // navigation.navigate('RemoveData');
            navigation.navigate('UploadDatabase')
            setIsModalVisibleForUpload(false);
            setPassword('')

        } else {
            Alert.alert('Error', 'Incorrect password. Please try again.');
        }
    }

    const handleCloseModal = () => {
        setIsModalVisible(false);
        setPassword('')
    }

    const handleCloseModalForUpload = () => {
        setIsModalVisibleForUpload(false);
        setPassword('')
    }

    // const handleRemoveData = () => {
    //     navigation.navigate('RemoveData')
    // }

    return (

        <View style={styles.mainContainer}>
            <View style={styles.backgroundCurve} />

            <Modal
                visible={isModalVisible}
                animationType="slide"
                transparent={true}
            >

                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                        <TextInput
                            placeholder="Enter password"
                            secureTextEntry
                            keyboardType="numeric"
                            value={password}
                            onChangeText={setPassword}
                            style={{ borderBottomWidth: 1, marginBottom: 20 }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button title="Submit" onPress={handleCheckPassword} />
                            <Button title="Cancel" onPress={handleCloseModal} color="gray" />
                        </View>
                    </View>
                </View>
            </Modal>

            <Modal
                visible={isModalVisibleForUpload}
                animationType="slide"
                transparent={true}
            >
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
                    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
                        <TextInput
                            placeholder="Enter password"
                            secureTextEntry
                            keyboardType="numeric"
                            value={password}
                            onChangeText={setPassword}
                            style={{ borderBottomWidth: 1, marginBottom: 20 }}
                        />
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <Button title="Submit" onPress={handleCheckPasswordForUpload} />
                            <Button title="Cancel" onPress={handleCloseModalForUpload} color="gray" />
                        </View>
                    </View>
                </View>
            </Modal>
            <View style={styles.iconContainer}>
                <View style={styles.rowContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('CustomerInformations')}>
                        <View style={[styles.boxStyle, styles.elevation]}>
                            <Image style={styles.boxImageStyle} source={require('../components/image/customerInfo.png')} />
                            <Text style={styles.boxTextStyle}>Customer Information</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('AddProducts')}>
                        <View style={[styles.boxStyle, styles.elevation, { marginLeft: 25 }]}>
                            <Image style={styles.boxImageStyle} source={require('../components/image/cart.png')} />
                            <Text style={styles.boxTextStyle}>Add Products</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.rowContainer}>
                    <TouchableOpacity onPress={() => navigation.navigate('PaymentInformation')}>
                        <View style={[styles.boxStyle, styles.elevation]}>
                            <Image style={styles.boxImageStyle} source={require('../components/image/paymentInfo.png')} />
                            <Text style={styles.boxTextStyle}>Payment Information</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={handleRemoveData}>
                        <View style={[styles.boxStyle, styles.elevation, { marginLeft: 25 }]}>
                            <Image style={styles.boxImageStyle} source={require('../components/image/rocket.png')} />
                            <Text style={styles.boxTextStyle}>Remove Data</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.rowContainer}>
                    {/* <TouchableOpacity onPress={() => navigation.navigate('UploadDatabase')}> */}
                    <TouchableOpacity onPress={handleGoToUpload}>
                        <View style={[styles.boxStyle, styles.elevation]}>
                            <Image style={styles.boxImageStyle} source={require('../components/image/upload.png')} />
                            <Text style={styles.boxTextStyle}>Upload Database</Text>
                        </View>
                    </TouchableOpacity>

                    {/* <TouchableOpacity onPress={handleRemoveData}>
                        <View style={[styles.boxStyle, styles.elevation, { marginLeft: 25 }]}>
                            <Image style={styles.boxImageStyle} source={require('../components/image/rocket.png')} />
                            <Text style={styles.boxTextStyle}>Remove Data</Text>
                        </View>
                    </TouchableOpacity> */}
                </View>
            </View>
        </View>
    );
}

export default FirstScreen;

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
        backgroundColor: 'white',
    },
    backgroundCurve: {
        position: 'absolute',
        top: '-10%',
        right: 0,
        width: '100%',
        height: '70%',
        backgroundColor: '#88da09',
        borderBottomLeftRadius: 10,
        borderBottomRightRadius: 200,
        borderTopRightRadius: 10,
        borderTopLeftRadius: 10,
        transform: [{ scaleY: 0.9 }],
    },
    iconContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 25,
    },
    boxStyle: {
        height: 150,
        width: 150,
        backgroundColor: 'white',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    elevation: {
        elevation: 10,
    },
    boxImageStyle: {
        height: 70,
        width: 70,
        alignSelf: 'center',
        marginTop: 15,
        // tintColor:'green'
    },
    boxTextStyle: {
        fontSize: 15,
        textAlign: 'center',
        margin: 5,
        color: 'black',
    },
});
