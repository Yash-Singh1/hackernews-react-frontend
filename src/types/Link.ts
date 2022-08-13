import User from './User';

interface Link {
  description?: string;
  url?: string;
  id?: number;
  createdAt?: string;
  voters?: User[];
  postedBy: User;
}

export default Link;
