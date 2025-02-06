interface DeviceCapabilities {
    hasAudioInput: boolean,
    hasVideoInput: boolean
}
interface Group {
    name: string,
    members: string[]
}
enum GifUiStage {
    CHOOSING_CATEGORY = "CHOOSING_CATEGORY",
    CHOOSING_GIF = "CHOOSING_GIF",
    SEARCHING_GIF = "SEARCHING_GIF",
}