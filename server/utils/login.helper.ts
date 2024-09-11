import { H3Event } from 'h3'

export default function loggedIn(event: H3Event): Boolean {
        return Boolean(event.context?.user)
}