import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const login = (email, password) => api.post('/auth/login', { email, password })
export const register = (data) => api.post('/auth/register', data)

// Generic CRUD
export const getAll = (endpoint) => api.get(endpoint)
export const getById = (endpoint, id) => api.get(`${endpoint}/${id}`)
export const create = (endpoint, data) => api.post(endpoint, data)
export const update = (endpoint, id, data) => api.put(`${endpoint}/${id}`, data)
export const remove = (endpoint, id) => api.delete(`${endpoint}/${id}`)

// AI endpoints
export const runAI = (endpoint) => api.post(endpoint)

export default api
