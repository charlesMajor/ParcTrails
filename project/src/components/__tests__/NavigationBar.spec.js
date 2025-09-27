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
import { render, cleanup, fireEvent, waitFor } from '@testing-library/vue'
import NavigationBar from '../NavigationBar.vue'
import { createTestingPinia } from '@pinia/testing'
import { useAuthStore } from '../../stores/authStore'
import jwtDecode from 'jwt-decode'
import { tokens } from '../../tests/data/tokens'
import { createRouter, createWebHistory } from 'vue-router'
import routes from '../../router/routes.js'
import index from '../../router/index.js'

beforeEach(() => {})
afterEach(() => {
  cleanup()
})

describe('NavigationBar', () => {
  describe('utilisateur non connecté', () => {
    test("L'option Connexion est visible mais pas Se déconnecter", async () => {
      const router = createRouter({
        history: createWebHistory(),
        routes: routes
      })
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      const { queryByText, getByText } = await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })

      getByText('Connexion')
      const deconnecterEl = await queryByText('Se déconnecter')
      expect(deconnecterEl).toBeNull()
    })
    test('Doit pouvoir naviguer vers la page Connexion', async () => {
      const router = createRouter({
        history: createWebHistory(),
        routes: routes
      })
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      const { getByText } = await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })
      const routerSpy = vi.spyOn(router, 'push')

      await fireEvent.click(getByText('Connexion'))

      expect(routerSpy).toHaveBeenCalledWith({ name: 'Login' })
    })
    test("Naviguer vers la page 'Mes sentiers' redirige sur la page connexion", async () => {
      const router = index
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })
      const routerSpy = vi.spyOn(router, 'push')

      router.push({ name: 'UserTrails' })

      waitFor(() => expect(routerSpy).toHaveBeenCalledWith({ name: 'Login' }))
    })
    test("Doit pouvoir naviguer vers la page 'Parcs'", async () => {
      const router = createRouter({
        history: createWebHistory(),
        routes: routes
      })
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      const { getByText } = await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })
      const routerSpy = vi.spyOn(router, 'push')

      await fireEvent.click(getByText('Parcs'))

      expect(routerSpy).toHaveBeenCalledWith({ name: 'Parks' })
    })
  })
  describe('utilisateur connecté', () => {
    test("L'option Se déconnecter est visible mais pas Connexion", async () => {
      const router = createRouter({
        history: createWebHistory(),
        routes: routes
      })
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      const authStore = useAuthStore()
      authStore.token = tokens[0]
      const { queryByText, getByText } = await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })

      getByText('Se déconnecter')
      const connexionEl = await queryByText('Connexion')
      expect(connexionEl).toBeNull()
    })
    test("Doit pouvoir naviguer vers la page 'Mes sentiers'", async () => {
      const router = createRouter({
        history: createWebHistory(),
        routes: routes
      })
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      const authStore = useAuthStore()
      authStore.token = tokens[0]
      const { getByText } = await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })
      const routerSpy = vi.spyOn(router, 'push')

      await fireEvent.click(getByText('Mes sentiers'))

      expect(routerSpy).toHaveBeenCalledWith({ name: 'UserTrails' })
    })
    test('Naviguer vers la page de connexion redirige sur la page des parcs', async () => {
      const router = index
      const pinia = createTestingPinia({
        stubActions: false,
        createSpy: vi.fn
      })
      await render(NavigationBar, {
        global: {
          plugins: [router, pinia]
        }
      })
      const routerSpy = vi.spyOn(router, 'push')

      router.push({ name: 'Login' })

      waitFor(() => expect(routerSpy).toHaveBeenCalledWith({ name: 'Parks' }))
    })
    describe("L'utilisateur se déconnecte", () => {
      test('Doit être redirigé vers la page de connexion', async () => {
        const router = createRouter({
          history: createWebHistory(),
          routes: routes
        })
        const pinia = createTestingPinia({
          stubActions: false,
          createSpy: vi.fn
        })
        const authStore = useAuthStore()
        authStore.token = tokens[0]
        const { getByText } = await render(NavigationBar, {
          global: {
            plugins: [router, pinia]
          }
        })
        const routerSpy = vi.spyOn(router, 'push')

        await fireEvent.click(getByText('Se déconnecter'))

        expect(routerSpy).toHaveBeenCalledWith({ name: 'Login' })
      })
    })
  })
})
