// import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
// import { setContext } from '@apollo/client/link/context'

// const httpLink = createHttpLink({
//   uri: import.meta.env.VITE_API_URL,
// })

// const authLink = setContext((_, { headers }) => {
//   const token = localStorage.getItem('token')
//   return {
//     headers: {
//       ...headers,
//       authorization: token ? `Bearer ${token}` : '',
//     },
//   }
// })

// export const client = new ApolloClient({
//   link: authLink.concat(httpLink),
//   cache: new InMemoryCache(),
// })

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_API_URL,
})

const authLink = setContext((_, { headers }) => {
  const transporterToken = localStorage.getItem('transporterToken')
  const adminToken = localStorage.getItem('token')

  const finalToken = transporterToken ?? adminToken

  return {
    headers: {
      ...headers,
      authorization: finalToken ? `Bearer ${finalToken}` : '',
    },
  }
})

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
})
