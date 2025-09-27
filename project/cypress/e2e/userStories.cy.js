describe('Récits utilisateurs', () => {
  let user = {
    email: 'new@user.com',
    password: 'password',
    name: ''
  }

  beforeEach(() => {
    cy.exec('npm run backend:cypress:seed')
    cy.request('POST', 'http://127.0.0.1:3000/api/register', {
      email: user.email,
      password: user.password,
      name: user.name
    })
  })

  it('Récit 1 : je peux me connecter', () => {
    cy.login(user.email, user.password)
  })

  it('Récit 2 : je peux me déconnecter', () => {
    cy.login(user.email, user.password)

    cy.contains(/déconnecter/i).click()

    cy.contains(/connexion/i)
  })

  it('Récit 3 : je peux me créer un compte', () => {
    cy.visit('/register')

    cy.get('input[name=email-input]').type('email@email.com')
    cy.get('input[name=password-input]').type('password')
    cy.get('input[name=confirmation-password-input]').type('password')
    cy.get('input[name=name-input]').type('test')
    cy.get('button[type=submit]').click()

    cy.contains(/déconnecter/i)
  })

  it("Récit 4 : je peux voir les sentiers d'un parc ", () => {
    cy.visit('/')

    cy.contains('Jacques-Cartier')
    cy.contains('Les Loups')

    cy.get('select#parks').select('Anticosti')
    cy.contains('Les Caps')
  })

  it("Récit 5 : Je peux voir tous les tronçons associés à un sentier d'un parc. ", () => {
    cy.visit('/')

    cy.get('select#parks').select('Anticosti')
    cy.get('select#trails').select('Les Caps')

    cy.get('.leaflet-container').should('be.visible')
    cy.get('.leaflet-pane .leaflet-overlay-pane svg path').should(
      'have.length',
      1
    )

    cy.get('select#parks').select('Jacques-Cartier')
    cy.get('select#trails').select('Les Loups')

    cy.get('.leaflet-container').should('be.visible')
    cy.get('.leaflet-pane .leaflet-overlay-pane svg path').should(
      'have.length',
      9
    )
  })

  it('Récit 5 : Le nom du sentier ainsi que le parc doivent être affichés. ', () => {
    cy.visit('/')

    cy.get('select#parks').select('Anticosti')
    cy.get('select#trails').select('Les Caps')

    cy.contains('Anticosti')
    cy.contains('Les Caps')

    cy.get('select#parks').select('Jacques-Cartier')
    cy.get('select#trails').select('Les Loups')

    cy.contains('Jacques-Cartier')
    cy.contains('Les Loups')
  })

  it('Récit 6 : je peux savoir combien de personnes aiment un sentier ', () => {
    cy.visit('/')

    cy.contains('Jacques-Cartier')
    cy.contains('Les Loups')

    cy.contains('0')
  })

  it('Récit 7 : je peux ajouter un like en appuyant sur le coeur ', () => {
    cy.login(user.email, user.password)
    cy.visit('/')

    cy.contains('Les Loups')
    cy.contains('0')

    cy.get('button#heartBtn').click()

    cy.contains('1')
  })

  it('Récit 8 : je peux enlever un like en appuyant sur un coeur plein', () => {
    cy.login(user.email, user.password)
    cy.visit('/')

    cy.contains('Les Loups')
    cy.contains('0')
    cy.get('button#heartBtn').click()
    cy.contains('1')

    cy.get('button#heartBtn').click()
    cy.contains('0')
  })
})
