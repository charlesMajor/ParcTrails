<template>
  <div>
    <NavigationBar />
    <RouterView />
  </div>
</template>

<script>
import { RouterView } from 'vue-router'
import NavigationBar from './components/NavigationBar.vue'

export default {
  components: {
    NavigationBar,
    RouterView
  }
}
</script>
