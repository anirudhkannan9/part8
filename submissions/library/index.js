const { ApolloServer, gql } = require('apollo-server')
const { v1: uuid } = require('uuid')

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
        author: String!
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
    }
`

const resolvers = {
    Query: {
        bookCount: () => books.length,
        authorCount: () => authors.length,
        allBooks: (root, args) => {
          if (!args.author && !args.genre) {
            return books
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
            console.log('both: ', args.author, args.genre)
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
        findAuthor: (root, args) => authors.find(a => a.name.toLowerCase().trim() === args.name.toLowerCase().trim()),
        allAuthors: () => authors
    },
    Author: {
      bookCount: (root) => {
        return findNumBooks(root)
      }
    },
    Mutation: {
      addBook: (root, args) => {
        const newBookObject = {
          title: args.title,
          published: args.published,
          author: args.author.toLowerCase().trim(),
          id: uuid(),
          genres: args.genres
        }

        books = books.concat(newBookObject)

        let authorsFilter = authors.map(a => a.name.toLowerCase().trim())
        if (!authorsFilter.includes(args.author.toLowerCase().trim())) {
          console.log('author does not exist in db, create new author object and add to list/db')
          const newAuthorObject = {
            name: args.author.toLowerCase().trim(),
            id: uuid(),
            born: null
          }
          authors = authors.concat(newAuthorObject)
        } 

        return newBookObject
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