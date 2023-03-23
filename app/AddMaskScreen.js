import React, { useRef, useState, useEffect } from 'react';
import { StyleSheet, View, Image, Text, Dimensions, TouchableOpacity } from 'react-native';
import Canvas from 'react-native-canvas';

const { width } = Dimensions.get("window")

export default function AddMaskScreen({ navigation, route }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            const context = canvas.getContext('2d');
            context.canvas.width = width;
            context.canvas.height = width;
        }
    }, [canvasRef]);


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

    return (
        <View style={styles.container}>
            <Image
                style={styles.image}
                source={{ uri: route.params.imageUri }} // Replace with your image source
                resizeMode="contain"
                onTouchStart={() => console.log('onTouchStart')}
                onTouchMove={() => console.log('onTouchMove')}
                onTouchEnd={() => console.log('onTouchEnd')}
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
                <TouchableOpacity onPress={handleClearCanvas} style={styles.button} >
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
