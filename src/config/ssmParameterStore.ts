import AWS from 'aws-sdk'
import logger from '../utils/logger'

const ssm = new AWS.SSM({
    region: process.env.REGION || process.env.AWS_REGION || 'ap-southeast-2',
    httpOptions: {
        timeout: 5000, // 5 second timeout
        connectTimeout: 3000, // 3 second connection timeout
    },
})

export const fetchSSMConfig = async (
    parameterName: string
): Promise<{ [key: string]: unknown } | void> => {
    try {
        const data = await ssm.getParameter({ Name: parameterName, WithDecryption: true }).promise()
        if (data.Parameter && data.Parameter.Value) {
            logger.info('✅ SSM Parameter configuration fetched successfully.')
            return JSON.parse(data.Parameter.Value)
        }
        logger.error('❌ No parameter value found in SSM')
    } catch (error) {
        logger.error('❌ Error fetching SSM parameter:', error)
    }
}

export const initializeSSMConfiguration = async (): Promise<{ [key: string]: unknown } | null> => {
    const parameterName =
        process.env.AWS_SSM_PARAMETER || '/sourcing/sps/productspecservice/credentials'

    logger.info(`📋 Fetching parameter: ${parameterName}`)

    try {
        const config = await fetchSSMConfig(parameterName)
        if (config) {
            return config
        } else {
            logger.error('❌ Failed to load SSM configuration')
            return null
        }
    } catch (error) {
        logger.error('❌ Error initializing SSM configuration:', error)
        return null
    }
}

export const shouldUseSSM = (): boolean => {
    const environment = process.env.NODE_ENV || 'development'
    return environment === 'production' || environment === 'nonprod'
}
