import {
  ValidationOptions,
  registerDecorator,
  ValidationArguments,
} from 'class-validator';
import { UpdateProjectArrayFieldDto } from '@modules/projects/application/dtos/update-project-array-field.dto';

export function IsValueValidBasedOnField(
  validationOptions?: ValidationOptions,
) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isValueValidBasedOnField',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const dto = args.object as UpdateProjectArrayFieldDto;

          if (dto.field === 'softwares') {
            return typeof value === 'string';
          }

          if (dto.field === 'links') {
            return (
              typeof value === 'object' &&
              typeof value.label === 'string' &&
              typeof value.url === 'string'
            );
          }

          return false;
        },
        defaultMessage(args: ValidationArguments) {
          const dto = args.object as UpdateProjectArrayFieldDto;
          const fieldName = dto.field;

          if (fieldName === 'softwares') {
            return `Invalid value for field "softwares": expected a string`;
          }

          if (fieldName === 'links') {
            return `Invalid value for field "links": expected an object with { label: string, url: string }`;
          }

          return `Invalid value for the specified field "${fieldName}"`;
        },
      },
    });
  };
}
