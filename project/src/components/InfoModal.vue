<template>
  <div
    class="modal fade"
    id="info-modal"
    tabindex="-1"
    aria-labelledby="info-modal"
    aria-hidden="true"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button
            type="button"
            data-bs-dismiss="modal"
            class="btn-close"
            aria-label="Close"
          ></button>
        </div>
        <div class="modal-body">
          {{ body }}
        </div>
        <div class="modal-footer">
          <button type="button" data-bs-dismiss="modal" class="btn btn-primary">
            {{ confirmButton }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Modal } from 'bootstrap'

export default {
  props: {
    trigger: Number,
    title: String,
    body: String,
    confirmButton: String
  },
  data () {
    return {
      modal: null
    }
  },
  async mounted () {
    this.modal = new Modal('#info-modal')
  },
  watch: {
    trigger () {
      this.modal.show()
    }
  }
}
</script>
