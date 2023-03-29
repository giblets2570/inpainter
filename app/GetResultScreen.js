import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, ActivityIndicator, Dimensions, Image } from 'react-native';
import { ref, uploadBytes, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, firestore } from './firebaseConfig'
import { addDoc, collection, onSnapshot, doc } from "firebase/firestore";
import uuid from 'react-native-uuid';
import BottomButtons from './BottomButtons';


const { width } = Dimensions.get('window')



export default function GetResultScreen({ navigation, route }) {
    const { imageRemoteUri, maskUri, prompt } = route.params
    const [jobId, setJobId] = useState(null)
    const [maskRemoteUri, setMaskRemoteUri] = useState(null)
    const [resultRemoteUri, setResultRemoteUri] = useState(null)
    const [resultUri, setResultUri] = useState(null)


    const uploadMasktoStorage = async () => {
        const userId = '1'  // this needs to use auth or something
        const fileId = uuid.v4()
        const imagepath = `inpainter/masks/${userId}/${fileId}.jpg`
        const storageImageRef = ref(storage, imagepath);
        const imageFile = await fetch(maskUri)
        const imageBlob = await imageFile.blob()
        const uploadResults = await uploadBytesResumable(storageImageRef, imageBlob)
        const maskRemoteUri = `${uploadResults.metadata.bucket}/${uploadResults.metadata.fullPath}`
        setMaskRemoteUri(maskRemoteUri)
    }


    useEffect(() => {
        console.log('uploading files')
        uploadMasktoStorage()
        return () => setMaskRemoteUri(null)
    }, [])

    const uploadDataToStorage = async () => {
        try {
            const docRef = await addDoc(collection(firestore, "jobs"), {
                imageUri: imageRemoteUri,
                maskUri: maskRemoteUri,
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
        if (maskRemoteUri !== null) {
            console.log('uploading to firestore')
            uploadDataToStorage()
            return () => setJobId(null)
        }
    }, [maskRemoteUri])


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
            console.log('waiting for update')
            waitForUpdate()
            return () => setResultRemoteUri(null)
        }
    }, [jobId])


    const downloadResult = async () => {
        const resultRef = ref(storage, 'gs://' + resultRemoteUri);
        const downloadUrl = await getDownloadURL(resultRef)
        setResultUri(downloadUrl)
    }

    useEffect(() => {
        if (resultRemoteUri !== null) {
            console.log('waiting for update')
            downloadResult()
            return () => setResultUri(null)
        }
    }, [resultRemoteUri])

    let loadingText = null
    if (maskRemoteUri === null) {
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
            {resultUri && <BottomButtons
                onPressFirst={() => navigation.pop()}
                onPressSecond={() => navigation.popToTop()}
                text1="Retry with same image"
                text2="Take new image"
            ></BottomButtons>}
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