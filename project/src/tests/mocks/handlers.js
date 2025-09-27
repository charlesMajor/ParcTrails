import { rest } from 'msw'
import { tokens } from '../data/tokens'
import { users } from '../data/users'
import { API_REST } from '../../shared/config'

export const success = [
  rest.post(API_REST + '/api/login', (request, response, context) => {
    return response(context.status(200), context.json(tokens[0]))
  }),
  rest.post(API_REST + '/api/register', (request, response, context) => {
    return response(context.status(200), context.json(tokens[0]))
  }),
  rest.get(API_REST + '/api/users/:id', (request, response, context) => {
    const { id } = request.params
    const user = users.find(user => user.id === parseInt(id))
    return response(context.status(200), context.json(user))
  })
]

export const networkError = [
  rest.get(API_REST + '/api/*', (request, response) => {
    return response.networkError('Failed to connect')
  }),
  rest.post(API_REST + '/api/*', (request, response) => {
    return response.networkError('Failed to connect')
  })
]

export const badRequest = [
  rest.get(API_REST + '/api/*', (request, response, context) => {
    return response(context.status(400))
  }),
  rest.post(API_REST + '/api/*', (request, response, context) => {
    return response(context.status(400))
  })
]

export const unauthorized = [
  rest.get(API_REST + '/api/*', (request, response, context) => {
    return response(context.status(401))
  }),
  rest.post(API_REST + '/api/*', (request, response, context) => {
    return response(context.status(401))
  })
]

export const serverError = [
  rest.get(API_REST + '/api/*', (request, response, context) => {
    return response(context.status(500))
  }),
  rest.post(API_REST + '/api/*', (request, response, context) => {
    return response(context.status(500))
  })
]
