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

export default checkMediaDevices