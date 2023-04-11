import React, { useRef, useState, useEffect } from 'react';

import { StyleSheet, View, Image, Dimensions, TextInput, KeyboardAvoidingView, ActivityIndicator, Alert } from 'react-native';
import Canvas from 'react-native-canvas';
import * as FileSystem from 'expo-file-system';
import uuid from 'react-native-uuid';
import BottomButtons from './BottomButtons';
import { ref, uploadBytesResumable } from "firebase/storage";
import { storage } from './config'


const { width, height } = Dimensions.get("window")


export default function AddMaskScreen({ navigation, route }) {

    const { imageUri } = route.params
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [maskUri, setMaskUri] = useState(null);
    const [prompt, setPrompt] = useState('');
    const [imageRemoteUriCache, setImageRemoteUriCache] = useState({});

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.canvas.width = width;
            context.canvas.height = width;
        }
    }, [canvasRef]);


    useEffect(() => {
        if (maskUri !== null && imageRemoteUriCache[imageUri]) {
            const imageRemoteUri = imageRemoteUriCache[imageUri]
            navigation.push('Result', { maskUri, imageRemoteUri, prompt })
        }
    }, [maskUri, imageRemoteUriCache])


    const uploadImagetoStorage = async () => {
        const userId = '1'  // this needs to use auth or something
        const fileId = uuid.v4()
        const imagepath = `inpainter/images/${userId}/${fileId}.jpg`
        const storageImageRef = ref(storage, imagepath);
        const imageFile = await fetch(imageUri)
        console.log('fetched the file')
        const imageBlob = await imageFile.blob()
        console.log('created the blob')
        console.log('uploading image')
        const uploadResults = await uploadBytesResumable(storageImageRef, imageBlob)
        const imageRemoteUri = `${uploadResults.metadata.bucket}/${uploadResults.metadata.fullPath}`
        console.log('image uploaded')
        setImageRemoteUriCache({ ...imageRemoteUriCache, [imageUri]: imageRemoteUri })
    }

    useEffect(() => {
        if (!imageRemoteUriCache[imageUri]) {
            console.log('i am about to try and upload the image')
            uploadImagetoStorage()
        }
    }, [])

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
        console.log(imageUri)
        console.log(imageRemoteUriCache)
        console.log(imageRemoteUriCache[imageUri])
        const canvas = canvasRef.current;
        let blobBase64 = await canvas.toDataURL();
        blobBase64 = blobBase64.split(',')[1]
        const fileName = maskFilename(imageUri); // Replace with your desired file name
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
                source={{ uri: imageUri }} // Replace with your image source
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
                    multiline
                    style={styles.textInput}
                    value={prompt}
                    onChangeText={setPrompt}
                    placeholder="Write prompt here..."
                />
            </KeyboardAvoidingView>
            {maskUri && !imageRemoteUriCache[imageUri] && <ActivityIndicator size="large" color="#4F84C4" />}
            <BottomButtons
                onPressFirst={handleClearCanvas}
                onPressSecond={handleSaveImage}
                text1='Clear'
                text2='Save'
            />
        </View >
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
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
        top: 0,
        width: width,
        height: width,
    },
    content: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        padding: 20,
        backgroundColor: 'white',
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
