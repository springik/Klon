import AWS from 'aws-sdk'

AWS.config.update({
    accessKeyId: process.env.CLOUDCUBE_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDCUBE_SECRET_ACCESS_KEY
})

export const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    endpoint: process.env.CLOUDCUBE_URL,
    s3BucketEndpoint: true
})
export const bucket = process.env.CLOUDCUBE_REGION!