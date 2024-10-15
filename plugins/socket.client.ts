import { io, Socket } from "socket.io-client";

let socket : Socket

export default defineNuxtPlugin((nuxtApp) => {
    const serverUrl = nuxtApp.$config.public.serverUrl
    console.log(serverUrl);
    
    socket = io(serverUrl)

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
        console.log(reason);
        snackbar.add({
            type: 'error',
            text: `Disconnected for ${reason}`,
        })
    })

    nuxtApp.provide('socket', socket)
})