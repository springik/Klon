<script setup lang="ts">
import Peer from 'simple-peer'

const { $socket } = useNuxtApp()
const snackbar = useSnackbar()
const router = useRouter()

let localStream : MediaStream | null = null
const localVideo = ref<HTMLVideoElement | null>(null)
const remoteStreams : Map<string, MediaStream> = new Map()
const remoteVideos : Map<string, HTMLVideoElement> = new Map()
const peers : Map<string, Peer.Instance> = new Map()

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
    peer.on('signal', (data) => {
        console.log('sending signal', data)
        $socket.emit('signal', { signal: data, to: peerId })
    })
    peer.on('stream', (stream) => {
        console.log('got remote stream', stream)

        remoteStreams.set(peerId, stream)
        //remoteStream = stream
        remoteVideos.get(peerId)!.srcObject = stream
        //remoteVideo.value!.srcObject = stream
    })
    peer.on('connect', () => {
        console.log('peer connected')
    })
    peer.on('close', () => {
        console.log('peer closed')
        peers.delete(peerId)
        remoteStreams.delete(peerId)
    })
    peer.on('error', (error) => {
        console.error('peer error', error)
    })
    return peer
}

onMounted(async () => {
    const { hasAudioInput, hasVideoInput } = await checkMediaDevices()
    localStream = await navigator.mediaDevices.getUserMedia({ video: hasVideoInput, audio: hasAudioInput })

    $socket.on('signal', (socketData : { signal: any, from: string }) => {
        console.log('got signal', socketData)
        const peer = peers.get(socketData.from)
        if (peer) {
            peer.signal(socketData.signal)
        } else {
            const peer = createPeer(localStream!, false, socketData.from)
            peer.on('signal', (data) => {
                console.log('sending signal', data)
                $socket.emit('signal', { signal: data, to: socketData.from })
            })
            peer.signal(socketData.signal)
            peers.set(socketData.from, peer)
        }
    })

    //FIXME: duplicate peering user does conn when joining and the other side too via user-joined-call
    $socket.on('join-call', (peerIds : Array<string>) => {
        console.log('join call', peerIds)
        peerIds.forEach(peerId => {
            const peer = createPeer(localStream!, true, peerId)
            peers.set(peerId, peer)
        })
    })
    /*
    $socket.on('user-joined-call', (peerId : string) => {
        console.log('user joined call', peerId)
        const peer = createPeer(localStream!, true, peerId)
        peer.on('signal', (data) => {
            console.log('sending signal', data)
            $socket.emit('signal', { signal: data, to: peerId })
        })
        peers.set(peerId, peer)
    })
    */
    $socket.on('user-left-call', (peerId : string) => {
        console.log('user left call', peerId)
        const peer = peers.get(peerId)
        if (peer) {
            peer.destroy()
            peers.delete(peerId)
            remoteStreams.delete(peerId)
        }
    })
    $socket.emit('join-call', { groupId: props.groupId, serverId: props.serverId })
})
onBeforeUnmount(() => {
    $socket.off('signal')
    $socket.off('join-call')
    //$socket.off('user-joined-call')
    $socket.off('user-user-left-call')
})
</script>

<template>
    <video ref="localVideo" autoplay></video>
    <div v-for="[peerId, stream] in remoteStreams" :key="peerId">
        <video :ref="el => remoteVideos.set(peerId, el)" autoplay></video>
    </div>
</template>
