import { test, expect } from 'vitest';
import { cn } from '@/lib/utils';

test('cn combines single class', () => {
  const result = cn('px-2');
  expect(result).toEqual('px-2');
});

test('cn combines multiple classes', () => {
  const result = cn('px-2', 'py-1', 'bg-slate-100');
  expect(result).toBe('px-2 py-1 bg-slate-100');
});

test('cn handles conditional classes', () => {
  const result = cn('px-2', true && 'py-1', false && 'hidden');
  expect(result).toBe('px-2 py-1');
});

test('cn handles array of classes', () => {
  const result = cn(['px-2', 'py-1']);
  expect(result).toBe('px-2 py-1');
});

test('cn merges conflicting tailwind classes', () => {
  const result = cn('px-2 px-4');
  expect(result).toBe('px-4');
});

test('cn handles empty inputs', () => {
  const result = cn('');
  expect(result).toBe('');
});

test('cn combines classes with undefined and null', () => {
  const result = cn('px-2', undefined, 'py-1', null);
  expect(result).toBe('px-2 py-1');
});
