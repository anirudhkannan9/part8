const { ApolloServer, UserInputError, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')

let persons = [
    {
      name: "Arto Hellas",
      phone: "040-123543",
      street: "Tapiolankatu 5 A",
      city: "Espoo",
      id: "3d594650-3436-11e9-bc57-8b80ba54c431"
    },
    {
      name: "Matti Luukkainen",
      phone: "040-432342",
      street: "Malminkaari 10 A",
      city: "Helsinki",
      id: '3d599470-3436-11e9-bc57-8b80ba54c431'
    },
    {
      name: "Venla Ruuska",
      street: "Nallemäentie 22 C",
      city: "Helsinki",
      id: '3d599471-3436-11e9-bc57-8b80ba54c431'
    },
]

const typeDefs = gql`
    type Address {
        street: String!
        city: String! 
    }
    
    type Person {
        name: String!
        phone: String
        address: Address!
        id: ID!
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
    }

    enum YesNo {
        YES
        NO
    }
    
    type Query {
        personCount: Int!
        allPersons(phone: YesNo): [Person!]!
        findPerson(name: String!): Person
    }
`

//resolvers correspond to Queries defined in the schema
const resolvers = {
    Query: {
        personCount: () => persons.length,
        allPersons: (root, args) => {
            if (!args.phone) {
                return persons
            }

            const byPhone = (person) => 
                args.phone === 'YES' ? person.phone : !person.phone
            return persons.filter(byPhone)
        },
        findPerson: (root, args) => 
            persons.find(p => p.name.toLowerCase() === args.name.toLowerCase())
    },
    Person: {
        address: (root) => {
            return {
                street: root.street,
                city: root.city
            }
        }
    },
    Mutation: {
        addPerson: (root, args) => {
            if (persons.find(p => p.name.toLowerCase() === args.name.toLowerCase())) {
                throw new UserInputError('Name must be unique', {
                    invalidArgs: args.name
                })
            }
            const person = { ...args, id: uuid() }
            persons = persons.concat(person)
            return person
        },
        editNumber: (root, args) => {
            const lowercaseName = args.name.toLowerCase()
            const person = persons.find(p => p.name.toLowerCase() === lowercaseName)
            if (!person) {
                return null
            }

            const updatedPerson = {...person, phone: args.phone}
            persons = persons.map(p => p.name.toLowerCase() === lowercaseName ? updatedPerson : p)
            return updatedPerson
        }   
    }
}

const server = new ApolloServer({
    typeDefs, //contains GraphQL schema
    resolvers //object containing resolvers of the server - defines how GraphQL queries are responded to
})

server.listen().then(({ url }) => {
    console.log(`Server ready at ${url}`)
})

