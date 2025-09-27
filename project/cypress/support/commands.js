/* eslint-disable no-undef */
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
Cypress.Commands.add('login', (email, password) => {
  cy.visit('/login')
  cy.get('input[name=email-input]').type(email)
  cy.get('input[name=password-input]').type(password)
  cy.get('button[type=submit]').click()

  cy.contains(/déconnecter/i)
})
// Cypress.Commands.add('login', (email, password) => {
//   cy.session(
//     email,
//     () => {
//       cy.visit('/login')
//       cy.get('input[name=email-input]').type(email)
//       cy.get('input[name=password-input]').type(password)
//       cy.get('button[type=submit]').click()
//
//       cy.contains(/déconnecter/i)
//     },
//     {
//       validate: () => {
//         cy.getAllLocalStorage('token').should('exist')
//       }
//     }
//   )
// })
