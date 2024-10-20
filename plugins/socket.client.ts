import { io, Socket } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
    let socket : Socket

    const serverUrl = nuxtApp.$config.public.serverUrl
    const { loggedIn } = useUserSession()
    console.log(loggedIn);
    
    socket = io(serverUrl, { autoConnect: loggedIn.value })

    const snackbar = useSnackbar()
    socket.on("connect_error", (error) => {
        if(!socket.active) {
            console.error(error);
            snackbar.add({
                type: 'error',
                text: "Connection error"
            })
        }
    })
    socket.on("disconnect", (reason, details) => {
        //console.log(reason);
        snackbar.add({
            type: 'error',
            text: `Disconnected for ${reason}`,
        })
    })
    watch(() => loggedIn.value, (newVal) => {
        if(newVal && !socket.connected) {
            socket.connect()
            return
        }
        if(socket.connected)
            socket.disconnect()
    })

    nuxtApp.provide('socket', socket)
})