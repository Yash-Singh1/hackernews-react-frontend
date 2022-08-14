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

const LinkList = () => {
  const { data } = useQuery(FEED_QUERY);

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
