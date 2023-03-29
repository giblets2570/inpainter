import React from 'react';
import { StyleSheet, View, TouchableOpacity, Text } from 'react-native';

const BottomButtons = ({ onPressFirst, onPressSecond, text1, text2 }) => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={{ ...styles.button, backgroundColor: '#DC4731' }} onPress={onPressFirst}>
                <Text style={styles.buttonText}>{text1}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ ...styles.button, backgroundColor: '#5CD85A' }} onPress={onPressSecond}>
                <Text style={styles.buttonText}>{text2}</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        borderTopColor: '#ddd',
    },
    button: {
        paddingVertical: 20,
        // paddingHorizontal: 20,
        backgroundColor: '#007aff',
        width: '50%'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',

    },
});

export default BottomButtons;
