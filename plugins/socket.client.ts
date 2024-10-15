import { io, Socket } from "socket.io-client";

let socket : Socket

export default defineNuxtPlugin((nuxtApp) => {
    const serverUrl = nuxtApp.$config.public.serverUrl
    console.log(serverUrl);
    
    socket = io(serverUrl)

    nuxtApp.provide('socket', socket)
})