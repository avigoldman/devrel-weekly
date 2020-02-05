const resolve = require('../utils/resolve');

test('resolves file', () => {
  const spy = jest.spyOn(process, 'cwd');
  spy.mockReturnValue('/i/am/here');

  expect(resolve('../present')).toBe('/i/am/present'); 
});