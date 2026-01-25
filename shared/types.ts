// Shared types between frontend and backend

export interface Location {
  lat: number
  lng: number
}

export interface Ward {
  id: number
  name: string
  code: string
  description?: string
}

export interface PollingUnit {
  id: number
  name: string
  code: string
  address?: string
  latitude: number
  longitude: number
  wardId: number
  landmarks?: Landmark[]
}

export interface Landmark {
  id: number
  name: string
  description?: string
  latitude: number
  longitude: number
  category?: string
  distance?: number
}

export type Language = 'en' | 'yo' | 'pcm'





