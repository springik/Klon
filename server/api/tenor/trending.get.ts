import https from "https"

export default defineEventHandler(async (event) => {
    const apiUrl = `https://tenor.googleapis.com/v2/categories?key=${process.env.TENOR_API_KEY}&limit=30`

    return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('end', () => {
                resolve(JSON.parse(data).tags)
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
})