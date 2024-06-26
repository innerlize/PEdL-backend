import { Link } from 'src/common/domain/link.interface';

export interface Partner {
  id: string;
  name: string;
  image: string;
  links?: Link[];
}
