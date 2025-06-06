import { NetworkTestService } from './NetworkTestService';

// Mock fetch for testing
global.fetch = jest.fn();

describe('NetworkTestService', () => {
  let service: NetworkTestService;

  beforeEach(() => {
    service = new NetworkTestService();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test('creates instance correctly', () => {
    expect(service).toBeInstanceOf(NetworkTestService);
  });

  test('service has public methods', () => {
    expect(service).toHaveProperty('startCompleteTest');
    expect(service).toHaveProperty('getTestHistory');
    expect(service).toHaveProperty('clearTestHistory');
    expect(service).toHaveProperty('stop');
    expect(service).toHaveProperty('getStatus');
    expect(service).toHaveProperty('isTestRunning');
  });

  test('getStatus returns correct structure', () => {
    const status = service.getStatus();
    expect(status).toHaveProperty('isRunning');
    expect(status).toHaveProperty('currentTest');
    expect(typeof status.isRunning).toBe('boolean');
  });

  test('isTestRunning returns boolean', () => {
    const isRunning = service.isTestRunning();
    expect(typeof isRunning).toBe('boolean');
  });

  test('getTestHistory returns array', () => {
    const history = service.getTestHistory();
    expect(Array.isArray(history)).toBe(true);
  });
});
