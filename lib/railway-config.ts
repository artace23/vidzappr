export const RAILWAY_API_URL = process.env.NEXT_PUBLIC_RAILWAY_API_URL || 'http://localhost:3000'

export const API_ENDPOINTS = {
  analyze: `${RAILWAY_API_URL}/api/analyze`,
  download: `${RAILWAY_API_URL}/api/download`,
  health: `${RAILWAY_API_URL}/api/health`
} 