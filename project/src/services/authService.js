import axios from 'axios'
import { parseAxiosError } from '../shared/parseAxiosError'
import { API_REST } from '../shared/config'

async function getToken (credential) {
  try {
    const response = await axios.post(API_REST + '/api/login', {
      email: credential.email,
      password: credential.password
    })
    const token = response.data.accessToken
    return token
  } catch (error) {
    // Voir la fonction parseAxiosError dans le fichier src/shared/parseAxiosError.js.
    throw parseAxiosError(error)
  }
}

async function register (credential) {
  try {
    const response = await axios.post(API_REST + '/api/register', {
      email: credential.email,
      password: credential.password,
      name: credential.name
    })
    const token = response.data.accessToken
    return token
  } catch (error) {
    throw parseAxiosError(error)
  }
}

export const authService = {
  getToken,
  register
}
