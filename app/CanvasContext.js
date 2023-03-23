import React, { useContext, useRef, useState } from "react";
import { Dimensions } from "react-native";
// enabling drawing on the blank canvas
const CanvasContext = React.createContext();

export const CanvasProvider = ({ children }) => {
    const [isDrawing, setIsDrawing] = useState(false);
    const canvasRef = useRef(null);
    const contextRef = useRef(null);

    //defining width & height of the canvas
    const prepareCanvas = () => {
        const canvas = canvasRef.current;
        const { innerHeight, innerWidth } = Dimensions.get('window')

        canvas.width = innerWidth * 2;
        canvas.height = innerHeight * 2;

        // defining the thickness and colour of our brush
        const context = canvas.getContext("2d");
        context.scale(2, 2);
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        contextRef.current = context;
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.beginPath();
        contextRef.current.moveTo(offsetX, offsetY);
        setIsDrawing(true);
    };

    const finishDrawing = () => {
        contextRef.current.closePath();
        setIsDrawing(false);
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) {
            return;
        }
        const { offsetX, offsetY } = nativeEvent;
        contextRef.current.lineTo(offsetX, offsetY);
        contextRef.current.stroke();
    };

    //once the canvas is cleared it return to the default colour
    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        context.fillStyle = "white";
        context.fillRect(0, 0, canvas.width, canvas.height);
    };

    return (
        <CanvasContext.Provider
            value={{
                canvasRef,
                contextRef,
                prepareCanvas,
                startDrawing,
                finishDrawing,
                clearCanvas,
                draw
            }}
        >
            {children}
        </CanvasContext.Provider>
    );
};

export function useCanvas() {
    const canvasContext = useContext(CanvasContext);

    if (!canvasContext) {
        throw new Error('useCanvas must be used within a CanvasProvider');
    }

    return {
        canvasRef: canvasContext.canvasRef,
        contextRef: canvasContext.contextRef,
        prepareCanvas: canvasContext.prepareCanvas,
        startDrawing: canvasContext.startDrawing,
        finishDrawing: canvasContext.finishDrawing,
        clearCanvas: canvasContext.clearCanvas,
        draw: canvasContext.draw,
    };
}
