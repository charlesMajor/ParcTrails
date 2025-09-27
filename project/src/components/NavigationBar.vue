<template>
  <nav class="navbar navbar-expand-md navbar-dark bg-dark">
    <div class="container-fluid">
      <div class="navbar-nav mr-auto">
        <RouterLink
          class="nav-link"
          :class="{ active: $route.name == 'Parks' }"
          :to="{ name: 'Parks' }"
        >
          Parcs
        </RouterLink>
        <RouterLink
          class="nav-link"
          :class="{ active: $route.name == 'UserTrails' }"
          v-if="isLoggedIn"
          :to="{ name: 'UserTrails' }"
        >
          My trails
        </RouterLink>
      </div>
      <div class="d-flex">
        <div class="navbar-nav ml-auto">
          <div class="nav-link" @click="logout" v-if="isLoggedIn">Log out</div>
          <div class="d-flex" v-else>
            <RouterLink
              class="nav-link"
              :class="{ active: $route.name == 'Login' }"
              :to="{ name: 'Login' }"
            >
              Log in
            </RouterLink>
            <RouterLink
              class="nav-link"
              :class="{ active: $route.name == 'Register' }"
              :to="{ name: 'Register' }"
            >
              Register
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
import { useAuthStore } from '../stores/authStore.js'
import { useLikeStore } from '../stores/likeStore'

export default {
  setup () {
    const authStore = useAuthStore()
    const likeStore = useLikeStore()
    return { authStore, likeStore }
  },
  computed: {
    isLoggedIn () {
      return this.authStore.isLoggedIn
    }
  },
  methods: {
    logout () {
      this.authStore.logout()
      this.likeStore.unsaveUserLikes()
      this.$router.push({
        name: 'Login'
      })
    }
  }
}
</script>
