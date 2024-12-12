<script setup lang="ts">
    import Peer from 'simple-peer'

    const { $socket } = useNuxtApp()
    const snackbar = useSnackbar()

    const props = defineProps({
        friendId: String
    })

    let peer : Peer.Instance | null = null
    let localStream : MediaStream | null = null
    let remoteStream : MediaStream | null = null
    const localVideo = ref<HTMLVideoElement | null>(null)
    const remoteVideo = ref<HTMLVideoElement | null>(null)

    const checkMediaDevices = async () : Promise<DeviceCapabilities> => {
        if(!import.meta.client)
            return { hasAudioInput: false, hasVideoInput: false }
        try {
            const devices = await navigator.mediaDevices.enumerateDevices()
            const hasAudioInput = devices.some(device => device.kind === 'audioinput')
            const hasVideoInput = devices.some(device => device.kind === 'videoinput')
            return { hasAudioInput, hasVideoInput }
        } catch (error) {
            console.error(error)
        }
        return { hasAudioInput: false, hasVideoInput: false }
    }

    //TODO: remove
    // for reference https://medium.com/stackanatomy/introduction-to-simple-peer-a-webrtc-library-ab04ea8aa5fe
    const startCall = async () => {
        if(!import.meta.client)
            return
        
        try {
            //TODO: check if mediaDevices is available
        const { hasAudioInput } = await checkMediaDevices()
        if(!hasAudioInput)
            throw new Error('No audio input device found')
        localStream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } })
        localVideo.value!.srcObject = localStream
        peer = new Peer({
            initiator: true,
            trickle: false,
            stream: localStream
        })
        peer.addStream(localStream)

        peer.on('error', (err) => {
            console.error(err)
        })

        peer.on('signal', (data) => {
            console.log('SIGNAL', JSON.stringify(data))
        })

        peer.on('connect', () => {
            console.log('CONNECT')
            peer?.send('test' + Math.random())
        })

        peer.on('data', (data) => {
            console.log('data: ' + data)
        })

        peer.on('stream', (stream) => {
            console.log('remote stream')
            remoteStream = stream
        })

        $socket.on('signal', (data) => {
            if(data.from === props.friendId) {
                peer!.signal(data.signal)
            }
        })
        } catch (error) {
            if(error instanceof Error) {
                if(error?.message === 'No audio input device found') {
                    snackbar.add({ text: 'No audio input device found', type: 'error' })
                } else if(error?.message === 'No video input device found') {
                    snackbar.add({ text: 'No video input device found', type: 'error' })
                }
            }
            else
                console.error(error)
        }
    }
    const answerCall = async (signal) => {
        if(!import.meta.client)
            return
        try {
        localStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: true })

        localVideo.value!.srcObject = localStream

        peer = new Peer({
            initiator: false,
            trickle: false,
            stream: localStream
        })
        peer.on('error', (err) => {
            console.error(err);
        });

        peer.on('signal', (data) => {
            $socket.emit('signal', { signal: data, to: props.friendId });
        });

        peer.on('stream', (stream) => {
            remoteVideo.value!.srcObject = stream;
        });

        peer.signal(signal);
        } catch (error) {
            console.error(error)
        }
    }
    const endCall = () => {
        if(!import.meta.client)
            return
        if(peer) {
            peer.destroy()
            peer = null
            localStream?.getTracks().forEach(track => track.stop())
            remoteVideo.value = null
        }
    }
    const shareScreen = async () => {
        if(!import.meta.client || !peer)
            return
    }

    onMounted(async () => {
        if(!import.meta.client)
            return
        $socket.on('signal', (data) => {
            if(data.from === props.friendId) {
                if(!peer)
                    answerCall(data.signal)
                else
                    peer.signal(data.signal)
            }
        })
    })

    onBeforeUnmount(() => {
        if(!import.meta.client)
            return

        $socket.off('signal')
        if(peer) {
            peer.destroy()
        }
    })

</script>

<template>
    <div>
        <video ref="localVideo" autoplay playsinline></video>
        <video ref="remoteVideo" autoplay playsinline></video>
        <button @click="startCall">Start Call</button>
        <button @click="endCall">End Call</button>
        <button @click="shareScreen">Share Screen</button>
    </div>
</template>