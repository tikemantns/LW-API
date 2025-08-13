import { Router } from 'express'
import * as workController from '../controllers/workController'
import { verifyToken, optionalAuth } from '../middleware/auth'

const router = Router()

// Work management routes
router.get('/', optionalAuth, workController.getWorks)
router.get('/categories', workController.getWorkCategories)
router.post('/', verifyToken, workController.createWork)
router.get('/my-works', verifyToken, workController.getMyWorks)
router.get('/applied', verifyToken, workController.getAppliedWorks)
router.get('/:workId', workController.getWorkById)
router.put('/:workId', verifyToken, workController.updateWork)
router.delete('/:workId', verifyToken, workController.deleteWork)
router.post('/:workId/apply', verifyToken, workController.applyToWork)

export default router
