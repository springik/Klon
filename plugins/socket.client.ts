import { io, Socket } from "socket.io-client";

export default defineNuxtPlugin((nuxtApp) => {
    console.log("Running socket.io client plugin");

    let socket : Socket

    const serverUrl = nuxtApp.$config.public.serverUrl
    const { loggedIn, session } = useUserSession()
    const userId = session.value?.user?.id
    
    socket = io(serverUrl, { autoConnect: loggedIn.value, auth: { userId } })
    console.log(socket);
    nuxtApp.provide('socket', socket)

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
        if(socket.connected && !newVal)
            socket.disconnect()
    })
})