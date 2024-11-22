import { defineStore } from "pinia";

export const useMessageStore = defineStore('messages', {
    state: () => ( { messages: {} as Record<string, object[]> } ),
    getters: {
        getForConversation: (state) => {
            return (conversationId : string) => {
                return state.messages[conversationId] || []
            }
        }
    },
    actions: {
        // TODO: proper message type
        addMessage(conversationId : string, message : object) {
            const conversationMessages = this.messages[conversationId] || []
            conversationMessages.push(message)
            this.messages[conversationId] = conversationMessages
        },
        removeMessage(conversationId : string, messageId : string) {
            const conversationMessages = this.messages[conversationId] || []
            //@ts-expect-error
            const filtered = conversationMessages.filter((message) => message.id != messageId)
            this.messages[conversationId] = filtered
        }
    }
})