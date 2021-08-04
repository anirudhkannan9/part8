import React from 'react'
import ReactDOM from 'react-dom';
import App from './App'
import './index.css'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache, gql } from '@apollo/client'

//create new client object
const client = new ApolloClient({
  cache: new InMemoryCache(),
  link: new HttpLink({
    uri: 'http://localhost:4000',
  })
})

const query = gql`
query {
  allPersons {
    name,
    phone,
    address {
      street,
      city
    }
    id
  }
}
`

//client object used to send query to the server. Application can communicate w a GraphQL server using the client object 
client
  .query({ query })
  .then((response) => {
    console.log(response.data)
  })

//client can be made accessible to all components of the application by wrapping the App component with ApolloProvider
ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
  document.getElementById('root')
)

