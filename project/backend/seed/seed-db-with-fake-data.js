const fs = require('fs')
var { faker } = require('@faker-js/faker')
const bcrypt = require('bcryptjs')
const trailsJson = require('../input/sentieretel.json')
const proj4 = require('proj4')

console.log('Génération du fichier db-dev.json : ')
const initialTrails = { ...trailsJson }
delete initialTrails.type
delete initialTrails.crs

proj4.defs(
  'EPSG:32198',
  '+proj=lcc +lat_1=60 +lat_2=46 +lat_0=44 +lon_0=-68.5 +x_0=0 +y_0=0 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs'
)

const parks = []
const levels = []
const types = []
const trails = []
const segments = []
let users = []
const likes = []
const generatedUsers = []

main()

async function main () {
  await createAllData()
  createDbFile()
}

function createDbFile () {
  const dbFile = './backend/db-dev.json'
  const db = {
    users,
    likes,
    parks,
    levels,
    types,
    segments,
    trails,
    generatedUsers
  }
  const jsonData = JSON.stringify(db)
  fs.writeFile(dbFile, jsonData, err => {
    if (err) {
      console.log(err.message)
    }
    console.log('\x1b[32m%s\x1b[0m', 'db-dev.json créé.')
  })
}

async function createAllData () {
  console.log('   * Création parcs et sentiers.')
  initialTrails.features.forEach(feature => {
    createParks(feature)
    createLevels(feature)
    createTypes(feature)
    createSegments(feature)
    createTrails(feature)
  })
  console.log('   * Création de 1000 utilisateurs.')
  await createUsers()
  console.log("   * Création des j'aime.")
  createLikes()
}

// Création des utilisateurs
async function createUsers () {
  const password = 'password'
  for (let i = 0; i < 1000; i++) {
    const hash = await bcrypt.hash(password, 1)
    users.push({
      email: faker.internet.email(),
      password: hash,
      name: faker.name.fullName(),
      id: i
      // role: 'user'
    })
    generatedUsers.push({
      email: users[i].email,
      password: password,
      name: users[i].name,
      likesId: [],
      likesTrails: [],
      userId: i
    })
  }
}

// Création des "j'aime"
function createLikes () {
  users.forEach(user => {
    const numberOfLikesToCreate = Math.floor(Math.random() * 3)
    for (let i = 0; i < numberOfLikesToCreate; i++) {
      var keys = Object.keys(trails)
      const trail = trails[keys[(keys.length * Math.random()) << 0]]
      const likeId = getLikeId()
      likes.push({
        userId: user.id,
        trailId: trail.id,
        id: likeId
      })
      generatedUsers[user.id].likesId.push(likeId)
      generatedUsers[user.id].likesTrails.push(trail.id)
    }
  })
}
function getLikeId () {
  let nextId = Math.max(...likes.map(d => d.id)) + 1
  if (!Number.isFinite(nextId)) {
    nextId = 0
  }
  return nextId
}

// Création des sentiers
function createTrails (feature) {
  const toponymes = parseToponymes([
    feature.properties.Toponyme1,
    feature.properties.Toponyme2,
    feature.properties.Toponyme3,
    feature.properties.Toponyme4,
    feature.properties.Toponyme5,
    feature.properties.Toponyme6
  ])

  toponymes.forEach(toponyme => {
    const trail = trails.find(
      t => t.name === toponyme && t.parkId === feature.properties.No_etab
    )
    if (trail === undefined) {
      let nextId = Math.max(...trails.map(t => t.id)) + 1
      if (!Number.isFinite(nextId)) {
        nextId = 0
      }
      trails.push({
        id: nextId,
        difficulties: [parseDifficulty(feature.properties.Niv_diff)],
        categories: [feature.properties.Usager],
        segments: [feature.properties.FID],
        parkId: feature.properties.No_etab,
        park: feature.properties.Nom_etab,
        name: toponyme
      })
    } else {
      trail.segments.push(feature.properties.FID)
      let difficulty = parseDifficulty(feature.properties.Niv_diff)
      if (!trail.difficulties.includes(difficulty)) {
        trail.difficulties.push(difficulty)
      }
      if (!trail.categories.includes(feature.properties.Usager)) {
        trail.categories.push(feature.properties.Usager)
      }
    }
  })
}

