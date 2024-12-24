<script setup lang="ts">
    import Peer from 'simple-peer'

    const { $socket } = useNuxtApp()
    const snackbar = useSnackbar()
    const router = useRouter()

    const props = defineProps({
        friendId: String,
        action: String,
        signal: String,
    })

    let peer : Peer.Instance | null = null
    let localStream : MediaStream | null = null
    let remoteStream : MediaStream | null = null
    const localVideo = ref<HTMLVideoElement | null>(null)
    const remoteVideo = ref<HTMLVideoElement | null>(null)
    const localsignal = ref()
    const inited = ref(false)

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

    const call = async () => {
        $socket.emit('call-user', { receiverId: props.friendId })
        $socket.on('call-accepted', async () => {
            console.log('call accepted');
            await startCall()
        })
    }
    const startCall = async () => {
        try {
            //TODO: check if mediaDevices is available
        const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
        if(!hasAudioInput)
            throw new Error('No audio input device found')
        localStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })
        localVideo.value!.srcObject = localStream
        console.log('got media' ,localStream);

        peer = new Peer({
            initiator: true,
            trickle: false,
            stream: localStream
        })
        console.log("created peer", peer);

        peer.on('error', (err) => {
            console.error(err)
        })

        peer.on('signal', (data) => {
            console.log('SIGNAL', JSON.stringify(data))
            localsignal.value = data
            if(!inited.value) {
                $socket.emit('passalong-init-signal', { to: props.friendId, signal: data })
                inited.value = true
            }
            else
                $socket.emit('signal', { signal: data, to: props.friendId })
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
            remoteVideo.value!.srcObject = remoteStream
        })

        $socket.emit('call-user', { receiverId: props.friendId })

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
        try {
            const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
        localStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })

        localVideo.value!.srcObject = localStream

        peer = new Peer({
            initiator: false,
            trickle: false,
            stream: localStream
        })
        peer.on('error', (err) => {
            console.error('peer error' ,err);
        });

        peer.on('signal', (data) => {
            console.log('SIGNAL', JSON.stringify(data));
            $socket.emit('signal', { signal: data, to: props.friendId });
        });

        peer.on('stream', (stream) => {
            remoteStream = stream;
            remoteVideo.value!.srcObject = remoteStream;
        });
        console.log('signal', signal);

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
        $socket.emit('end-call', { to: props.friendId })
        router.push('/friends/')
    }
    const shareScreen = async () => {
        if(!peer)
            return
    }

    onMounted(async () => {
        console.log('mounted call component');
        

        $socket.on('call-ended', () => {
            endCall()
            snackbar.add({ text: 'Call ended', type: 'info' })
            router.push('/friends/')
        })
        $socket.on('signal', (data) => {
            console.log('received signal', data);
            peer!.signal(data.signal)
        })

        if(props.action == 'initiate') {
            await call()
        }
        else if(props.action == 'accept') {
            console.log(props.signal);
            if(props.signal == 'true') {
                $socket.on('init-signal', (data) => {
                    console.log('init signal', data);
                    if(data.from === props.friendId)
                        answerCall(data.signal)
                })
                $socket.emit('accept-call', { to: props.friendId })
            }
        }
    })

    onBeforeUnmount(() => {
        $socket.off('signal')
        $socket.off('call-ended')
        $socket.off('call-accepted')
        $socket.off('init-signal')

        if(peer) {
            peer.destroy()
        }
    })

</script>

<template>
    <div>
        <video ref="localVideo" autoplay playsinline></video>
        <video ref="remoteVideo" autoplay playsinline></video>
        <UButton @click="endCall">End Call</UButton>
        <UButton @click="shareScreen">Share Screen</UButton>
    </div>
</template>