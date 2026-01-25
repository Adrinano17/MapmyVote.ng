import express from 'express'
import { Client, TravelMode } from '@googlemaps/google-maps-services-js'

const router = express.Router()
const client = new Client({})

router.post('/', async (req, res, next) => {
  try {
    const { origin, destination } = req.body

    if (!origin || !destination || !origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      return res.status(400).json({ error: 'Origin and destination with lat/lng are required' })
    }

    if (!process.env.GOOGLE_MAPS_API_KEY) {
      return res.status(500).json({ error: 'Google Maps API key not configured' })
    }

    const response = await client.directions({
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        mode: TravelMode.walking,
        key: process.env.GOOGLE_MAPS_API_KEY,
      },
    })

    if (response.data.status !== 'OK') {
      return res.status(400).json({ error: 'Directions not found', status: response.data.status })
    }

    res.json({
      routes: response.data.routes,
      status: response.data.status,
    })
  } catch (error: any) {
    next(error)
  }
})

export default router





