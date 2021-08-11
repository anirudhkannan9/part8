const { ApolloServer, UserInputError, gql } = require('apollo-server')
require('dotenv').config()
const mongoose = require('mongoose')
const Author = require('./models/author')
const Book = require('./models/book')
const { processString } = require('./helpers')
const { v1: uuid } = require('uuid')
const author = require('./models/author')

console.log('connecting to ', process.env.MONGODB_URI)

mongoose
  .connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
  .then(() => {
    console.log('connected to MongoDB')
  })
  .catch((error) => {
    console.log('error connecting to MongoDB: ', error.message)
  })

let authors = [
    {
      name: 'Robert Martin',
      id: "afa51ab0-344d-11e9-a414-719c6709cf3e",
      born: 1952,
    },
    {
      name: 'Martin Fowler',
      id: "afa5b6f0-344d-11e9-a414-719c6709cf3e",
      born: 1963
    },
    {
      name: 'Fyodor Dostoevsky',
      id: "afa5b6f1-344d-11e9-a414-719c6709cf3e",
      born: 1821
    },
    { 
      name: 'Joshua Kerievsky', // birthyear not known
      id: "afa5b6f2-344d-11e9-a414-719c6709cf3e",
    },
    { 
      name: 'Sandi Metz', // birthyear not known
      id: "afa5b6f3-344d-11e9-a414-719c6709cf3e",
    },
]

/*
 * It might make more sense to associate a book with its author by storing the author's name in the context of the book instead of the author's id
 * However, for simplicity, we will store the author's name in connection with the book
*/

let books = [
    {
      title: 'Clean Code',
      published: 2008,
      author: 'Robert Martin',
      id: "afa5b6f4-344d-11e9-a414-719c6709cf3e",
      genres: ['refactoring']
    },
    {
      title: 'Agile software development',
      published: 2002,
      author: 'Robert Martin',
      id: "afa5b6f5-344d-11e9-a414-719c6709cf3e",
      genres: ['agile', 'patterns', 'design']
    },
    {
      title: 'Refactoring, edition 2',
      published: 2018,
      author: 'Martin Fowler',
      id: "afa5de00-344d-11e9-a414-719c6709cf3e",
      genres: ['refactoring']
    },
    {
      title: 'Refactoring to patterns',
      published: 2008,
      author: 'Joshua Kerievsky',
      id: "afa5de01-344d-11e9-a414-719c6709cf3e",
      genres: ['refactoring', 'patterns']
    },  
    {
      title: 'Practical Object-Oriented Design, An Agile Primer Using Ruby',
      published: 2012,
      author: 'Sandi Metz',
      id: "afa5de02-344d-11e9-a414-719c6709cf3e",
      genres: ['refactoring', 'design']
    },
    {
      title: 'Crime and punishment',
      published: 1866,
      author: 'Fyodor Dostoevsky',
      id: "afa5de03-344d-11e9-a414-719c6709cf3e",
      genres: ['classic', 'crime']
    },
    {
      title: 'The Demon ',
      published: 1872,
      author: 'Fyodor Dostoevsky',
      id: "afa5de04-344d-11e9-a414-719c6709cf3e",
      genres: ['classic', 'revolution']
    },
]


const findNumBooks = (author) => {
  const name = author.name.toLowerCase()
  let numBooks = 0
  books.forEach(book => {
      if (book.author.toLowerCase() === name) {
          numBooks += 1
      }
  })
  return numBooks
}

const findBookCountAndReturnEditedObject = (author) => {
  const name = author.name.toLowerCase()
  let numBooks = 0
  books.forEach(book => {
      if (book.author.toLowerCase() === name) {
          numBooks += 1
      }
  })
  return {...author, bookCount: numBooks}
}

const typeDefs = gql`
    type Book {
        title: String!
        published: Int!
        author: Author!
        id: String!
        genres: [String!]!
    }

    type Author {
        name: String!
        id: String!
        born: Int
        bookCount: Int
    }

    type Query {
        bookCount: Int!
        authorCount: Int!
        allBooks(author: String genre: String): [Book!]!
        findAuthor(name: String!): Author
        allAuthors: [Author!]!
    }

    type Mutation {
      addBook(
        title: String!
        author: String!
        published: Int!
        genres: [String!]!
      ): Book!
      editAuthor(
        name: String!
        setBornTo: Int! 
      ): Author
    }
`

const resolvers = {
    Query: {
        bookCount: () => Book.collection.countDocuments(),
        authorCount: () => Author.collection.countDocuments(),
        allBooks: (root, args) => {
          if (!args.author && !args.genre) {
            return Book.find({})
          } else if (args.author && !args.genre) {
            let booksByAuthor = []

            books.forEach(book => {
              if (book.author.toLowerCase().trim() === args.author.toLowerCase().trim()) {
                booksByAuthor = booksByAuthor.concat(book)
              }
            })

            return booksByAuthor
          } else if (!args.author && args.genre) {            
            let booksInGenre = []

            books.forEach(book => {
              if (book.genres.map(g => g.toLowerCase().trim()).includes(args.genre.toLowerCase().trim())) {
                booksInGenre = booksInGenre.concat(book)
              }
            })

            return booksInGenre
          } else {
            let booksByAuthor = []

            books.forEach(book => {
              if (book.author.toLowerCase().trim() === args.author.toLowerCase().trim()) {
                booksByAuthor = booksByAuthor.concat(book)
              }
            })

            let booksInGenre = []
            booksByAuthor.forEach(book => {
              if (book.genres.map(g => g.toLowerCase().trim()).includes(args.genre.toLowerCase().trim())) {
                booksInGenre = booksInGenre.concat(book)
              }
            })

            return booksInGenre
          }
        },
        findAuthor: (root, args) => Author.findOne({ name: processString(args.name) }),
        allAuthors: () => Author.find({})
    },
    Author: {
      bookCount: (root) => {
        return findNumBooks(root)
      }
    },
    Mutation: {
      addBook: async (root, args) => {
        const authorName = processString(args.author)
        const author = await Author.findOne({ name: authorName })
        const genres = args.genres.map(g => processString(g))

        if (!author) {
          const newAuthor = new Author({
            name: authorName
          })

          await newAuthor.save()

          const newBook = new Book({
            title: processString(args.title),
            published: args.published,
            author: newAuthor,
            genres: genres
          })

          await newBook.save()
          return newBook
        } else {
          const newBook = new Book({
            title: processString(args.title),
            published: args.published,
            author: author,
            genres: genres
          })

          await newBook.save()

          return newBook

        }


      },
      editAuthor: (root, args) => {
        //tried normalizing names - didn't seem worth it, especially because the string.normalize() method had no apparent effect (verified by equality checks)

        const processedName = processString(args.name)
        const authorsFilter = authors.map(a => a.name).map(n => processString(n))
        
        if (authorsFilter.includes(processedName)) {
          authors = authors.map(a => processString(a.name) === processedName ? {...a, born: args.setBornTo} : a)
          return authors.find(a => processString(a.name) === processedName)

        } else {
          console.log('author does not exist in server')
          return null
        }
        


      }
    } 

}

const server = new ApolloServer({
    typeDefs,
    resolvers
})

server.listen().then( ( { url }) => {
    console.log(`Server ready at ${url}`)
})