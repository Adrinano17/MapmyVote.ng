import express from 'express'
import { supabase } from '../lib/supabase'

const router = express.Router()

// Get all polling units with optional search
router.get('/', async (req, res, next) => {
  try {
    const { search, ward } = req.query
    
    let query = supabase
      .from('polling_units')
      .select('*, ward:wards(*)')
      .order('name')

    if (search && typeof search === 'string') {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,address.ilike.%${search}%`)
    }

    if (ward && typeof ward === 'string') {
      const { data: wardData } = await supabase
        .from('wards')
        .select('id')
        .eq('code', ward)
        .single()
      
      if (wardData) {
        query = query.eq('ward_id', wardData.id)
      }
    }

    const { data, error } = await query

    if (error) throw error
    res.json(data || [])
  } catch (error: any) {
    next(error)
  }
})

// Get polling unit by ID or code
router.get('/:identifier', async (req, res, next) => {
  try {
    const { identifier } = req.params
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier)
    
    const { data: pollingUnit, error } = await supabase
      .from('polling_units')
      .select('*, ward:wards(*)')
      .eq(isUuid ? 'id' : 'code', identifier)
      .single()
    
    if (error || !pollingUnit) {
      return res.status(404).json({ error: 'Polling unit not found' })
    }

    res.json(pollingUnit)
  } catch (error: any) {
    next(error)
  }
})

export default router





