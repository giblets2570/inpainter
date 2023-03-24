import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import Canvas from 'react-native-canvas';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';


const { width } = Dimensions.get("window")


export default function AddMaskScreen({ navigation, route }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [maskUri, setMaskUri] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.canvas.width = width;
            context.canvas.height = width;
        }
    }, [canvasRef]);


    useEffect(() => {
        if (maskUri !== null) {
            navigation.push('GetResultScreen', { maskUri: maskUri, imageUri: route.params.imageUri })
        }
    }, [maskUri])


    // Handle starting a new drawing path
    const handleStartDrawing = ({ nativeEvent }) => {
        const ctx = canvasRef.current.getContext('2d');
        const { locationX, locationY } = nativeEvent;
        ctx.beginPath();
        ctx.moveTo(locationX, locationY);
        setIsDrawing(true);
    };

    // Handle drawing on the canvas
    const handleDraw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const ctx = canvasRef.current.getContext('2d');
        const { locationX, locationY } = nativeEvent;
        ctx.lineTo(locationX, locationY);
        ctx.stroke();
    };

    // Handle finishing the current drawing path
    const handleFinishDrawing = () => {
        console.log('handleFinishDrawing')
        setIsDrawing(false);
    };

    // Handle clearing the canvas
    const handleClearCanvas = () => {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    };

    const maskFilename = (f) => {
        let [root, ext] = f.split('.')
        let ff = root.split('/').reverse()[0]
        ff = ff + uuid.v4() + '_mask'
        return [ff, ext].join('.')
    }

    const handleSaveImage = async () => {
        const canvas = canvasRef.current;
        let blobBase64 = await canvas.toDataURL();
        blobBase64 = blobBase64.split(',')[1]
        const fileName = maskFilename(route.params.imageUri); // Replace with your desired file name
        const fileUri = `${FileSystem.documentDirectory}/${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, blobBase64, {
            encoding: FileSystem.EncodingType.Base64,
        });
        setMaskUri(fileUri)
    };

    return (
        <View style={styles.container}>
            <Image
                style={styles.image}
                source={{ uri: route.params.imageUri }} // Replace with your image source
                resizeMode="contain"
            />


            <View
                style={styles.canvasContainer}
                onTouchStart={handleStartDrawing}
                onTouchMove={handleDraw}
                onTouchEnd={handleFinishDrawing}
            >


                <Canvas
                    ref={canvasRef}
                    style={styles.canvas}
                    onLayout
                />
            </View>
            <View style={styles.buttonContainer}>
                <TouchableOpacity onPress={handleClearCanvas} style={styles.button} >
                    <Text style={styles.buttonText}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleSaveImage} style={styles.button} >
                    <Text style={styles.buttonText}>Save</Text>
                </TouchableOpacity>
            </View>
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width,
        height: width
    },
    canvas: {
        width: width,
        height: width,
        backgroundColor: 'transparent',
    },
    canvasContainer: {
        position: 'absolute',
        right: 0,
        flex: 1,
        width: width,
        height: width,
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'absolute',
        bottom: 20,
        width: width
    },
    button: {
        backgroundColor: '#4F84C4',
        borderRadius: 20,
        padding: 10,
        marginHorizontal: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
});
