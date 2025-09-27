import { parseAxiosError } from '../shared/parseAxiosError'
import axiosAuth from '../shared/axiosAuth'
import { API_REST } from '../shared/config'

async function getUserById (userId) {
  try {
    // axiosAuth est une instance d'axios configurée pour ajouter le JWT à une requête nécessitant une authentification.
    // voir le fichier src/shared/axiosAuth.js
    const response = await axiosAuth.get(API_REST + `/api/users/${userId}`)

    return response.data
  } catch (error) {
    throw parseAxiosError(error)
  }
}

export const userService = {
  getUserById
}
