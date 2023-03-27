import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, Image } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage, firestore } from './firebaseConfig'
import { addDoc, collection, onSnapshot, doc } from "firebase/firestore";
import uuid from 'react-native-uuid';


const { width } = Dimensions.get('window')



export default function GetResultScreen({ navigation, route }) {
    const { imageUri, maskUri, prompt } = route.params
    const [jobId, setJobId] = useState(null)
    const [filesUploaded, setFilesUploaded] = useState(null)
    const [resultRemoteUri, setResultRemoteUri] = useState(null)
    const [resultUri, setResultUri] = useState(null)


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


    const waitForUpdate = async () => {
        const docRef = doc(firestore, "jobs", jobId)
        const unsub = onSnapshot(docRef, (mydoc) => {
            const docData = mydoc.data()
            console.log(docData)
            if (docData.status === 'COMPLETED') {
                unsub()
                setResultRemoteUri(docData.resultUri)
            }
        })
    }

    useEffect(() => {
        if (jobId !== null) {
            waitForUpdate()
        }
    }, [jobId])


    const downloadResult = async () => {
        const resultRef = ref(storage, 'gs://' + resultRemoteUri);
        console.log('downloading result')
        const downloadUrl = await getDownloadURL(resultRef)
        setResultUri(downloadUrl)
    }

    useEffect(() => {
        if (resultRemoteUri !== null) {
            downloadResult()
        }
    }, [resultRemoteUri])

    let loadingText = null
    if (filesUploaded === null) {
        loadingText = <Text>Uploading images...</Text>
    } else if (jobId === null) {
        loadingText = <Text>Creating job...</Text>
    } else if (resultRemoteUri == null) {
        loadingText = <Text>Waiting for response...</Text>
    } else if (resultUri == null) {
        loadingText = <Text>Downloading result...</Text>
    }
    return (
        <View style={styles.container}>
            <View style={styles.content}>
                {resultUri ? (
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: resultUri }} resizeMode="cover" />
                    </View>

                ) : (
                    <View style={styles.loadingContainer}>
                        {loadingText}
                        <ActivityIndicator size="large" color="#4F84C4" />
                    </View>
                )}
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