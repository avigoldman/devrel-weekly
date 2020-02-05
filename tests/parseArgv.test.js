const parseArgv = require('../utils/parseArgv')
const mockConsole = require('jest-mock-console').default

test('returns a function', () => {
  const parseArgvFn = parseArgv(() => {})

  expect(parseArgvFn).toEqual(expect.any(Function)) 
})

test('the callback is called', () => {
  const callback = jest.fn(x => x)
  const parseArgvFn = parseArgv(callback)

  parseArgvFn({})

  expect(callback).toHaveBeenCalledTimes(1)
})

test('to date is validated', () => {
  const restore = mockConsole()
  const callback = jest.fn(x => x)
  const parseArgvFn = parseArgv(callback)

  parseArgvFn({
    to: 'invalid-date'
  })

  expect(callback.mock.calls.length).toBe(0)
  expect(console.log).toHaveBeenCalledTimes(1)

  restore() 
})

test('from date is validated', () => {
  const restore = mockConsole()
  const callback = jest.fn(x => x)
  const parseArgvFn = parseArgv(callback)

  parseArgvFn({
    from: 'invalid-date'
  })

  expect(callback.mock.calls.length).toBe(0)
  expect(console.log).toHaveBeenCalledTimes(1)

  restore() 
})