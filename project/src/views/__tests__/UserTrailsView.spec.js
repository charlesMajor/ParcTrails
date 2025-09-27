import { render, cleanup } from '@testing-library/vue'
import { describe, afterEach, test, beforeAll } from 'vitest'
import { createRouter, createWebHistory } from 'vue-router'
import UserTrailsView from '../UserTrailsView.vue'
import routes from '../../router/routes.js'

let router

beforeAll(() => {
  router = createRouter({
    history: createWebHistory(),
    routes: routes
  })
})
afterEach(() => {
  cleanup()
})
describe('UserTrailsView.vue', () => {
  // Ci-dessous, on crée un stub pour le composant LMap. Un stub est essentiellement un composant vide qui sert de remplacement pour un composant réel. Selon la documentation de Testing library (https://testing-library.com/docs/vue-testing-library/faq/), il faut éviter l'utilisation de stub, car il est préférable de tester le composant avec ses enfants. Cependant, dans notre cas, le composant enfant LMap est un composant externe qui, lorsqu'il est utilisé dans les tests, génère une erreur. Nous avons donc décidé d'utiliser un stub de LMap pour tester le composant UserTrailsView.
  const LMapStub = {
    template: '<div data-testid="lmap">Ma carte</div>'
  }
  test('Doit afficher une carte', async () => {
    const { getByTestId } = render(UserTrailsView, {
      global: {
        plugins: [router],
        stubs: {
          'l-map': LMapStub
        }
      }
    })

    getByTestId('lmap')
  })
})
