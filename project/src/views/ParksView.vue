<template>
  <div class="home container">
    <div class="row">
      <div class="col-3">
        <Loading :active="parksLoading" />
        <select
          name="parks"
          id="parks"
          class="form-select"
          @change="onChangePark"
          v-model="parkId"
          v-show="!parksLoading"
        >
          <option v-for="park in parks" :key="park.id" :value="park.id">
            {{ park.name }}
          </option>
        </select>
        <h3 class="border mb-0 mt-2 text-center">The trails</h3>
        <Loading :active="trailsLoading" />
        <select
          name="trails"
          id="trails"
          class="form-select"
          size="10"
          @change="onChangeTrail($event)"
          v-model="trailId"
          v-show="!trailsLoading"
        >
          <option v-for="trail in trails" :key="trail.id" :value="trail.id">
            {{ trail.name }}
          </option>
        </select>
      </div>
      <div class="col-9">
        <div class="row">
          <div class="col-6 d-inline">
            <p><i class="bi bi-heart"></i></p>
            <button
              name="heartBtn"
              id="heartBtn"
              class="btn"
              @click="likeTrail"
              v-show="!currentTrailLoading"
            >
              <svg
                v-show="!trailLiked"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="red"
                class="bi bi-heart"
                viewBox="0 0 16 16"
              >
                <path
                  d="m8 2.748-.717-.737C5.6.281 2.514.878 1.4 3.053c-.523 1.023-.641 2.5.314 4.385.92 1.815 2.834 3.989 6.286 6.357 3.452-2.368 5.365-4.542 6.286-6.357.955-1.886.838-3.362.314-4.385C13.486.878 10.4.28 8.717 2.01L8 2.748zM8 15C-7.333 4.868 3.279-3.04 7.824 1.143c.06.055.119.112.176.171a3.12 3.12 0 0 1 .176-.17C12.72-3.042 23.333 4.867 8 15z"
                />
              </svg>
              <svg
                v-show="trailLiked"
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                fill="red"
                class="bi bi-heart-fill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314z"
                />
              </svg>
            </button>
            <Loading :active="currentTrailLoading" />
            <span v-show="!currentTrailLoading">
              {{ currentTrailLikes }}
            </span>
          </div>
          <div class="text-end col-6">
            <p class="fw-bold m-0">
              {{ this.currentPark }}
            </p>
            <p class="m-0">
              {{ this.currentTrail }}
            </p>
          </div>
        </div>
        <MyMap v-bind:updateTrigger="this.updateMapTrigger" />
      </div>
    </div>
  </div>
  <div>
    <InfoModal
      :trigger="triggerModal"
      title="Watch out!"
      body="You need to be connected to like a trail"
      confirmButton="Ok"
    />
  </div>
</template>

<script>
import MyMap from '../components/MyMap.vue'
import { useParkStore } from '../stores/parkStore'
import { useToast } from 'vue-toast-notification'
import Loading from 'vue-loading-overlay'
import { useAuthStore } from '../stores/authStore'
import { useLikeStore } from '../stores/likeStore'
import InfoModal from '../components/InfoModal.vue'

export default {
  name: 'ParkView',
  components: {
    MyMap,
    Loading,
    InfoModal
  },
  setup () {
    const parkStore = useParkStore()
    const authStore = useAuthStore()
    const likeStore = useLikeStore()
    return { parkStore, authStore, likeStore }
  },
  data () {
    return {
      trailLiked: false,
      parkId: '',
      trailId: '',
      parks: [],
      trails: [],
      parksLoading: false,
      trailsLoading: false,
      currentTrailLoading: false,
      currentPark: '',
      currentTrail: '',
      currentTrailLikes: 0,
      triggerModal: 0,
      updateMapTrigger: 0
    }
  },
  async created () {
    this.parksLoading = true
    try {
      await this.parkStore.loadParks()
      this.parks = this.parkStore.getParks
      this.parkId = this.parks[0].id
      this.onChangePark()
    } catch (error) {
      useToast().open({
        type: 'error',
        message: 'Error with the service: ' + error.message,
        duration: 6000
      })
    } finally {
      this.parksLoading = false
    }
  },
  methods: {
    async loadTrails () {
      this.trailsLoading = true
      try {
        this.trails = await this.parkStore.getTrailsForPark(this.parkId)
        if (this.trails.length > 0) {
          this.trailId = this.trails[0].id
          await this.setTrail(this.trailId)
        }
      } catch (error) {
        useToast().open({
          type: 'error',
          message: 'Error with the service: ' + error.message,
          duration: 6000
        })
      } finally {
        this.trailsLoading = false
      }
    },
    async onChangePark () {
      await this.loadTrails()
    },
    async onChangeTrail (event) {
      await this.setTrail(event.target.value)
    },
    async setTrail (trailId) {
      this.currentTrailLoading = true
      try {
        await this.parkStore.setCurrentTrail(trailId)
        this.currentTrailLikes = await this.likeStore.getLikesForTrail(trailId)
        if (this.authStore.isLoggedIn) {
          if (this.likeStore.trailIsLikedByUser(trailId)) {
            this.trailLiked = true
          } else {
            this.trailLiked = false
          }
        }
      } catch (error) {
        useToast().open({
          type: 'error',
          message: 'Error with the service: ' + error.message,
          duration: 6000
        })
      } finally {
        this.currentTrailLoading = false
        this.updateMapTrigger++
      }
    },
    async likeTrail () {
      if (this.authStore.isLoggedIn) {
        if (!this.trailLiked) {
          this.currentTrailLoading = true
          try {
            await this.likeStore.addLike(this.authStore.getUserId, this.trailId)
            this.currentTrailLikes = await this.likeStore.getLikesForTrail(
              this.trailId
            )
            this.trailLiked = true
          } catch (error) {
            useToast().open({
              type: 'error',
              message: 'Error with the service: ' + error.message,
              duration: 6000
            })
          } finally {
            this.currentTrailLoading = false
          }
        } else {
          this.currentTrailLoading = true
          try {
            await this.likeStore.removeLike(
              this.authStore.getUserId,
              this.trailId
            )
            this.currentTrailLikes = await this.likeStore.getLikesForTrail(
              this.trailId
            )
            this.trailLiked = false
          } catch (error) {
            useToast().open({
              type: 'error',
              message: 'Error with the service: ' + error.message,
              duration: 6000
            })
          } finally {
            this.currentTrailLoading = false
          }
        }
      } else {
        this.triggerModal++
      }
    }
  },
  watch: {
    parkId: function () {
      this.currentPark = this.parks.find(({ id }) => id === this.parkId).name
    },
    trailId: function () {
      this.currentTrail = this.trails.find(({ id }) => id === this.trailId).name
    }
  }
}
</script>
