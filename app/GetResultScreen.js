import { useState, useEffect, useRef } from 'react'


import { StyleSheet, Text, View, TouchableOpacity, TextInput, Button, Dimensions, Image, Keyboard } from 'react-native';

const { width } = Dimensions.get("window")


export default function GetResultScreen({ navigation, route }) {
    const { imageUri, maskUri } = route.params

    const [status, setStatus] = useState("SETTINGPROMPT")
    const [prompt, setPrompt] = useState("")
    const [finalPrompt, setFinalPrompt] = useState("")
    const [jobId, setJobId] = useState(null)

    const requestJobStatus = async () => {
        if (jobId !== null) {
            let response = await fetch(`http://192.168.1.25:8888/job/${jobId}`)
            try {
                await response.json()
                // if this doesnt failed, its not an image
                await new Promise((resolve) => {
                    setTimeout(resolve, 2000)
                })
                requestJobStatus()
            } catch (e) {
                setStatus("COMPLETE")
            }
        }
    }

    useEffect(() => {
        requestJobStatus()
    }, [jobId])

    useEffect(() => {
        if (finalPrompt === '') {
            return
        }
        const uploadFiles = async () => {
            const url = 'http://192.168.1.25:8888/'

            const image = {
                uri: imageUri,
                type: 'image/jpeg',
                name: 'image.jpg',
            };

            const imageMask = {
                uri: maskUri,
                type: 'image/jpeg',
                name: 'image_mask.jpg',
            };


            const body = new FormData();
            body.append('authToken', 'secret');
            body.append('images[]', image);
            body.append('images[]', imageMask);
            body.append('prompt', finalPrompt);

            const xhr = new XMLHttpRequest();
            xhr.open('POST', url);
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    let { jobId } = JSON.parse(xhr.responseText);
                    console.log(jobId)
                    setJobId(jobId)
                }
            };
            xhr.send(body);
        }
        uploadFiles()
    }, [finalPrompt])

    return <View>
        <TextInput
            style={styles.textInput}
            value={prompt}
            onChangeText={(newText) => setPrompt(newText)}
            placeholder="Write prompt here..."
        />
        {

            prompt && (<TouchableOpacity
                onPress={() => { setFinalPrompt(prompt); setJobId(null); setStatus("PENDING"); Keyboard.dismiss() }}
                style={styles.button}
            >
                <Text style={styles.buttonText}>Use prompt</Text>
            </TouchableOpacity>)
        }
        <Text>{finalPrompt}</Text>
        {jobId && <Text>{jobId}</Text>}
        {status === 'COMPLETE' && <Image
            style={styles.image}
            source={{ uri: `http://192.168.1.25:8888/job/${jobId}` }} // Replace with your image source
            resizeMode="contain"
        />}
    </View>
}


const styles = StyleSheet.create({
    textInput: { fontSize: 24, color: 'steelblue' },
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
    image: {
        width: width,
        height: width
    },
})