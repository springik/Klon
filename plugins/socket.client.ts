import { io, Socket } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
    console.log("Running socket.io client plugin");

    let socket : Socket

    //const serverUrl = nuxtApp.$config.public.serverUrl
    const { loggedIn, session } = useUserSession()
    const userId = session.value?.user?.id
    
    socket = io({ autoConnect: loggedIn.value, auth: { userId } })
    nuxtApp.provide('socket', socket)

    socket.on("connect_error", (error) => {
        if(!socket.active) {
            console.error(error);
        }
    })
    socket.on("disconnect", (reason, details) => {
        console.log("Disconnected", reason, details)
    })
    watch(() => loggedIn.value, (newVal) => {
        if(newVal && !socket.connected) {
            socket.connect()
            return
        }
        if(socket.connected && !newVal)
            socket.disconnect()
    })
})