<template>
  <div>
    <h1>My trails</h1>
    <p>This page should be accessible only if the user is connected.</p>
    <MyMap />
    <!-- TODO: Props ?!?! -->
  </div>
</template>

<script>
import MyMap from '../components/MyMap.vue'

export default {
  name: 'UserTrailsView',
  components: {
    MyMap
  },
  data () {
    return {}
  }
}
</script>
