import { Router } from 'express'
import * as messageController from '../controllers/messageController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// Message routes
router.get('/conversations', verifyToken, messageController.getConversations)
router.get('/conversations/:conversationId', verifyToken, messageController.getConversationMessages)
router.post('/send', verifyToken, messageController.sendMessage)

export default router
