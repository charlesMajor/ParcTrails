import { defineStore } from 'pinia'
import { likeService } from '../services/likeService'

export const useLikeStore = defineStore('likeStore', {
  state: () => ({
    likesForTrail: []
  }),
  getters: {},

  actions: {
    async saveUserLikes (userId) {
      const userLikes = await likeService.getLikesFromUser(userId)
      localStorage.setItem('userLikes', JSON.stringify(userLikes))
    },
    unsaveUserLikes () {
      localStorage.removeItem('userLikes')
    },
    likesForTrailSaved (trailId) {
      const likesInStockage = JSON.parse(localStorage.getItem('likesForTrail'))
      if (likesInStockage != null) {
        for (let trail of likesInStockage) {
          if (trail.id == trailId) {
            return true
          }
        }
      }
      return false
    },
    async setLikesForTrail (trailId) {
      const likes = await likeService.getLikesForTrail(trailId)
      this.likesForTrail.push({ id: trailId, likes: likes.length })
      localStorage.setItem('likesForTrail', JSON.stringify(this.likesForTrail))
    },
    async getLikesForTrail (trailId) {
      if (!this.likesForTrailSaved(trailId)) {
        await this.setLikesForTrail(trailId)
      }
      this.likesForTrail = JSON.parse(localStorage.getItem('likesForTrail'))
      for (let trail of this.likesForTrail) {
        if (trail.id == trailId) {
          return trail.likes
        }
      }
    },
    async updateLikesForTrail (trailId) {
      for (let trail of this.likesForTrail) {
        if (trail.id == trailId) {
          const likes = await likeService.getLikesForTrail(trail.id)
          trail.likes = likes.length
        }
      }
      localStorage.setItem('likesForTrail', JSON.stringify(this.likesForTrail))
    },
    async addLike (userId, trailId) {
      let likeAlreadyExists = false
      const userLikes = JSON.parse(localStorage.getItem('userLikes'))
      if (userLikes != null) {
        for (let like of userLikes) {
          if (like.trailId == trailId) {
            likeAlreadyExists = true
          }
        }
      }

      if (!likeAlreadyExists) {
        await likeService.addLikeForTrail(userId, trailId)
      }
      await this.updateLikesForTrail(trailId)
      this.saveUserLikes(userId)
    },
    async removeLike (userId, trailId) {
      const userLikes = JSON.parse(localStorage.getItem('userLikes'))
      if (userLikes != null) {
        for (let like of userLikes) {
          if (like.trailId == trailId) {
            await likeService.removeLikeForTrail(like.id)
          }
        }
      }
      await this.updateLikesForTrail(trailId)
      this.saveUserLikes(userId)
    },
    trailIsLikedByUser (trailId) {
      const userLikes = JSON.parse(localStorage.getItem('userLikes'))
      if (userLikes != null) {
        for (let like of userLikes) {
          if (like.trailId == trailId) {
            return true
          }
        }
      }
      return false
    }
  }
})
