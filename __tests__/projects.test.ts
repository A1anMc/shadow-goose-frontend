describe('projects service', () => {
  const realFetch = global.fetch as any;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_API_URL = 'https://api.example.com';
    (global as any).localStorage = {
      getItem: () => null,
      setItem: () => undefined,
      removeItem: () => undefined,
    };
  });

  afterEach(() => {
    (global as any).fetch = realFetch;
  });

  it('getProjects returns array from wrapped response', async () => {
    (global as any).fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ projects: [{ id: 1, name: 'P1' }] })
    });
    jest.resetModules();
    const { sgeProjectService } = await import('../src/lib/projects');
    const projects = await sgeProjectService.getProjects();
    expect(Array.isArray(projects)).toBe(true);
    expect(projects[0].name).toBe('P1');
  });
});
