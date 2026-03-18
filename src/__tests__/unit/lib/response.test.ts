import { buildSuccess, buildError, buildPaginated } from '../../../lib/response';
import type { ApiResponse, ApiMeta } from '../../../types/api-response';

describe('API Response Envelope', () => {
  describe('buildSuccess', () => {
    it('returns success response with exact shape', () => {
      const data = { id: 1, name: 'Test' };
      const result = buildSuccess(data);

      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test' },
        error: null,
      });
    });

    it('has correct type signature for success', () => {
      const result = buildSuccess({ id: 1, name: 'Test' });
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('works with object data', () => {
      const data = { id: 1, name: 'Test', email: 'test@example.com' };
      const result = buildSuccess(data);

      expect(result.data).toEqual(data);
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('works with array data', () => {
      const data = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = buildSuccess(data);

      expect(result.data).toEqual(data);
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('works with string data', () => {
      const data = 'Success message';
      const result = buildSuccess(data);

      expect(result.data).toEqual('Success message');
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('works with number data', () => {
      const data = 42;
      const result = buildSuccess(data);

      expect(result.data).toEqual(42);
      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
    });

    it('returns a new reference, not the input object', () => {
      const data = { id: 1, name: 'Test' };
      const result = buildSuccess(data);

      expect(result).not.toBe(data);
      expect(result.data).toBe(data); // data reference preserved
      expect(result).toEqual({
        success: true,
        data,
        error: null,
      });
    });

    it('does not include meta field', () => {
      const result = buildSuccess({ id: 1 });
      expect('meta' in result).toBe(false);
    });
  });

  describe('buildError', () => {
    it('returns error response with exact shape', () => {
      const result = buildError('Something went wrong');

      expect(result).toEqual({
        success: false,
        data: null,
        error: 'Something went wrong',
      });
    });

    it('has correct type signature for error', () => {
      const result = buildError('Test error');
      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.error).toBe('Test error');
    });

    it('preserves error message exactly', () => {
      const message = 'User not found with id 123';
      const result = buildError(message);

      expect(result.error).toBe(message);
    });

    it('works with detailed error messages', () => {
      const message = 'Validation failed: Field "email" is invalid';
      const result = buildError(message);

      expect(result.error).toBe(message);
      expect(result.success).toBe(false);
    });

    it('returns a new reference each time', () => {
      const result1 = buildError('Error 1');
      const result2 = buildError('Error 1');

      expect(result1).not.toBe(result2);
      expect(result1).toEqual(result2);
    });

    it('does not include meta field', () => {
      const result = buildError('Test');
      expect('meta' in result).toBe(false);
    });
  });

  describe('buildPaginated', () => {
    it('returns paginated response with exact shape', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const meta: ApiMeta = { total: 10, page: 1, limit: 2 };
      const result = buildPaginated(data, meta);

      expect(result).toEqual({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
        error: null,
        meta: { total: 10, page: 1, limit: 2 },
      });
    });

    it('has correct type signature for paginated', () => {
      const data = [{ id: 1 }];
      const meta: ApiMeta = { total: 100, page: 1, limit: 10 };
      const result = buildPaginated(data, meta);

      expect(result.success).toBe(true);
      expect(result.error).toBeNull();
      expect(result.meta).toBeDefined();
    });

    it('includes meta with total, page, and limit', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const meta: ApiMeta = { total: 50, page: 2, limit: 25 };
      const result = buildPaginated(data, meta);

      expect(result.meta).toEqual({
        total: 50,
        page: 2,
        limit: 25,
      });
    });

    it('reflects correct meta values', () => {
      const data: Array<{ id: number }> = [];
      const meta: ApiMeta = { total: 0, page: 1, limit: 10 };
      const result = buildPaginated(data, meta);

      expect(result.meta?.total).toBe(0);
      expect(result.meta?.page).toBe(1);
      expect(result.meta?.limit).toBe(10);
    });

    it('works with different page values', () => {
      const data = [{ id: 21 }, { id: 22 }];
      const meta: ApiMeta = { total: 100, page: 3, limit: 10 };
      const result = buildPaginated(data, meta);

      expect(result.meta?.page).toBe(3);
    });

    it('works with different limit values', () => {
      const data: Array<{ id: number }> = Array.from({ length: 50 }, (_, i) => ({ id: i }));
      const meta: ApiMeta = { total: 200, page: 1, limit: 50 };
      const result = buildPaginated(data, meta);

      expect(result.meta?.limit).toBe(50);
    });

    it('returns a new reference, not the input objects', () => {
      const data = [{ id: 1 }];
      const meta: ApiMeta = { total: 10, page: 1, limit: 1 };
      const result = buildPaginated(data, meta);

      expect(result).not.toBe(data);
      expect(result.meta).not.toBe(meta);
      expect(result.data).toBe(data); // data array reference preserved
    });

    it('does not mutate input data', () => {
      const data: Array<{ id: number }> = [{ id: 1 }];
      const meta: ApiMeta = { total: 10, page: 1, limit: 1 };
      const originalData = JSON.stringify(data);

      buildPaginated(data, meta);

      expect(JSON.stringify(data)).toBe(originalData);
    });

    it('does not mutate input meta', () => {
      const data: Array<{ id: number }> = [{ id: 1 }];
      const meta: ApiMeta = { total: 10, page: 1, limit: 1 };
      const originalMeta = JSON.stringify(meta);

      buildPaginated(data, meta);

      expect(JSON.stringify(meta)).toBe(originalMeta);
    });
  });

  describe('Immutability', () => {
    it('buildSuccess returns immutable envelope', () => {
      const data = { value: 1 };
      const result = buildSuccess(data);

      expect(() => {
        (result as any).success = false;
      }).toThrow();

      expect(result.success).toBe(true);
    });

    it('buildError returns immutable envelope', () => {
      const result = buildError('Test');

      expect(() => {
        (result as any).error = 'Changed';
      }).toThrow();

      expect(result.error).toBe('Test');
    });

    it('buildPaginated returns immutable envelope', () => {
      const data = [{ id: 1 }];
      const meta: ApiMeta = { total: 10, page: 1, limit: 1 };
      const result = buildPaginated(data, meta);

      expect(() => {
        (result as any).meta = { total: 20, page: 2, limit: 10 };
      }).toThrow();
    });
  });
});
