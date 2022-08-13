import Link from './Link';

interface User {
  id?: number;
  name?: string;
  email?: string;
  links?: Link[];
  votes?: Link[];
}

export default User;
