import React, { useEffect } from "react";
import { useCanvas } from "./CanvasContext";
import ReactCanvas from 'react-native-canvas'

export function Canvas() {
    const {
        canvasRef,
        prepareCanvas,
        startDrawing,
        finishDrawing,
        draw
    } = useCanvas();

    useEffect(() => {
        prepareCanvas();
    }, []);

    return (
        <ReactCanvas
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            ref={canvasRef}
            style={{}}
        />
    );
}
