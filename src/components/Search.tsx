import React, { useEffect, useState } from 'react';
import { useLazyQuery, gql } from '@apollo/client';
import Link from './Link';
import LinkType from '../types/Link';

export const FEED_SEARCH_QUERY = gql`
  query FeedSearchQuery($filter: String!) {
    feed(filter: $filter, orderBy: [{ createdAt: desc }]) {
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

const Search = () => {
  const [searchFilter, setSearchFilter] = useState('');
  const [executeSearch, { data }] = useLazyQuery(FEED_SEARCH_QUERY);

  useEffect(() => {
    executeSearch({ variables: { filter: '' } });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div className="flex mt2">
        <div className="inline-flex bg-black-20 pa1 br2 br--left-ns">
          <svg
            aria-hidden="true"
            focusable="false"
            data-prefix="fas"
            data-icon="magnifying-glass"
            role="img"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 512 512"
            className="w1 v-mid"
          >
            <path
              fill="#ddd"
              d="M500.3 443.7l-119.7-119.7c27.22-40.41 40.65-90.9 33.46-144.7C401.8 87.79 326.8 13.32 235.2 1.723C99.01-15.51-15.51 99.01 1.724 235.2c11.6 91.64 86.08 166.7 177.6 178.9c53.8 7.189 104.3-6.236 144.7-33.46l119.7 119.7c15.62 15.62 40.95 15.62 56.57 0C515.9 484.7 515.9 459.3 500.3 443.7zM79.1 208c0-70.58 57.42-128 128-128s128 57.42 128 128c0 70.58-57.42 128-128 128S79.1 278.6 79.1 208z"
            ></path>
          </svg>
          <input
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                executeSearch({ variables: { filter: searchFilter } });
              }
            }}
            className="bg-transparent outline-transparent b--transparent"
            type="text"
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search..."
          />
        </div>
        <button
          className="br2 br--right-ns pointer button"
          onClick={() => {
            executeSearch({ variables: { filter: searchFilter } });
          }}
        >
          OK
        </button>
      </div>
      {data ? (
        <div className="mt3">
          {data.feed.links.map((link: LinkType, index: number) => (
            <Link key={link.id} link={link} index={index} searchFilter={searchFilter} />
          ))}
        </div>
      ) : (
        <div className="mt3">Loading posts...</div>
      )}
    </>
  );
};

export default Search;
