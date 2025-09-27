import { render, cleanup, fireEvent, waitFor } from '@testing-library/vue'
import {
  expect,
  describe,
  afterEach,
  test,
  beforeAll,
  vi,
  beforeEach,
  afterAll
} from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../LoginView.vue'
import routes from '../../router/routes.js'
import { useAuthStore } from '../../stores/authStore.js'
import { createTestingPinia } from '@pinia/testing'
import { setupServer } from 'msw/node'
import { badRequest, serverError, success } from '../../tests/mocks/handlers'

let router
const server = setupServer(...success)

beforeAll(() => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes
  })
  server.listen({ onUnhandledRequest: 'error' })
})

afterAll(() => server.close())

afterEach(() => {
  cleanup()
  server.resetHandlers()
})

describe('LoginView', () => {
  const mockErrorMessage = 'Mock error message.'
  const VALID_EMAIL = 'test@test.com'
  const VALID_PASSWORD = 'test'

  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn
    })

    const authStore = useAuthStore()
    authStore.authServiceError = mockErrorMessage
  })

  describe("Erreur de l'API REST", () => {
    test("Un message d'erreur est affiché lorsque l'API REST retourne une erreur lors de l'authentification.", async () => {
      server.use(...serverError)

      const { getByLabelText, getByText, findByText } = render(LoginView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, VALID_PASSWORD)

      getByText('Se connecter').click()

      expect(await findByText('Internal Server Error')).toBeTruthy()
    })
  })

  describe('Validation du formulaire', () => {
    test('Le champ de courriel est requis.', async () => {
      const { getByLabelText, getByText, findByRole } = render(LoginView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const passwordEl = getByLabelText('Mot de passe')

      fireEvent.update(passwordEl, VALID_PASSWORD)

      getByText('Se connecter').click()

      const errorMessage = await findByRole('alert')
      expect(errorMessage.textContent).toStrictEqual('Ce champ est requis.')
    })

    test('Le champ de courriel est de type courriel.', async () => {
      server.use(...badRequest)

      const { getByLabelText, getByText, findByText } = render(LoginView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')

      fireEvent.update(emailEl, 'emailWithoutAt')
      fireEvent.update(passwordEl, VALID_PASSWORD)

      getByText('Se connecter').click()

      expect(await findByText('Bad Request')).toBeTruthy()
    })

    test('Le champ mot de passe est requis.', async () => {
      const { getByLabelText, getByText, findByRole } = render(LoginView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')

      fireEvent.update(emailEl, VALID_EMAIL)

      getByText('Se connecter').click()

      const errorMessage = await findByRole('alert')
      expect(errorMessage.textContent).toStrictEqual('Ce champ est requis.')
    })

    test('Le champ mot de passe doit avoir au moins 4 charactères.', async () => {
      server.use(...badRequest)

      const { getByLabelText, getByText, findByText } = render(LoginView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, '123')

      getByText('Se connecter').click()

      expect(await findByText('Bad Request')).toBeTruthy()
    })
  })

  describe('Navigation', () => {
    test("L'utilisateur est redirigé vers la page 'UserTrails' après une connexion réussie.", async () => {
      const { getByLabelText, getByText } = render(LoginView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const routerSpy = vi.spyOn(router, 'push')

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, VALID_PASSWORD)

      getByText('Se connecter').click()

      waitFor(() =>
        expect(routerSpy).toHaveBeenCalledWith({ name: 'UserTrails' })
      )
    })
  })
})
