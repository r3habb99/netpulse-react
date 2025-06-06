import { CONSTANTS } from './constants';

describe('Constants', () => {
  test('CONSTANTS object is defined', () => {
    expect(CONSTANTS).toBeDefined();
    expect(typeof CONSTANTS).toBe('object');
  });

  test('has test file URLs', () => {
    expect(CONSTANTS.TEST_FILES).toBeDefined();
    expect(CONSTANTS.TEST_FILES.SMALL).toBe('/test-files/1kb.bin');
    expect(CONSTANTS.TEST_FILES.MEDIUM).toBe('/test-files/10kb.bin');
    expect(CONSTANTS.TEST_FILES.LARGE).toBe('/test-files/100kb.bin');
  });

  test('has UI configuration', () => {
    expect(CONSTANTS.UI).toBeDefined();
    expect(CONSTANTS.UI.ANIMATIONS).toBeDefined();
    expect(CONSTANTS.UI.BREAKPOINTS).toBeDefined();
  });

  test('test files have correct paths', () => {
    expect(CONSTANTS.TEST_FILES.small).toBe('/test-files/1kb.bin');
    expect(CONSTANTS.TEST_FILES.medium).toBe('/test-files/10kb.bin');
    expect(CONSTANTS.TEST_FILES.large).toBe('/test-files/100kb.bin');
  });

  test('UI breakpoints are numbers', () => {
    expect(typeof CONSTANTS.UI.BREAKPOINTS.MOBILE).toBe('number');
    expect(typeof CONSTANTS.UI.BREAKPOINTS.TABLET).toBe('number');
    expect(typeof CONSTANTS.UI.BREAKPOINTS.DESKTOP).toBe('number');
  });
});
