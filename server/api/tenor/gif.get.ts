import https from 'https'

export default defineEventHandler(async (event) => {
    const { id } = getQuery(event)
    const apiUrl = `https://tenor.googleapis.com/v2/posts?key=${process.env.TENOR_API_KEY}&ids=${id}`

    return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('end', () => {
                resolve(JSON.parse(data).results[0])
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
})