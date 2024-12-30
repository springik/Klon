<script setup lang="ts">
import Peer from 'simple-peer'

const { $socket } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()
const { session } = useUserSession()

let localStream : MediaStream | null = null
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteStreams = ref<object>({})
const remoteVideos = ref<Map<string, HTMLVideoElement>>(new Map())
const peers : Map<string, Peer.Instance> = new Map()
let localPeerId: string | null = null
const muted = ref(false)
const sharingScreen = ref(false)

const props = defineProps({
    action: String,
    groupId: String,
    serverId: String,
})

/** 
 *  Joins a call with user media.
 *  Uses group ID prop.
*/
async function joinCall() {
    try {
        const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
        if (!hasAudioInput)
            throw new Error('No audio input device found')
        localStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })
        localVideo.value!.srcObject = localStream
        console.log('got media', localStream);

        $socket.emit('join-call', { groupId: props.groupId, serverId: props.serverId })
    } catch (error) {
        console.error(error)
    }
}
function endCall() {
    peers.forEach(peer => peer.destroy())
    peers.clear()
    remoteStreams.value = {}
    localStream?.getTracks().forEach(track => track.stop())
    localStream = null
    router.push('/servers')
}
function muteMic() {
    muted.value = !muted.value
    localStream?.getAudioTracks().forEach(track => track.enabled = !muted.value)
}
async function shareScreen() {
    if(!sharingScreen.value) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        peers.forEach(peer => {
            peer.streams[0].getVideoTracks()[0].stop()
            peer.replaceTrack(localStream!.getVideoTracks()[0], screenStream.getVideoTracks()[0], localStream!)
            peer.replaceTrack(localStream!.getAudioTracks()[0], screenStream.getAudioTracks()[0], localStream!)
            localStream = screenStream
            sharingScreen.value = true
            return
        })

        const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
        const newStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })
        peers.forEach(peer => {
            peer.streams[0].getVideoTracks()[0].stop()
            peer.replaceTrack(peer.streams[0].getVideoTracks()[0], newStream.getVideoTracks()[0], peer.streams[0])
        })
        localStream = newStream
        sharingScreen.value = false
    }
}

/** 
 *  Creates a simple-peer peer instance
 *  @param {MediaStream} stream - Stream to be sent by the peer
 *  @param {boolean} creator - Whether the peer is the initiator of the call
 *  @param {string} peerId - User ID of the peer
 *  @returns {Peer.Instance} - Peer instance
*/
function createPeer(localStream: MediaStream, creator: boolean, peerId: string) {
    const peer = new Peer({
        initiator: creator,
        trickle: false,
        stream: localStream,
    })
    console.log('peer created', peer)

    peer.on('signal', (data) => {
        console.log('sending signal', data)
        console.log('to', peerId)
        $socket.emit('signal', { signal: data, to: peerId })
    })
    peer.on('stream', async (stream) => {
        console.log('got remote stream', stream)
        console.log('peer id', peerId)

        remoteStreams.value[peerId] = stream
        await nextTick()
        remoteVideos.value.get(peerId)!.srcObject = stream
    })
    peer.on('connect', () => {
        console.log('peer connected')
    })
    peer.on('close', () => {
        console.log('peer closed')
        peers.delete(peerId)
        remoteStreams.value.delete(peerId)
        delete remoteStreams.value[peerId]
    })
    peer.on('error', (error) => {
        console.error('peer error', error)
    })
    return peer
}
function setVideoRef(peerId: string) {
    return (video: HTMLVideoElement) => {
        if(video)
            remoteVideos.value.set(peerId, video)
    }
}

onMounted(async () => {
    const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
    localStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })
    localVideo.value!.srcObject = localStream

    if(session.value?.user)
        localPeerId = session.value?.user.id

    $socket.on('signal', (socketData : { signal: any, from: string }) => {
        console.log('got signal', socketData.signal)
        console.log('from', socketData.from);

        if(socketData.from === localPeerId)
            return

        let peer = peers.get(socketData.from)
        console.log('peer', peer)
        if (peer) {
            console.log('using existing peer');
            console.log('singaling state', peer._pc?.signalingState);
        } else {
            console.log('creating new peer for', socketData.from);
            peer = createPeer(localStream!, false, socketData.from)
            peers.set(socketData.from, peer)
        }
        peer.signal(socketData.signal)
        console.log('signaling state after signal', peer._pc?.signalingState)
    })

    $socket.on('join-call', (peerIds : Array<string>) => {
        console.log('join call', peerIds)
        console.log('got peer ids', peerIds)
        
        peerIds.forEach(peerId => {
            const peer = createPeer(localStream!, true, peerId)
            peers.set(peerId, peer)
        })
    })
    $socket.on('user-left-call', (peerId : string) => {
        console.log('user left call', peerId)
        const peer = peers.get(peerId)
        if (peer) {
            peer.destroy()
            peers.delete(peerId)
            delete remoteStreams.value[peerId]
        }
    })
    joinCall()
})
onBeforeUnmount(() => {
    $socket.off('signal')
    $socket.off('join-call')
    $socket.off('user-left-call')

    if(peers)
        peers.forEach(peer => peer.destroy())
})
</script>

<template>
    <div class="relative h-full">
        <h1 class="text-center absolute top-5 left-1/2 right-0 transform -translate-x-1/2 text-3xl font-bold">{{ groupId }}</h1>
        <div class="flex flex-col items-center justify-center h-full">
        <div class="grid grid-cols-1 md:grid-cols-3 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="rounded-lg" v-for="(stream, peerId) in remoteStreams" :key="peerId">
                <video :ref="setVideoRef(peerId)" autoplay></video>
            </div>
            <div class="rounded-lg">
                <video ref="localVideo" autoplay></video>
            </div>
        </div>
        </div>
        <!-- controls -->
        <div class="absolute bottom-0 right-0 left-1/2 transform -translate-x-1/2 flex justify-center space-x-4">
            <UButton @click="endCall">Leave Call</UButton>
            <UButton v-if="!muted" @click="muteMic">Mute</UButton>
            <UButton v-else @click="muteMic">Unmute</UButton>
            <UButton v-if="!sharingScreen" @click="shareScreen">Share Screen</UButton>
            <UButton v-else @click="shareScreen">Share camera</UButton>
        </div>
    </div>
</template>
