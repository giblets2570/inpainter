import React, { useRef, useState } from 'react';
import { StyleSheet, View, Image, PanResponder, Platform, UIManager, TouchableOpacity } from 'react-native';
import { Canvas, Image as CanvasImage } from 'react-native-canvas';

export default function AddMaskScreen({ navigation, route }) {
    const [imageUri, setImageUri] = useState(null);
    const canvasRef = useRef(null);

    const handleLayout = () => {
        canvasRef.current.width = 300;
        canvasRef.current.height = 300;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const canvas = canvasRef.current;
                const ctx = canvas.getContext('2d');
                const { locationX, locationY } = evt.nativeEvent;
                ctx.beginPath();
                ctx.arc(locationX, locationY, 25, 0, 2 * Math.PI, true);
                ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
                ctx.fill();
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 2;
                ctx.stroke();
                canvas.toDataURL('image/jpeg', 1.0, (data) => setImageUri(data));
            },
        })
    ).current;
    if (Platform.OS === 'android') {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
    // return <View style={styles.screen}>
    //     <Image source={{ uri: route.params.imageUri }} style={styles.image} />
    //     <TouchableOpacity
    //         title="Go to Screen 1"
    //         onPress={() => {
    //             navigation.pop()
    //         }}
    //     />
    // </View>

    console.log('canvasRef', canvasRef)
    return <View style={styles.container}>
        <Image source={{ uri: 'https://picsum.photos/id/1002/300/300' }} style={styles.image} />
        {/* <Canvas
            ref={canvasRef}
            style={styles.canvas}
            onLayout={() => canvasRef.current.width = 300}
        >
            <CanvasImage source={{ uri: imageUri }} style={styles.canvasImage} />
        </Canvas> */}
        <View style={styles.overlay} {...panResponder.panHandlers} />
    </View>
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5FCFF',
    },
    image: {
        width: 300,
        height: 300,
        marginBottom: 20,
    },
    canvas: {
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: 1,
    },
    canvasImage: {
        width: 300,
        height: 300,
    },
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 300,
        height: 300,
        backgroundColor: 'transparent',
    },
});
