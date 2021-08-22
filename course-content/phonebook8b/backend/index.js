const { ApolloServer, UserInputError, gql, AuthenticationError } = require('apollo-server')

require('dotenv').config()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const mongoose = require('mongoose')
const Person = require('./models/person')
const User = require('./models/user')

console.log('connecting to', process.env.MONGODB_URI)

mongoose
    .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
    .then(() => {
        console.log('connected to MongoDB')
    })
    .catch((error) => {
        console.log('error connecting to MongoDB:', error.message)
    })

//const uuid = require('uuid/v1')
const { v1: uuid } = require('uuid')

// let persons = [
//     {
//       name: "Arto Hellas",
//       phone: "040-123543",
//       street: "Tapiolankatu 5 A",
//       city: "Espoo",
//       id: "3d594650-3436-11e9-bc57-8b80ba54c431"
//     },
//     {
//       name: "Matti Luukkainen",
//       phone: "040-432342",
//       street: "Malminkaari 10 A",
//       city: "Helsinki",
//       id: '3d599470-3436-11e9-bc57-8b80ba54c431'
//     },
//     {
//       name: "Venla Ruuska",
//       street: "Nallemäentie 22 C",
//       city: "Helsinki",
//       id: '3d599471-3436-11e9-bc57-8b80ba54c431'
//     },
//   ]

const typeDefs = gql`
  type Person {
      name: String!
      phone: String
      address: Address!
      id: ID!
  }

  type Address {
      street: String!
      city: String!
  }

  enum YesNo {
      YES
      NO
  }

  type User {
      username: String!
      passwordHash: String!
      friends: [Person!]!
      id: ID!
  }

  type Token {
      value: String!
  }

  type Query {
      personCount: Int!
      allPersons(phone: YesNo): [Person!]!
      findPerson(name: String!): Person
      me: User
  }

  type Mutation {
      addPerson(
          name: String!
          phone: String
          street: String!
          city: String!
        ): Person
      editNumber(
          name: String!
          phone: String!
      ): Person
      createUser(
          username: String!
          password: String!
      ): User
      login(
          username: String!
          password: String!
      ): Token
      addAsFriend(
          name: String!
      ): User
  }
`

const resolvers = {
    Query: {
        personCount: () => Person.collection.countDocuments(),
        allPersons: (root, args) => {
            if (!args.phone) {
                return Person.find({})
            }

            return Person.find({ phone: { $exists: args.phone === 'YES' }})
            
        },
        findPerson: (root, args) => Person.findOne({ name: args.name }),
        me: (root, args, context) => {
            return context.currentUser
        }
    },
    Person: {
        address: root => {
            return {
                street: root.street,
                city: root.city
            }
        }
    },
    Mutation: {
        addPerson: async (root, args, context) => {
            const person = new Person({ ...args })
            const currentUser = context.currentUser

            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
            }

            try {
                await person.save()
                currentUser.friends = currentUser.friends.concat(person)
                await currentUser.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }

            return person
        },
        editNumber: async (root, args) => {
            const person = await Person.findOne({ name: args.name })
            person.phone = args.phone

            try {
                await person.save()
            } catch (error) {
                throw new UserInputError(error.message, {
                    invalidArgs: args,
                })
            }

            return person
        },
        createUser: async (root, args) => {
            const saltRounds = 10
            const passwordHash = await bcrypt.hash(args.password, saltRounds)

            const user = new User({
                username: args.username,
                passwordHash: passwordHash
            })

            return user
                .save()
                .catch(error => {
                    throw new UserInputError(error.message, {
                        invalidArgs: args,
                    })
                })            
        },
        login: async (root, args) => {
            const user = await User.findOne({ username: args.username })
            const passwordCorrect = user === null
                ? false
                : await bcrypt.compare(args.password, user.passwordHash)

            if (!user || !passwordCorrect) {
                throw new UserInputError("wrong credentials")
            }

            const userForToken = {
                username: user.username,
                id: user._id
            }

            return { value: jwt.sign(userForToken, process.env.SECRET) }
        },
        addAsFriend: async (root, args, { currentUser }) => {
            if (!currentUser) {
                throw new AuthenticationError("not authenticated")
            }

            const friendAlready = (person) => currentUser.friends.map(f => f._id).includes(person._id)

            const person = await Person.findOne({ name: args.name })
            if ( !friendAlready(person) ) {
                currentUser.friends = currentUser.friends.concat(person)
            }

            await currentUser.save()

            return currentUser
        }
    }
}

// const resolvers = {
//     Query: {
//         personCount: () => persons.length,
//         allPersons: (root, args) => {
//             if (!args.phone) {
//                 return persons
//             }

//             const byPhone = person => args.phone === 'YES' ? person.phone : !person.phone

//             return persons.filter(byPhone)
//         },
//         findPerson: (root, args) => persons.find(p => p.name === args.name)
//     },
//     Person: {
//         address: (root) => {
//             return {
//                 street: root.street,
//                 city: root.city
//             }
//         }
//     },
//     Mutation: {
//         addPerson: (root, args) => {
//             if (persons.find(p => p.name === args.name)) {
//                 throw new UserInputError('Name must be unique', {
//                     invalidArgs: args.name
//                 })
//             }

//             const person = { ...args, id: uuid() }
//             persons = persons.concat(person)
//             return person
//         },
//         editNumber: (root, args) => {
//             const person = persons.find(p => p.name === args.name)
//             if (!person) {
//                 return null
//             }

//             const updatedPerson = { ...person, phone: args.phone }
//             persons = persons.map(p => p.name === args.name ? updatedPerson : p)
//             return updatedPerson
//         }
//     }
// }

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: async ( { req } ) => {
        const auth = req ? req.headers.authorization : null
        if (auth && auth.toLowerCase().startsWith('bearer ')) {
            const decodedToken = jwt.verify(
                auth.substring(7), process.env.SECRET
            )

            const currentUser = await User.findById(decodedToken.id).populate('friends')
            return { currentUser }
        }
    }
})

server.listen().then( ( { url } ) => {
    console.log(`server ready at ${url}`)
})