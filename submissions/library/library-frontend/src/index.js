import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

import { ApolloClient, ApolloProvider, HttpLink, InMemoryCache } from '@apollo/client'
//import { ALL_AUTHORS } from './queries'

const client = new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        uri: 'http://localhost:4000',
    })
})

// client
//     .query({ query: ALL_AUTHORS })
//     .then((response) => {
//         console.log(response.data)
//     })

ReactDOM.render(
    <ApolloProvider client={ client }>
        <App />
    </ApolloProvider>,
    document.getElementById('root')
)

