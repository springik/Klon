import { ValidationError } from "joi";

export default function requestValidationHelper(error : ValidationError) {
    if(error)
        throw createError({
            message: error.message
        })
}