import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';

const graphqlEndpoint = import.meta.env.VITE_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

export const apolloClient = new ApolloClient({
  link: new HttpLink({ uri: graphqlEndpoint, }),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'cache-first', },
  },
});
