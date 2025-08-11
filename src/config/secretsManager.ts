import AWS from 'aws-sdk'
import logger from '../utils/logger'

const secretsManager = new AWS.SecretsManager({
    region: process.env.REGION || process.env.AWS_REGION || 'ap-southeast-2',
    httpOptions: {
        timeout: 5000, // 5 second timeout
        connectTimeout: 3000, // 3 second connection timeout
    },
})

export const fetchSecret = async (secretName: string): Promise<any | null> => {
    try {
        logger.info(`Fetching secret from AWS Secrets Manager: ${secretName}`)

        const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise()
        if (data.SecretString) {
            const parsedSecret = JSON.parse(data.SecretString)
            logger.info('✅ Secrets fetched successfully from AWS Secrets Manager')
            return parsedSecret
        } else if (data.SecretBinary) {
            // binary
            const buff = Buffer.from(data.SecretBinary as string, 'base64')
            const parsedSecret = JSON.parse(buff.toString('ascii'))
            logger.info('✅ Binary secrets fetched successfully from AWS Secrets Manager')
            return parsedSecret
        } else {
            logger.error('❌ No secret string or binary found in Secrets Manager response')
            return null
        }
    } catch (error) {
        logger.error('❌ Error fetching secret from AWS Secrets Manager:', error)
        return null
    }
}

export const initializeSecretsManagerCredentials = async (
    secretName: string
): Promise<any | null> => {
    try {
        const credentials = await fetchSecret(secretName)
        if (credentials) {
            return credentials
        } else {
            logger.error('❌ Failed to load credentials from AWS Secrets Manager')
            return null
        }
    } catch (error) {
        logger.error('❌ Error initializing AWS Secrets Manager:', error)
        return null
    }
}

export const shouldUseSecretsManager = (): boolean => {
    const environment = process.env.NODE_ENV || 'development'
    return environment === 'production' || environment === 'nonprod'
}
