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
import { success, badRequest } from '../../tests/mocks/handlers'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '../authStore'
import jwtDecode from 'jwt-decode'
import { tokens } from '../../tests/data/tokens'

const server = setupServer(...success)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('authStore', () => {
  let pinia

  beforeEach(() => {
    pinia = createTestingPinia({
      stubActions: false,
      createSpy: vi.fn
    })

    const authStore = useAuthStore()
    pinia.use(authStore)
  })

  describe('getters', () => {
    test('isLoggedIn devrait retourner false au départ', async () => {
      const authStore = useAuthStore()

      expect(authStore.isLoggedIn).toEqual(false)
    })
    test('isLoggedIn devrait retourner true si le token est présent', async () => {
      const authStore = useAuthStore()
      authStore.token = tokens[0]

      expect(authStore.isLoggedIn).toEqual(true)
    })
    test("getUserId devrait retourner le id de l'utilisateur qui est dans le jeton", async () => {
      const token = tokens[0].accessToken

      const authStore = useAuthStore()
      authStore.token = token

      const id = jwtDecode(token).sub
      expect(authStore.getUserId).toEqual(id)
    })
  })

  describe('actions', () => {
    describe('persistence', () => {
      test('loadPersistedToken doit charger le token du local storage dans le store', async () => {
        const token = tokens[0].accessToken
        const payload = jwtDecode(token)
        const expiration = payload.exp
        const returnedDate = expiration - 10

        vi.spyOn(Date.prototype, 'getTime').mockReturnValue(returnedDate)
        vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(token)

        const authStore = useAuthStore()
        authStore.loadPersistedToken()

        expect(authStore.token).toEqual(token)
      })
      test('login doit stocker le token dans le local storage', async () => {
        const spyLocalStorageSetItem = vi.spyOn(Storage.prototype, 'setItem')
        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        await authStore.login(credential)
        const token = tokens[0]

        expect(spyLocalStorageSetItem).toHaveBeenCalledWith(
          'token',
          token.accessToken
        )
      })
      test('register doit stocker le token dans le local storage', async () => {
        const spyLocalStorageSetItem = vi.spyOn(Storage.prototype, 'setItem')
        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }
        await authStore.register(credential)
        const token = tokens[0]

        expect(spyLocalStorageSetItem).toHaveBeenCalledWith(
          'token',
          token.accessToken
        )
      })
      test('logout doit supprimer le token du local storage', async () => {
        const spyLocalStorageRemoveItem = vi.spyOn(
          Storage.prototype,
          'removeItem'
        )
        const authStore = useAuthStore()

        authStore.logout()

        expect(spyLocalStorageRemoveItem).toHaveBeenCalledWith('token')
      })
    })
    describe('login', () => {
      test('Doit stocker le token dans le store', async () => {
        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        await authStore.login(credential)
        const expectedToken = tokens[0].accessToken

        expect(authStore.token).toEqual(expectedToken)
      })
      test("login doit effacer le message d'erreur", async () => {
        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        await authStore.login(credential)

        expect(authStore.authServiceError).toEqual('')
      })
    })
    describe('register', () => {
      test('Doit stocker le token dans le store', async () => {
        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }
        await authStore.register(credential)
        const expectedToken = tokens[0].accessToken

        expect(authStore.token).toEqual(expectedToken)
      })
      test("register doit effacer le message d'erreur", async () => {
        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }
        await authStore.register(credential)

        expect(authStore.authServiceError).toEqual('')
      })
    })
    describe('logout', () => {
      test('logout doit supprimer le token du store', async () => {
        const authStore = useAuthStore()

        authStore.token = tokens[0].accessToken
        authStore.logout()

        expect(authStore.token).toEqual('')
      })
    })
    describe('gestion des erreurs', () => {
      test("Si erreur dans login, doit stocker l'erreur dans le store", async () => {
        server.use(...badRequest)

        const authStore = useAuthStore()

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        await authStore.login(credential)

        expect(authStore.authServiceError).toEqual('Bad Request')
      })
      test("clearError doit effacer l'erreur dans le store", async () => {
        const authStore = useAuthStore()
        authStore.authServiceError = 'Bad Request'

        authStore.clearError()

        expect(authStore.authServiceError).toEqual('')
      })
    })
  })
})
