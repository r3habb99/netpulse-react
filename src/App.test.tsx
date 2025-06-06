
import App from './App';

describe('App Component', () => {
  test('App module can be imported', () => {
    expect(App).toBeDefined();
    expect(typeof App).toBe('function');
  });

  test('App is a React component', () => {
    expect(App.prototype).toBeDefined();
  });
});
