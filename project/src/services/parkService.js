import axiosAuth from '../shared/axiosAuth'
import { API_REST } from '../shared/config'
import { parseAxiosError } from '../shared/parseAxiosError'

async function getParks () {
  try {
    const { data } = await axiosAuth.get(`${API_REST}/parks`)
    return data
  } catch (error) {
    throw parseAxiosError(error)
  }
}

async function getTrailsForPark (parkId) {
  try {
    const { data } = await axiosAuth.get(`${API_REST}/parks/${parkId}/trails`)
    return data
  } catch (error) {
    throw parseAxiosError(error)
  }
}

async function getSegmentInfos (segmentId) {
  try {
    const { data } = await axiosAuth.get(`${API_REST}/segments/${segmentId}`)
    return data
  } catch (error) {
    throw parseAxiosError(error)
  }
}

export const parkService = {
  getParks,
  getTrailsForPark,
  getSegmentInfos
}
