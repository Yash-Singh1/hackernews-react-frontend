import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import App from './components/App';
import { ApolloProvider, ApolloClient, createHttpLink, InMemoryCache } from '@apollo/client';
import { BrowserRouter } from 'react-router-dom';
import { setContext } from '@apollo/client/link/context';
import { AUTH_TOKEN } from './constants';
import { split } from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = createHttpLink({
  uri:
    !process.env.NODE_ENV || process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://typescript-hackernews-backend.herokuapp.com',
});

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(AUTH_TOKEN);
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

const wsLink = new GraphQLWsLink(
  createClient({
    url:
      !process.env.NODE_ENV || process.env.NODE_ENV === 'development'
        ? 'ws://localhost:3000/'
        : 'wss://typescript-hackernews-backend.herokuapp.com/',
    connectionParams() {
      const token = localStorage.getItem(AUTH_TOKEN);
      return { authorization: token ? `Bearer ${token}` : '' };
    },
  })
  // options: {
  //   reconnect: true,
  //   connectionParams: {
  //     authToken: localStorage.getItem(AUTH_TOKEN),
  //   },
  // },
);

const link = split(
  ({ query }) => {
    const mainDefinition = getMainDefinition(query);
    // Check if it is a subscription query to see if we split to websocket
    return mainDefinition.kind === 'OperationDefinition' && mainDefinition.operation === 'subscription';
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  link,
  cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </BrowserRouter>
  </React.StrictMode>
);
