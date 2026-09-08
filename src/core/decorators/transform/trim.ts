import { Transform, TransformFnParams } from 'class-transformer';

export const Trim = () => {
  return Transform(({ value }: TransformFnParams) => {
    const transformedValue: unknown = value;

    return typeof transformedValue === 'string'
      ? transformedValue.trim()
      : transformedValue;
  });
};
