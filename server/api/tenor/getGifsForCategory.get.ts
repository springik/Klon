import https from 'https'

export default defineEventHandler(async (event) => {
    const { searchterm } = getQuery(event)
    const apiUrl = `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API_KEY}&q=${searchterm}`

    return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('end', () => {
                const parsedData = JSON.parse(data)
                resolve({ gifs: parsedData.results, next: parsedData.next })
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
})