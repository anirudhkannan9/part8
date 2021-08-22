import React from 'react'
import ReactDOM from 'react-dom';
import App from './App'
import './index.css'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('phonenumbers-user-token')
  return {
    headers: {
      ...headers, 
      authorization: token ? `bearer ${token}` : null,
    }
  }
})

const httpLink = new HttpLink({ uri: 'http://localhost:4000'})

//create new client object
const client = new ApolloClient({
  cache: new InMemoryCache(),
  //link param defines how apollo connects to the server. Here, if a token exists in localStorage, the request authorization header contains the token
  link: authLink.concat(httpLink)
})



//client can be made accessible to all components of the application by wrapping the App component with ApolloProvider
ReactDOM.render(
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>,
  document.getElementById('root')
)







// import { gql } from '@apollo/client'
// const query = gql`
// query {
//   allPersons {
//     name,
//     phone,
//     address {
//       street,
//       city
//     }
//     id
//   }
// }
// `

// //client object used to send query to the server. Application can communicate w a GraphQL server using the client object 
// client
//   .query({ query })
//   .then((response) => {
//     console.log(response.data)
//   })
