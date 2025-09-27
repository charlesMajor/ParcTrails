import {
  describe,
  test,
  expect,
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  vi
} from 'vitest'
import { setupServer } from 'msw/node'
import {
  success,
  networkError,
  badRequest,
  unauthorized,
  serverError
} from '../../tests/mocks/handlers'
import { users } from '../../tests/data/users'
import { userService } from '../userService'
import { tokens } from '../../tests/data/tokens'
import { useAuthStore } from '../../stores/authStore.js'
import { createTestingPinia } from '@pinia/testing'

const server = setupServer(...success)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('userService', () => {
  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn
    })

    const authStore = useAuthStore()
    authStore.token = tokens[0].accessToken
    pinia.use(authStore)
  })

  describe('getUserById - Gestion des succès.', () => {
    test("getUserById doit retourner le user associé à l'id donné (200).", async () => {
      const user = users[0]
      const userId = user.id

      const response = await userService.getUserById(userId)

      expect(response).toStrictEqual(user)
    })
  })
  describe('getUserById - Gestion des erreurs.', () => {
    test("getUserById doit générer une erreur d'application s'il y a une erreur de réseau.", async () => {
      server.use(...networkError)

      const anyUserId = users[0].id

      try {
        await userService.getUserById(anyUserId)
        expect.fail()
      } catch (error) {
        expect(error.toString()).toBe(
          'Error: Erreur réseau. Impossible de communiquer avec le serveur.'
        )
      }
    })

    test("getUserById doit générer une erreur d'application s'il y a une erreur 400 (mauvaise requête).", async () => {
      server.use(...badRequest)

      const anyUserId = users[0].id

      try {
        await userService.getUserById(anyUserId)
        expect.fail()
      } catch (error) {
        expect(error.toString()).toBe('Error: Bad Request')
      }
    })

    test("getUserById doit générer une erreur d'application s'il y a une erreur 401 (non autorisé).", async () => {
      server.use(...unauthorized)

      const anyUserId = users[0].id

      try {
        await userService.getUserById(anyUserId)
        expect.fail()
      } catch (error) {
        expect(error.toString()).toBe('Error: Unauthorized')
      }
    })

    test("getUserById doit générer une erreur d'application s'il y a une erreur 500 (erreur sur serveur).", async () => {
      server.use(...serverError)

      const anyUserId = users[0].id

      try {
        await userService.getUserById(anyUserId)
        expect.fail()
      } catch (error) {
        expect(error.toString()).toBe('Error: Internal Server Error')
      }
    })
  })
})
