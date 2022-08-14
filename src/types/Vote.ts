import Link from './Link';
import User from './User';

interface Vote {
  user: User;
  link: Link;
  alreadyVoted: boolean;
}

export default Vote;
