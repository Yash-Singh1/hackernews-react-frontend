import { gql, useMutation } from '@apollo/client';
import React from 'react';
import { AUTH_TOKEN } from '../constants';
import LinkType from '../types/Link';
import { timeDifferenceForDate } from '../utils/timeDifference';
import { FEED_QUERY } from './LinkList';
import { FEED_SEARCH_QUERY } from './Search';

const VOTE_MUTATION = gql`
  mutation VoteMutation($linkId: Int!) {
    vote(linkId: $linkId) {
      link {
        id
        voters {
          id
        }
      }
      user {
        id
      }
      alreadyVoted
    }
  }
`;

const Link = (props: { link: LinkType; index: number; searchFilter?: string }) => {
  const { link } = props;
  const [vote] = useMutation(VOTE_MUTATION, {
    variables: {
      linkId: link.id,
    },
    update: (cache, { data: { vote } }) => {
      let feedCache =
        typeof props.searchFilter !== 'undefined'
          ? cache.readQuery({
              query: FEED_SEARCH_QUERY,
              variables: {
                filter: props.searchFilter,
              },
            })
          : cache.readQuery({
              query: FEED_QUERY,
            });

      const { feed } = feedCache as { feed: any };

      const updatedLinks = feed.links.map((feedLink: LinkType) => {
        if (feedLink.id === link.id) {
          return {
            ...feedLink,
            voters: vote.alreadyVoted
              ? feedLink.voters!.filter((voter) => {
                  return voter.id !== vote.user!.id;
                })
              : [...feedLink.voters!, vote],
          };
        }
        return feedLink;
      });

      cache.writeQuery({
        query: typeof props.searchFilter !== 'undefined' ? FEED_SEARCH_QUERY : FEED_QUERY,
        data: {
          feed: {
            links: updatedLinks,
          },
        },
      });
    },
  });

  const authToken = localStorage.getItem(AUTH_TOKEN);

  return (
    <div className="flex mt2 items-start">
      <div className="flex items-center">
        <span className="gray">{props.index + 1}.</span>
        {authToken && (
          <div className="ml1 gray f11 pointer" onClick={() => vote()}>
            ▲
          </div>
        )}
      </div>
      <div className="ml1">
        <div>
          {link.description} (
          <a className="gray pointer no-underline" target="_blank" href={link.url} rel="noreferrer">
            {link.url}
          </a>
          )
        </div>
        {
          <div className="f6 lh-copy gray">
            {link.voters!.length} votes | by {link.postedBy ? link.postedBy.name : 'Unknown'} {timeDifferenceForDate(link.createdAt!)}
          </div>
        }
      </div>
    </div>
  );
};

export default Link;
