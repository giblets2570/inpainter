import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Image, Keyboard } from 'react-native';
// import storage from '@react-native-firebase/storage';
import { ref, uploadBytes } from "firebase/storage";
import { storage, firestore } from './firebaseConfig'
import { addDoc, collection } from "firebase/firestore";

// import DeviceInfo from 'react-native-device-info';
import uuid from 'react-native-uuid';


const { width } = Dimensions.get('window')
const BASE_URL = 'http://192.168.1.25:8888'



export default function GetResultScreen({ navigation, route }) {
    const { imageUri, maskUri, prompt } = route.params
    const [status, setStatus] = useState('SETTING_PROMPT')
    const [jobId, setJobId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)
    const [filesUploaded, setFilesUploaded] = useState(null)


    const uploadFilestoStorage = async () => {
        const userId = '1'  // this needs to use auth or something
        const fileId = uuid.v4()
        const imagepath = `inpainter/images/${userId}/${fileId}.jpg`
        const maskpath = `inpainter/masks/${userId}/${fileId}.jpg`
        const storageImageRef = ref(storage, imagepath);
        const storageMaskRef = ref(storage, maskpath);
        const [imageFile, maskFile] = await Promise.all([fetch(imageUri), fetch(maskUri)])
        const [imageBlob, maskBlob] = await Promise.all([imageFile.blob(), maskFile.blob()])
        const uploadResults = await Promise.all([
            uploadBytes(storageImageRef, imageBlob),
            uploadBytes(storageMaskRef, maskBlob)
        ])
        const [imageRemoteUri, maskRemoteUri] = uploadResults.map((value) => {
            return `${value.metadata.bucket}/${value.metadata.fullPath}`
        })
        console.log(imageRemoteUri, maskRemoteUri)
        setFilesUploaded({
            imageUri: imageRemoteUri,
            maskUri: maskRemoteUri
        })
    }

    useEffect(() => {
        uploadFilestoStorage()
    }, [])

    const uploadDataToStorage = async () => {
        try {
            const docRef = await addDoc(collection(firestore, "jobs"), {
                imageUri: filesUploaded.imageUri,
                maskUri: filesUploaded.maskUri,
                prompt: prompt,
                status: 'REQUESTED'
            });

            console.log("Document written with ID: ", docRef.id);
            setJobId(docRef.id)
        } catch (e) {
            console.error("Error adding document: ", e);
        }
    }

    useEffect(() => {
        if (filesUploaded !== null) {
            uploadDataToStorage()
        }
    }, [filesUploaded])


    const fetchJobStatus = async () => {
        const response = await fetch(`${BASE_URL}/job/${jobId}`)
        try {
            await response.json()
            await new Promise(resolve => setTimeout(resolve, 2000))
            fetchJobStatus()
        } catch (error) {
            setStatus('COMPLETE')
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (jobId) {
            fetchJobStatus()
        }
    }, [jobId])

    const uploadFiles = async () => {

        // const image = {
        //     uri: imageUri,
        //     type: 'image/jpeg',
        //     name: 'image.jpg',
        // }

        // const imageMask = {
        //     uri: maskUri,
        //     type: 'image/jpeg',
        //     name: 'image_mask.jpg',
        // }

        // const body = new FormData()
        // body.append('authToken', 'secret')
        // body.append('images[]', image)
        // body.append('images[]', imageMask)
        // body.append('prompt', prompt)

        // setIsLoading(true)

        // const xhr = new XMLHttpRequest()
        // xhr.open('POST', BASE_URL)
        // xhr.onreadystatechange = () => {
        //     if (xhr.readyState === 4) {
        //         const { jobId } = JSON.parse(xhr.responseText)
        //         setJobId(jobId)
        //     }
        // }
        // xhr.send(body)
    }
    useEffect(() => {
        if (prompt !== '') {
            uploadFiles()
        }
    }, [prompt])

    return (
        <View style={styles.container}>
            {/* <View style={styles.header}>
                <Text style={styles.headerTitle}>Get Result</Text>
            </View> */}
            <View style={styles.content}>
                {isLoading ? (
                    <View style={styles.loadingContainer}>
                        <Text>Loading the new image...</Text>
                        <ActivityIndicator size="large" color="#4F84C4" />
                    </View>
                ) : null}
                {status === 'COMPLETE' && jobId ? (
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: `${BASE_URL}/job/${jobId}` }} resizeMode="cover" />
                    </View>

                ) : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        backgroundColor: '#4F84C4',
        height: 70,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    textInput: {
        fontSize: 24,
        color: 'steelblue',
        borderBottomWidth: 1,
        borderBottomColor: '#CCCCCC',
        paddingBottom: 10,
        marginBottom: 20,
    },
    button: {
        backgroundColor: '#4F84C4',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 18,
    },
    promptContainer: {
        backgroundColor: '#EEEEEE',
        borderRadius: 10,
        padding: 10,
        marginBottom: 20,
    },
    promptText: {
        fontSize: 16,
        color: '#333333',
    },
    loadingContainer: {
        marginTop: 20,
        marginBottom: 30,
    },
    imageContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    image: {
        width: width - 40,
        height: width - 40,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#CCCCCC',
    },
})