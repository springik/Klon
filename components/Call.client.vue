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
    const sharingScreen = ref<boolean>(false)
    const muted = ref<boolean>(false)
    const waitingForAnswer = ref<boolean>(false)

/*
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
*/


    //TODO: remove
    // for reference https://medium.com/stackanatomy/introduction-to-simple-peer-a-webrtc-library-ab04ea8aa5fe

    const call = async () => {
        $socket.emit('call-user', { receiverId: props.friendId })
        waitingForAnswer.value = true
        $socket.on('call-accepted', async () => {
            console.log('call accepted');
            waitingForAnswer.value = false
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

        //$socket.emit('call-user', { receiverId: props.friendId })

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
        if(!sharingScreen.value) {
            const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
            peer.streams[0].getVideoTracks()[0].stop()
            peer.replaceTrack(peer.streams[0].getVideoTracks()[0], screenStream.getVideoTracks()[0], peer.streams[0])
            localStream = screenStream
            localVideo.value!.srcObject = localStream
            sharingScreen.value = true
            return
        }

        const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
        const newStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })
        peer.streams[0].getVideoTracks()[0].stop()
        peer.replaceTrack(peer.streams[0].getVideoTracks()[0], newStream.getVideoTracks()[0], peer.streams[0])
        localStream = newStream
        localVideo.value!.srcObject = localStream
        localStream.getAudioTracks().forEach(track => track.enabled = !muted.value)
        sharingScreen.value = false
    }
    const muteMic = () => {
        if(!localStream)
            return
        localStream.getAudioTracks().forEach(track => track.enabled = !track.enabled)
        //localStream.getAudioTracks()[0].enabled = !localStream.getAudioTracks()[0].enabled
        muted.value = !muted.value
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

        endCall()
    })

</script>

<template>
    <div class="relative h-full">
        <div class="flex flex-row items-center justify-center">
            <video class="w-1/3 h-64" ref="localVideo" autoplay playsinline></video>
            <video class="w-1/2 h-96" ref="remoteVideo" autoplay playsinline></video>
        </div>
        <div class="absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 flex space-x-4 justify-center">
            <UButton @click="endCall">End Call</UButton>
            <UButton v-if="!muted" @click="muteMic">Mute</UButton>
            <UButton v-else @click="muteMic">Unmute</UButton>
            <UButton v-if="!sharingScreen" @click="shareScreen">Share Screen</UButton>
            <UButton v-else @click="shareScreen">Share camera</UButton>
        </div>
        <UModal v-model="waitingForAnswer" prevent-close>
            <div class="h-32 flex flex-col items-center justify-center space-y-4">
                <h3>
                    Waiting for answer
                </h3>
                <UProgress animation="carousel" />
                <UButton @click="endCall">Cancel</UButton>
            </div>
        </UModal>
    </div>
</template>