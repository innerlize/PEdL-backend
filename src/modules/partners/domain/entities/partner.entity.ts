import { Link } from '../../../../common/domain/link.interface';

export class PartnerEntity {
  id: string;
  name: string;
  image: string;
  links?: Link[];
}
