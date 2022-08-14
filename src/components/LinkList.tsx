import React from 'react';
import Link from './Link';
import LinkType from '../types/Link';
import { useQuery, gql } from '@apollo/client';
import Vote from '../types/Vote';
import User from '../types/User';

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

const NEW_VOTES_SUBSCRIPTION = gql`
  subscription {
    newVote {
      alreadyVoted
      link {
        id
      }
      user {
        id
      }
    }
  }
`;

const UNVOTE_SUBSCRIPTION = gql`
  subscription {
    unvote {
      alreadyVoted
      link {
        id
      }
      user {
        id
      }
    }
  }
`;

export const USER_QUERY = gql`
  {
    user {
      id
    }
  }
`;

const LinkList = () => {
  const { data, subscribeToMore } = useQuery(FEED_QUERY);
  const { data: userData } = useQuery(USER_QUERY) as { data: { user: User } };

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

  subscribeToMore({
    document: NEW_VOTES_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return prev;
      }
      const newVote: Vote = subscriptionData.data.newVote;
      return {
        feed: {
          ...prev.feed,
          links: (prev.feed.links as LinkType[]).reduce((allLinks: LinkType[], currentLink) => {
            if (currentLink.id === newVote.link.id) {
              allLinks.push({
                ...currentLink,
                voters: [
                  ...currentLink.voters!.filter((voter) => {
                    return voter.id !== newVote.user.id;
                  }),
                  newVote.user,
                ],
              });
            } else {
              allLinks.push(currentLink);
            }
            return allLinks;
          }, []),
        },
      };
    },
  });

  subscribeToMore({
    document: UNVOTE_SUBSCRIPTION,
    updateQuery: (prev, { subscriptionData }) => {
      if (!subscriptionData.data) {
        return prev;
      }
      const unvote: Vote = subscriptionData.data.unvote;
      return {
        feed: {
          ...prev.feed,
          links: (prev.feed.links as LinkType[]).reduce((allLinks: LinkType[], currentLink) => {
            if (currentLink.id === unvote.link.id) {
              allLinks.push({
                ...currentLink,
                voters: currentLink.voters!.filter((voter) => {
                  return voter.id !== unvote.user.id;
                }),
              });
            } else {
              allLinks.push(currentLink);
            }
            return allLinks;
          }, []),
        },
      };
    },
  });

  return (
    <div>
      {data ? (
        <>
          {data.feed.links.map((link: LinkType, index: number) => (
            <Link key={link.id} link={link} index={index} user={userData?.user} />
          ))}
        </>
      ) : null}
    </div>
  );
};

export default LinkList;
