import React, { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, TextInput, ActivityIndicator, Dimensions, Image, Keyboard } from 'react-native';

const { width } = Dimensions.get('window')

export default function GetResultScreen({ navigation, route }) {
    const { imageUri, maskUri, prompt } = route.params
    const [status, setStatus] = useState('SETTING_PROMPT')
    const [jobId, setJobId] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const baseUrl = process.env.BASE_URL

    const fetchJobStatus = async () => {
        if (jobId) {
            const response = await fetch(`${baseUrl}/job/${jobId}`)
            try {
                await response.json()
                await new Promise(resolve => setTimeout(resolve, 2000))
                fetchJobStatus()
            } catch (error) {
                setStatus('COMPLETE')
                setIsLoading(false)
            }
        }
    }

    useEffect(() => {
        fetchJobStatus()
    }, [jobId])

    useEffect(() => {
        if (prompt !== '') {
            const uploadFiles = async () => {

                const image = {
                    uri: imageUri,
                    type: 'image/jpeg',
                    name: 'image.jpg',
                }

                const imageMask = {
                    uri: maskUri,
                    type: 'image/jpeg',
                    name: 'image_mask.jpg',
                }

                const body = new FormData()
                body.append('authToken', 'secret')
                body.append('images[]', image)
                body.append('images[]', imageMask)
                body.append('prompt', prompt)

                setIsLoading(true)

                const xhr = new XMLHttpRequest()
                xhr.open('POST', baseUrl)
                xhr.onreadystatechange = () => {
                    if (xhr.readyState === 4) {
                        const { jobId } = JSON.parse(xhr.responseText)
                        setJobId(jobId)
                    }
                }
                xhr.send(body)
            }
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
                        <ActivityIndicator size="large" color="#4F84C4" />
                    </View>
                ) : null}
                {status === 'COMPLETE' && jobId ? (
                    <View style={styles.imageContainer}>
                        <Image style={styles.image} source={{ uri: `${baseUrl}/job/${jobId}` }} resizeMode="cover" />
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