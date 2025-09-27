import { defineStore } from 'pinia'
import { parkService } from '../services/parkService'

export const useParkStore = defineStore('parkStore', {
  state: () => ({
    parks: [],
    trailsForPark: [],
    segmentsForTrail: [],
    currentTrail: { id: '', segments: [] }
  }),
  getters: {
    getParks: state => {
      return state.parks
    },
    getTrails: state => {
      return state.trailsForPark
    },
    getSegments: state => {
      return state.segmentsForTrail
    },
    parksSaved: state => {
      return localStorage.getItem('parks') != null
    },
    getCurrentTrail: state => {
      return state.currentTrail
    }
  },

  actions: {
    async setParks () {
      this.parks = await parkService.getParks()
      localStorage.setItem('parks', JSON.stringify(this.parks))
    },
    async loadParks () {
      if (!this.parksSaved) {
        await this.setParks()
      }
      let storedParks = localStorage.getItem('parks')
      this.parks = JSON.parse(storedParks)
    },
    async setTrailsForPark (parkId) {
      const trailsFromAPI = await parkService.getTrailsForPark(parkId)
      this.trailsForPark.push({ parkId: parkId, trails: trailsFromAPI })
      localStorage.setItem('trailsForPark', JSON.stringify(this.trailsForPark))
    },
    trailsForParkSaved (parkId) {
      const trailsInStockage = JSON.parse(localStorage.getItem('trailsForPark'))
      if (trailsInStockage != null) {
        for (let park of trailsInStockage) {
          if (park.parkId == parkId) {
            return true
          }
        }
      }
      return false
    },
    async getTrailsForPark (parkId) {
      if (!this.trailsForParkSaved(parkId)) {
        await this.setTrailsForPark(parkId)
      }
      this.trailsForPark = JSON.parse(localStorage.getItem('trailsForPark'))
      for (let park of this.trailsForPark) {
        if (park.parkId == parkId) {
          return park.trails
        }
      }
    },
    segmentsForTrailSaved (trailId) {
      const segmentsInStockage = JSON.parse(
        localStorage.getItem('segmentsForTrail')
      )
      if (segmentsInStockage != null) {
        for (let trail of segmentsInStockage) {
          if (trail.trailId == trailId) {
            return true
          }
        }
      }
      return false
    },
    async setSegmentsForTrail (trailId) {
      let currentSegments = []
      for (let park of this.trailsForPark) {
        for (let trail of park.trails) {
          if (trail.id == trailId) {
            for (let segment of trail.segments) {
              const segmentFromAPI = await parkService.getSegmentInfos(segment)
              currentSegments.push(segmentFromAPI)
            }
          }
        }
      }
      this.segmentsForTrail.push({
        trailId: trailId,
        segments: currentSegments
      })
      localStorage.setItem(
        'segmentsForTrail',
        JSON.stringify(this.segmentsForTrail)
      )
    },
    async setCurrentTrail (trailId) {
      if (!this.segmentsForTrailSaved(trailId)) {
        await this.setSegmentsForTrail(trailId)
      }
      this.segmentsForTrail = JSON.parse(
        localStorage.getItem('segmentsForTrail')
      )
      this.currentTrail.id = trailId
      for (let trail of this.segmentsForTrail) {
        if (trail.trailId == trailId) {
          this.currentTrail.segments = trail.segments
        }
      }
    }
  }
})
