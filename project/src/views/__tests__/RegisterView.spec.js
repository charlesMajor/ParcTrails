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
import RegisterView from '../RegisterView.vue'
import routes from '../../router/routes.js'
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
  const VALID_EMAIL = 'test@test.com'
  const VALID_PASSWORD = 'test'
  const VALID_NAME = 'name'

  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn
    })
  })

  describe("Erreur de l'API REST", () => {
    test("Un message d'erreur est affiché lorsque l'API REST retourne une erreur lors de l'authentification.", async () => {
      server.use(...serverError)

      const { getByLabelText, getByText, findByText } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, VALID_PASSWORD)
      fireEvent.update(passwordConfirmationEl, VALID_PASSWORD)
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      expect(await findByText('Internal Server Error')).toBeTruthy()
    })
  })

  describe('Validation du formulaire', () => {
    test('Le champ de courriel est requis.', async () => {
      const { getByLabelText, getByText, findByRole } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(passwordEl, VALID_PASSWORD)
      fireEvent.update(passwordConfirmationEl, VALID_PASSWORD)
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      const errorMessage = await findByRole('alert')
      expect(errorMessage.textContent).toStrictEqual('Ce champ est requis.')
    })
    test('Le champ de courriel est de type courriel.', async () => {
      server.use(...badRequest)

      const { getByLabelText, getByText, findByText } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(emailEl, 'emailWithoutAt')
      fireEvent.update(passwordEl, VALID_PASSWORD)
      fireEvent.update(passwordConfirmationEl, VALID_PASSWORD)
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      expect(await findByText('Bad Request')).toBeTruthy()
    })
    test('Le champ mot de passe est requis.', async () => {
      const { getByLabelText, getByText, findByText } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordConfirmationEl, VALID_PASSWORD)
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      const errorMessage = await findByText('Ce champ est requis.')
      expect(errorMessage).toBeTruthy()
    })
    test('Le champ mot de passe doit avoir au moins 4 charactères.', async () => {
      server.use(...badRequest)

      const { getByLabelText, getByText, findByText } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, '123')
      fireEvent.update(passwordConfirmationEl, '123')
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      expect(await findByText('Bad Request')).toBeTruthy()
    })
    test('Le champ du nom est requis.', async () => {
      const { getByLabelText, getByText, findByRole } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, VALID_PASSWORD)
      fireEvent.update(passwordConfirmationEl, VALID_PASSWORD)

      getByText("M'enregistrer").click()

      const errorMessage = await findByRole('alert')
      expect(errorMessage.textContent).toStrictEqual('Ce champ est requis.')
    })
    test('Le champ mot de passe doit être le même que la confirmation.', async () => {
      const { getByLabelText, getByText, findByRole } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, VALID_PASSWORD)
      fireEvent.update(passwordConfirmationEl, 'anyPassword')
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      const errorMessage = await findByRole('alert')
      expect(errorMessage.textContent).toStrictEqual(
        'Les mots de passes doivent être les mêmes.'
      )
    })
  })

  describe('Navigation', () => {
    test("L'utilisateur est redirigé vers la page 'UserTrails' après un enregistrement réussi.", async () => {
      const { getByLabelText, getByText } = render(RegisterView, {
        global: {
          plugins: [router, pinia]
        }
      })

      const routerSpy = vi.spyOn(router, 'push')

      const emailEl = getByLabelText('Courriel')
      const passwordEl = getByLabelText('Mot de passe')
      const passwordConfirmationEl = getByLabelText('Confirmation mot de passe')
      const nameEl = getByLabelText('Nom')

      fireEvent.update(emailEl, VALID_EMAIL)
      fireEvent.update(passwordEl, VALID_PASSWORD)
      fireEvent.update(passwordConfirmationEl, VALID_PASSWORD)
      fireEvent.update(nameEl, VALID_NAME)

      getByText("M'enregistrer").click()

      waitFor(() =>
        expect(routerSpy).toHaveBeenCalledWith({ name: 'UserTrails' })
      )
    })
  })
})
