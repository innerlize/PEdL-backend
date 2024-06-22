import { IsString } from 'class-validator';

export class LinkDto {
  @IsString()
  label: string;

  @IsString()
  url: string;
}
