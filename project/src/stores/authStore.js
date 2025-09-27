import { defineStore } from 'pinia'
import { authService } from '../services/authService'
import jwtDecode from 'jwt-decode'

export const useAuthStore = defineStore('authStoreId', {
  state: () => ({
    token: '',
    authServiceError: ''
  }),
  getters: {
    isLoggedIn: state => {
      return !!state.token // Que veut dire "!!" ? voir https://stackoverflow.com/questions/784929/what-is-the-not-not-operator-in-javascript
    },
    getUserId: state => {
      const payload = jwtDecode(state.token)
      const userId = payload.sub
      return userId
    },
    isTokenExpired: state => {
      if (state.token != null) {
        const payload = jwtDecode(state.token)
        const expiration = payload.exp
        const now = new Date().getTime() / 1000
        return expiration < now
      }
      return false
    }
  },

  actions: {
    clearError () {
      this.authServiceError = ''
    },
    logout () {
      this.token = ''
      localStorage.removeItem('token')
    },
    loadPersistedToken () {
      this.token = localStorage.getItem('token')
    },
    refreshToken () {
      // Dans le contexte du cours, on va simplement considérer que le jeton est toujours valide car notre API REST ne gère pas le rafraîchissement de jeton. Si c'était le cas, on ferait ici la demande avec le jeton de rafraîchissement pour obtenir un nouveau token + nouveau jeton de rafraîchissement (voir dans les notes de cours la section jeton de rafraîchissement).
      this.logout()
    },

    async login (credential) {
      try {
        this.clearError()
        this.token = await authService.getToken(credential)
        localStorage.setItem('token', this.token)
      } catch (error) {
        this.authServiceError = error.message
      }
    },
    async register (credential) {
      try {
        this.clearError()
        this.token = await authService.register(credential)
        localStorage.setItem('token', this.token)
      } catch (error) {
        this.authServiceError = error.message
      }
    }
  }
})
