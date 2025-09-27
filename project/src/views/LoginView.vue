<template>
  <div>
    <h1>Log in</h1>
    <div class="container my-5">
      <div class="row justify-content-center">
        <Form @submit="login">
          <div class="mb-3">
            <label class="form-label" for="email-input">Email</label>
            <Field
              class="form-control"
              id="email-input"
              name="email-input"
              type="email"
              :rules="isRequired"
              v-model="email"
            />
            <ErrorMessage class="text-danger" name="email-input" />
          </div>
          <div class="mb-3">
            <label class="form-label" for="password-input">Password</label>
            <Field
              class="form-control"
              id="password-input"
              name="password-input"
              type="password"
              :rules="isRequired"
              v-model="password"
            />
            <ErrorMessage class="text-danger" name="password-input" />
          </div>
          <div class="p-3 mb-2 bg-danger text-white" v-if="authServiceError">
            {{ authServiceError }}
          </div>
          <button class="btn btn-primary" type="submit">Log in</button>
        </Form>
      </div>
    </div>
  </div>
</template>
<script>
import { Field, Form, ErrorMessage } from 'vee-validate'
import { useAuthStore } from '../stores/authStore.js'
import { useLikeStore } from '../stores/likeStore.js'

export default {
  components: {
    Field,
    // eslint-disable-next-line vue/no-reserved-component-names
    Form,
    ErrorMessage
  },
  setup () {
    const authStore = useAuthStore()
    const likeStore = useLikeStore()
    return { authStore, likeStore }
  },
  created () {
    this.authStore.clearError()
  },
  data () {
    return {
      email: '',
      password: ''
    }
  },
  methods: {
    async login () {
      await this.authStore.login({
        email: this.email,
        password: this.password
      })
      if (this.authStore.isLoggedIn) {
        this.likeStore.saveUserLikes(this.authStore.getUserId)
        this.$router.push({
          name: 'UserTrails'
        })
      }
    },
    isRequired (value) {
      if (!value) {
        return 'This Field is required.'
      }
      return true
    }
  },
  computed: {
    authServiceError () {
      return this.authStore.authServiceError
    }
  }
}
</script>
