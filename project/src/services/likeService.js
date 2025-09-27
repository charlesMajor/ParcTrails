import { parseAxiosError } from '../shared/parseAxiosError'
import axiosAuth from '../shared/axiosAuth'
import { API_REST } from '../shared/config'

async function getLikesForTrail (trailId) {
  try {
    const { data } = await axiosAuth.get(
      `${API_REST}/trails/` + trailId + `/likes`
    )
    return data
  } catch (error) {
    throw parseAxiosError(error)
  }
}

async function getLikesFromUser (userId) {
  try {
    const { data } = await axiosAuth.get(
      `${API_REST}/users/` + userId + `/likes`
    )
    return data
  } catch (error) {
    throw parseAxiosError(error)
  }
}

async function addLikeForTrail (userId, trailId) {
  try {
    await axiosAuth.post(`${API_REST}/likes`, {
      userId: parseInt(userId),
      trailId: parseInt(trailId)
    })
  } catch (error) {
    throw parseAxiosError(error)
  }
}

async function removeLikeForTrail (likeId) {
  try {
    await axiosAuth.delete(`${API_REST}/likes/${likeId}`)
  } catch (error) {
    throw parseAxiosError(error)
  }
}

export const likeService = {
  getLikesForTrail,
  getLikesFromUser,
  addLikeForTrail,
  removeLikeForTrail
}
