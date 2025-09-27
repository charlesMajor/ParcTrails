<template>
  <div>
    <!-- :use-global-leaflet="false" est obligatoire pour le moment.
      voir https://github.com/vue-leaflet/vue-leaflet/issues/289 -->
    <l-map
      style="height: 350px"
      :zoom="zoom"
      :center="center"
      :use-global-leaflet="false"
    >
      <l-tile-layer :url="url"></l-tile-layer>
      <l-polyline
        v-for="(polyline, i) in polylines"
        :key="i"
        :lat-lngs="polyline.latlngs"
        :color="polyline.color"
      ></l-polyline>
    </l-map>
  </div>
</template>

<script>
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LPolyline } from '@vue-leaflet/vue-leaflet'
import { useParkStore } from '../stores/parkStore'

const LEVELS = [
  'Très difficile',
  'Difficile',
  'Intermédiaire',
  'Facile',
  'Inconnue'
]
const LEVELS_COLORS = ['red', 'orange', 'blue', 'green', 'grey']

export default {
  name: 'MyMap',
  components: {
    LMap,
    LTileLayer,
    LPolyline
  },
  setup () {
    const parkStore = useParkStore()
    return { parkStore }
  },
  props: {
    updateTrigger: {
      type: Number,
      require: true
    }
  },
  data () {
    return {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      zoom: 8,
      center: [0, 0],
      polylines: []
    }
  },
  methods: {
    levelToColor (level) {
      return LEVELS_COLORS[LEVELS.indexOf(level, 0)]
    },
    loadPolylineSegments () {
      this.polylines = []
      this.parkStore.currentTrail.segments.forEach(segment => {
        this.polylines.push({
          latlngs: segment['coordinates'],
          color: this.levelToColor(segment['level'])
        })
      })
      this.findPolylinesCenter()
    },
    findPolylinesCenter () {
      let nbCoordPoints = 0
      let totalX = 0
      let totalY = 0

      this.polylines.forEach(polyline => {
        nbCoordPoints++
        totalX += polyline.latlngs[Math.ceil(polyline.latlngs.length / 2)][0]
        totalY += polyline.latlngs[Math.ceil(polyline.latlngs.length / 2)][1]
      })

      this.center = [totalX / nbCoordPoints, totalY / nbCoordPoints]
    }
  },
  watch: {
    updateTrigger: function () {
      this.loadPolylineSegments()
    }
  }
}
</script>

<style scoped></style>
