import React from 'react';
import Link from './Link';
import LinkType from '../types/Link';
import { useQuery, gql } from '@apollo/client';

export const FEED_QUERY = gql`
  {
    feed(orderBy: [{ createdAt: desc }]) {
      id
      links {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
        voters {
          id
        }
      }
    }
  }
`;

const NEW_LINKS_SUBSCRIPTION = gql`
  subscription {
    newLink {
      id
      url
      description
      createdAt
      postedBy {
        id
        name
      }
      voters {
        id
      }
    }
  }
`;

const LinkList = () => {
  const { data, subscribeToMore } = useQuery(FEED_QUERY);

  subscribeToMore({
    document: NEW_LINKS_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return prev;
      }
      const newLink: LinkType = subscriptionData.data.newLink;
      if ((prev.feed.links as LinkType[]).find(({ id }) => id === newLink.id)) {
        return prev;
      }

      return {
        feed: {
          ...prev.feed,
          links: [newLink, ...prev.feed.links],
        },
      };
    },
    onError: (err) => console.error(err),
  });

  return (
    <div>
      {data ? (
        <>
          {data.feed.links.map((link: LinkType, index: number) => (
            <Link key={link.id} link={link} index={index} />
          ))}
        </>
      ) : null}
    </div>
  );
};

export default LinkList;