function removeSpaceIfEmpty (string) {
  return isBlankOrEmpty(string) ? '' : string
}

function parseToponymes (trailNames) {
  const newTrailNames = []
  trailNames.forEach(name => {
    if (!isBlankOrEmpty(name)) {
      newTrailNames.push(name)
    }
  })
  return newTrailNames
}

// Création des Parcs

function createParks (feature) {
  const park = feature.properties.Nom_etab
  const isParkAdded = parks.some(p => p.name === park)
  if (!isParkAdded && !isBlankOrEmpty(park)) {
    // let nextId = Math.max(...parks.map(park => park.id)) + 1
    // if (!Number.isFinite(nextId)) {
    //   nextId = 0
    // }
    parks.push({
      id: feature.properties.No_etab,
      name: park,
      trails: {
        countSegments: initialTrails.features.filter(f => {
          return f.properties.Nom_etab === feature.properties.Nom_etab
        }).length
      },
      userId: 0
    })
  }
}

// Création des tronçons
function createSegments (feature) {
  segments.push({
    id: feature.properties.FID,
    // trailId: feature.properties.FID,
    levelId: getDifficultyId(parseDifficulty(feature.properties.Niv_diff)),
    level: parseDifficulty(feature.properties.Niv_diff),
    typeId: getCategoryId(feature.properties.Usager),
    type: removeSpaceIfEmpty(feature.properties.Usager),
    userId: 0,
    coordinates: parseCoordinates(
      feature.geometry.type,
      feature.geometry.coordinates
    )
  })
}

// Création des difficultés
function createLevels (feature) {
  let difficulty = parseDifficulty(feature.properties.Niv_diff)

  if (isBlankOrEmpty(difficulty)) {
    difficulty = 'Inconnue'
  }
  const isTrailDifficultyAdded = levels.some(d => d.description === difficulty)
  if (!isTrailDifficultyAdded) {
    let nextId = Math.max(...levels.map(d => d.id)) + 1
    if (!Number.isFinite(nextId)) {
      nextId = 0
    }
    levels.push({
      id: nextId,
      description: difficulty,
      userId: 0
    })
  }
}

function parseDifficulty (difficulty) {
  difficulty = isBlankOrEmpty(difficulty) ? 'Inconnue' : difficulty
  if (difficulty === 'Moyen') {
    difficulty = 'Intermédiaire'
  }
  return difficulty
}

function getDifficultyId (difficultyDescription) {
  if (isBlankOrEmpty(difficultyDescription)) {
    difficultyDescription = 'Inconnue'
  }
  const difficulty = levels.find(d => d.description === difficultyDescription)
  return difficulty.id
}

// Création des categories

function getCategoryId (categoryDescription) {
  const category = types.find(
    category => category.description === categoryDescription
  )
  return category.id
}

function createTypes (feature) {
  const isTrailTypeAdded = types.some(
    t => t.description === feature.properties.Usager
  )
  if (isTrailTypeAdded === false) {
    let nextId = Math.max(...types.map(t => t.id)) + 1
    if (!Number.isFinite(nextId)) {
      nextId = 0
    }
    types.push({
      id: nextId,
      description: feature.properties.Usager,
      userId: 0
    })
  }
}

// Utilisatires pour transformer/manipuler les données

function parseCoordinates (type, coordinates) {
  let parsedCoordinates = []
  coordinates.forEach(coordinate => {
    let transformedCoordinate
    switch (type) {
      case 'LineString':
        transformedCoordinate = transformEPSGtoWGS84(coordinate)
        parsedCoordinates.push(transformedCoordinate)
        break

      case 'MultiLineString':
        coordinates.forEach(multilines => {
          multilines.forEach(coordinate => {
            transformedCoordinate = transformEPSGtoWGS84(coordinate)
            parsedCoordinates.push(transformedCoordinate)
          })
        })
        break
    }
  })
  return parsedCoordinates
}

function isBlankOrEmpty (data) {
  return data.replace(/\s/g, '').length === 0
}

function transformEPSGtoWGS84 (coordinates) {
  try {
    const projection = proj4('EPSG:32198', 'WGS84', coordinates).reverse()
    return projection
  } catch (error) {
    console.log('*** Erreur de transformation: ', error.message)
  }
}
