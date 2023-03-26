import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TextInput, KeyboardAvoidingView, Alert } from 'react-native';
import Canvas from 'react-native-canvas';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import BottomButtons from './BottomButtons';

const { width, height } = Dimensions.get("window")


export default function AddMaskScreen({ navigation, route }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [maskUri, setMaskUri] = useState(null);
    const [prompt, setPrompt] = useState('')

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
            navigation.push('Result', { maskUri: maskUri, imageUri: route.params.imageUri, prompt: prompt })
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
        ctx.lineWidth = 15;
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
        if (prompt === '') {
            return Alert("Please set a prompt before saving!")
        }
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
            <KeyboardAvoidingView style={styles.content} behavior="position" enabled>
                <TextInput
                    style={styles.textInput}
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="Write prompt here..."
                />
            </KeyboardAvoidingView>
            <BottomButtons
                onPressFirst={handleClearCanvas}
                onPressSecond={handleSaveImage}
                text1='Clear'
                text2='Save'
                onLayout={(evt) => console.log(evt.nativeEvent.layout)}
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        height: height - 64,
        backgroundColor: '#F5FCFF',
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
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 14,
        width: width
    },
    button: {
        backgroundColor: '#4F84C4',
        // padding: 20,
        height: '100%',
        width: '50%'
    },
    buttonText: {
        color: '#000000',
        fontSize: 18,
        textAlign: 'center',

    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'white'
    },
    textInput: {
        fontSize: 24,
        backgroundColor: '#fff',
        color: 'steelblue',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        padding: 10,
        marginBottom: 20,
    },
});
