import { api } from './api'

export const authService = {
  async login(email, accessCode) {
    try {
      console.log('Login Payload:', { email, access_code: accessCode })
      // Send exactly what Laravel's AuthenticatedSessionController expects
      const response = await api.post('/login', { email, access_code: accessCode })
      const token = response.data.token || response.data.access_token

      if (token) {
        // Set token so the interceptor uses it immediately for the /user call
        localStorage.setItem('token', token)
      } else {
        // Optionnel : au cas où le backend utilise des cookies HttpOnly (Sanctum SPA)
      }

      // Fetch user data
      const userResponse = await api.get('/user')
      
      return { 
        success: true, 
        user: userResponse.data, 
        token 
      }
    } catch (error) {
      console.error('Login Error Response:', error.response?.data)
      return { 
        success: false, 
        message: error.response?.data?.message || 'Email ou code d\'accès invalide' 
      }
    }
  },

  async logout() {
    try {
      await api.post('/logout')
    } catch (error) {
      console.error('Erreur lors de la déconnexion API', error)
    }
    localStorage.removeItem('token')
    return { success: true }
  }
}
