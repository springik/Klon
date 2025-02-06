import https from 'https'

export default defineEventHandler(async (event) => {
    let apiUrl = ''
    const { query } = getQuery(event)
    let { pos } = getQuery(event)
    if (!pos) 
        apiUrl = `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API_KEY}&q=${query}`
    else
        apiUrl = `https://tenor.googleapis.com/v2/search?key=${process.env.TENOR_API_KEY}&q=${query}&pos=${pos}`
    
    return new Promise((resolve, reject) => {
        https.get(apiUrl, (res) => {
            let data = ''

            res.on('data', (chunk) => {
                data += chunk
            })

            res.on('end', () => {
                resolve(JSON.parse(data))
            })
        }).on('error', (err) => {
            reject(err)
        })
    })
})