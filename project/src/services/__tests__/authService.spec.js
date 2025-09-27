import { describe, test, expect, afterAll, afterEach, beforeAll } from 'vitest'
import { setupServer } from 'msw/node'
import {
  success,
  networkError,
  badRequest,
  serverError
} from '../../tests/mocks/handlers'
import { authService } from '../authService'
import { tokens } from '../../tests/data/tokens'

const server = setupServer(...success)

beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterAll(() => server.close())
afterEach(() => server.resetHandlers())

describe('authService', () => {
  describe('getToken', () => {
    describe('getToken - gestion des succes', () => {
      test("Doit renvoyer un jeton lorsque les informations d'identification sont valides.", async () => {
        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        const response = await authService.getToken(credential)
        expect(response).toEqual(tokens[0].accessToken)
      })
    })
    describe('getToken - gestion des erreurs', () => {
      test("En cas d'erreur de réseau doit générer une erreur d'application.", async () => {
        server.use(...networkError)

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }

        try {
          await authService.getToken(credential)
          expect.fail()
        } catch (error) {
          expect(error.toString()).toBe(
            'Error: Erreur réseau. Impossible de communiquer avec le serveur.'
          )
        }
      })
      test("En cas d'erreur 400 (mauvaise requête) doit générer une erreur d'application.", async () => {
        server.use(...badRequest)

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        try {
          await authService.getToken(credential)
          expect.fail()
        } catch (error) {
          expect(error.toString()).toBe('Error: Bad Request')
        }
      })
      test("En cas d'erreur 500 (erreur sur serveur) doit générer une erreur d'application.", async () => {
        server.use(...serverError)

        const credential = {
          email: 'test@test.com',
          password: 'test'
        }
        try {
          await authService.getToken(credential)
          expect.fail()
        } catch (error) {
          expect(error.toString()).toBe('Error: Internal Server Error')
        }
      })
    })
  })

  describe('register', () => {
    describe('register - gestion des succes', () => {
      test("Doit renvoyer un jeton lorsque les informations d'identification sont valides.", async () => {
        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }
        const response = await authService.register(credential)
        expect(response).toEqual(tokens[0].accessToken)
      })
    })
    describe('register - gestion des erreurs', () => {
      test("En cas d'erreur de réseau doit générer une erreur d'application.", async () => {
        server.use(...networkError)

        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }

        try {
          await authService.register(credential)
          expect.fail()
        } catch (error) {
          expect(error.toString()).toBe(
            'Error: Erreur réseau. Impossible de communiquer avec le serveur.'
          )
        }
      })
      test("En cas d'erreur 400 (mauvaise requête) doit générer une erreur d'application.", async () => {
        server.use(...badRequest)

        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }
        try {
          await authService.register(credential)
          expect.fail()
        } catch (error) {
          expect(error.toString()).toBe('Error: Bad Request')
        }
      })
      test("En cas d'erreur 500 (erreur sur serveur) doit générer une erreur d'application", async () => {
        server.use(...serverError)

        const credential = {
          email: 'test@test.com',
          password: 'test',
          name: 'name'
        }
        try {
          await authService.register(credential)
          expect.fail()
        } catch (error) {
          expect(error.toString()).toBe('Error: Internal Server Error')
        }
      })
    })
  })
})
