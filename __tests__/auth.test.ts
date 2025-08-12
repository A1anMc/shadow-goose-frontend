import { authService } from '../src/lib/auth';

describe('authService', () => {
  const realFetch = global.fetch as any;
  const realLocalStorage = global.localStorage as any;

  beforeEach(() => {
    (global as any).localStorage = {
      store: {} as Record<string, string>,
      getItem(key: string) { return this.store[key] || null; },
      setItem(key: string, value: string) { this.store[key] = value; },
      removeItem(key: string) { delete this.store[key]; },
      clear() { this.store = {}; },
    };
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
    (global as any).localStorage = realLocalStorage;
  });

  it('stores token and user on successful login', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ access_token: 't', token_type: 'bearer', user: { id: 1, username: 'u', email: 'e', role: 'admin', name: 'User' } })
    });

    const res = await authService.login({ username: 'u', password: 'p' });
    expect(res.access_token).toBe('t');
    expect(localStorage.getItem('sge_auth_token')).toBe('t');
    expect(localStorage.getItem('sge_user_data')).toBeTruthy();
  });

  it('validateToken returns false without token', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({ ok: false });
    const ok = await authService.validateToken();
    expect(ok).toBe(false);
  });
});
