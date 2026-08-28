import { describe, test, expect } from '@jest/globals';
import {
  validateRegisterInput,
  validateLoginInput,
  validateTodoText,
  validateDueDate,
  isValidObjectId,
} from '../../src/utils/validators.js';
import { ApiError } from '../../src/utils/ApiError.js';

describe('validateRegisterInput', () => {
  test('rejects missing email or password', () => {
    expect(() => validateRegisterInput({ email: '', password: '' })).toThrow(ApiError);
    expect(() => validateRegisterInput({ email: 'a@a.com', password: '' })).toThrow(ApiError);
  });

  test('rejects malformed email', () => {
    expect(() => validateRegisterInput({ email: 'not-an-email', password: '12345678' })).toThrow(
      'E-mail inválido',
    );
  });

  test('rejects short password', () => {
    expect(() => validateRegisterInput({ email: 'a@a.com', password: '123' })).toThrow(
      'pelo menos 8 caracteres',
    );
  });

  test('accepts valid input', () => {
    expect(() =>
      validateRegisterInput({ email: 'user@example.com', password: 'supersecret' }),
    ).not.toThrow();
  });
});

describe('validateLoginInput', () => {
  test('rejects missing fields', () => {
    expect(() => validateLoginInput({ email: '', password: '' })).toThrow(ApiError);
  });

  test('accepts valid input', () => {
    expect(() => validateLoginInput({ email: 'a@a.com', password: 'x' })).not.toThrow();
  });
});

describe('validateTodoText', () => {
  test('rejects empty text', () => {
    expect(() => validateTodoText('')).toThrow('obrigatório');
    expect(() => validateTodoText('   ')).toThrow('obrigatório');
  });

  test('rejects text over 500 chars', () => {
    expect(() => validateTodoText('a'.repeat(501))).toThrow('500 caracteres');
  });

  test('accepts valid text', () => {
    expect(() => validateTodoText('Comprar leite')).not.toThrow();
  });
});

describe('validateDueDate', () => {
  test('returns null for empty values', () => {
    expect(validateDueDate(undefined)).toBeNull();
    expect(validateDueDate(null)).toBeNull();
    expect(validateDueDate('')).toBeNull();
  });

  test('rejects invalid dates', () => {
    expect(() => validateDueDate('not-a-date')).toThrow('dueDate inválida');
  });

  test('parses a valid ISO date', () => {
    const result = validateDueDate('2026-01-01T00:00:00.000Z');
    expect(result).toBeInstanceOf(Date);
    expect(result.getUTCFullYear()).toBe(2026);
  });
});

describe('isValidObjectId', () => {
  test('accepts a 24-char hex string', () => {
    expect(isValidObjectId('507f1f77bcf86cd799439011')).toBe(true);
  });

  test('rejects malformed ids', () => {
    expect(isValidObjectId('not-an-id')).toBe(false);
    expect(isValidObjectId('123')).toBe(false);
  });
});
