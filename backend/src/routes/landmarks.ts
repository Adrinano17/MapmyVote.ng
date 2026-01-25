import express from 'express'
import { extractLandmarksAlongRoute, getLandmarksNearPoint } from '../services/landmark-extractor'

const router = express.Router()

/**
 * POST /api/landmarks/route
 * Extract landmarks along a route
 */
router.post('/route', async (req, res, next) => {
  try {
    const { routePoints, radius } = req.body

    if (!routePoints || !Array.isArray(routePoints) || routePoints.length < 2) {
      return res.status(400).json({
        error: 'Route points array with at least 2 points is required',
      })
    }

    const landmarks = await extractLandmarksAlongRoute(routePoints, radius || 50)

    res.json({
      landmarks,
      count: landmarks.length,
    })
  } catch (error: any) {
    next(error)
  }
})

/**
 * POST /api/landmarks/near
 * Get landmarks near a specific point
 */
router.post('/near', async (req, res, next) => {
  try {
    const { latitude, longitude, radius } = req.body

    if (!latitude || !longitude || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return res.status(400).json({
        error: 'Valid latitude and longitude are required',
      })
    }

    const landmarks = await getLandmarksNearPoint(
      { lat: latitude, lng: longitude },
      radius || 100
    )

    res.json({
      landmarks,
      count: landmarks.length,
    })
  } catch (error: any) {
    next(error)
  }
})

export default router
















