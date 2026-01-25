import express from 'express'
import { supabase } from '../lib/supabase'

const router = express.Router()

// Get all wards
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from('wards')
      .select('id, name, code')
      .order('code')

    if (error) throw error
    res.json(data || [])
  } catch (error: any) {
    next(error)
  }
})

// Get ward by ID or code
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    
    const query = supabase
      .from('wards')
      .select('id, name, code')
      .eq(isUuid ? 'id' : 'code', identifier)
      .single()

    const { data, error } = await query
    
    if (error || !data) {
      return res.status(404).json({ error: 'Ward not found' })
    }
    
    res.json(data)
  } catch (error: any) {
    next(error)
  }
})

// Get polling units for a ward
router.get('/:identifier/polling-units', async (req, res, next) => {
  try {
    const { identifier } = req.params
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    
    // First get the ward
    const { data: ward, error: wardError } = await supabase
      .from('wards')
      .select('id')
      .eq(isUuid ? 'id' : 'code', identifier)
      .single()

    if (wardError || !ward) {
      return res.status(404).json({ error: 'Ward not found' })
    }

    // Get polling units for this ward
    const { data: pollingUnits, error: puError } = await supabase
      .from('polling_units')
      .select('id, name, code, address, latitude, longitude, ward_id, registered_voters')
      .eq('ward_id', ward.id)
      .order('name')

    if (puError) throw puError

    res.json(pollingUnits || [])
  } catch (error: any) {
    next(error)
  }
})

export default router





