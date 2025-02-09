import { Transform } from 'class-transformer';

/**
 * A transform decorator to ensure a property is always treated as an array.
 *
 * Useful when dealing with values sent from the frontend, especially in cases
 * like FormData, where a single value might be sent as a string instead of an array.
 * This decorator automatically wraps non-array values into an array, preventing
 * validation errors in DTOs that expect an array.
 */

export function ToArray(): PropertyDecorator {
  return Transform(({ value }) => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  });
}
