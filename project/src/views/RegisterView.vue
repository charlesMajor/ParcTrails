<template>
  <div>
    <h1>Register</h1>
    <div class="container my-5">
      <div class="row justify-content-center">
        <Form @submit="register">
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
          <div class="mb-3">
            <label class="form-label" for="confirmation-password-input"
              >Confirmation mot de passe</label
            >
            <Field
              class="form-control"
              id="confirmation-password-input"
              name="confirmation-password-input"
              type="password"
              :rules="isPasswordConfirmed"
              v-model="confirmation_password"
            />
            <ErrorMessage
              class="text-danger"
              name="confirmation-password-input"
            />
          </div>
          <div class="mb-3">
            <label class="form-label" for="name-input">Name</label>
            <Field
              class="form-control"
              id="name-input"
              name="name-input"
              type="text"
              :rules="isRequired"
              v-model="name"
            />
            <ErrorMessage class="text-danger" name="name-input" />
          </div>
          <div class="p-3 mb-2 bg-danger text-white" v-if="authServiceError">
            {{ authServiceError }}
          </div>
          <button class="btn btn-primary" type="submit">Register</button>
        </Form>
      </div>
    </div>
  </div>
</template>
<script>
import { Field, Form, ErrorMessage } from 'vee-validate'
import { useAuthStore } from '../stores/authStore.js'

export default {
  components: {
    Field,
    // eslint-disable-next-line vue/no-reserved-component-names
    Form,
    ErrorMessage
  },
  setup () {
    const authStore = useAuthStore()
    return { authStore }
  },
  created () {
    this.authStore.clearError()
  },
  data () {
    return {
      email: '',
      password: '',
      confirmation_password: '',
      name: ''
    }
  },
  methods: {
    async register () {
      await this.authStore.register({
        email: this.email,
        password: this.password,
        name: this.name
      })
      if (this.authStore.isLoggedIn) {
        this.$router.push({
          name: 'UserTrails'
        })
      }
    },
    isRequired (value) {
      if (!value) {
        return 'This field is required.'
      }
      return true
    },
    isPasswordConfirmed () {
      if (this.password != this.confirmation_password) {
        return 'Both entries must be the same.'
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
