const generateFilter = require('../utils/generateFilter')
const sub = require('date-fns/sub')

test('returns a function', () => {
  const filter = generateFilter({})

  expect(filter).toEqual(expect.any(Function)) 
})

test('fromDate', () => {
  const filter = generateFilter({
    fromDate: sub(new Date(), { years: 1 })
  })


  // after from date
  expect(filter({
    title: '',
    date: new Date(),
    tags: [],
  })).toBe(true)
  
  // before from date
  expect(filter({
    title: '',
    date: sub(new Date(), { years: 2 }),
    tags: [],
  })).toBe(false)
})

test('toDate', () => {
  const filter = generateFilter({
    toDate: sub(new Date(), { years: 1 })
  })

  // before to date
  expect(filter({
    title: '',
    date: sub(new Date(), { years: 2 }),
    tags: [],
  })).toBe(true)
  
  // after to date
  expect(filter({
    title: '',
    date: new Date(),
    tags: [],
  })).toBe(false)
})


test('includeTags', () => {
  const filter = generateFilter({
    includeTags: [ 'this-tag' ]
  })

  // has tag
  expect(filter({
    title: '',
    date: new Date(),
    tags: [ 'this-tag' ],
  })).toBe(true)
  
  // doesn't have tag
  expect(filter({
    title: '',
    date: new Date(),
    tags: [ 'a-different-tag' ],
  })).toBe(false)
})

test('excludeTags', () => {
  const filter = generateFilter({
    excludeTags: [ 'this-tag' ]
  })

  // has tag
  expect(filter({
    title: '',
    date: new Date(),
    tags: [ 'this-tag' ],
  })).toBe(false)
  
  // doesn't have tag
  expect(filter({
    title: '',
    date: new Date(),
    tags: [ 'a-different-tag' ],
  })).toBe(true)
})


test('title', () => {
  const filter = generateFilter({
    title: 'this'
  })

  // has the title match
  expect(filter({
    title: 'this is awesome',
    date: new Date(),
    tags: [],
  })).toBe(true)
  
  // doesn't have the title match
  expect(filter({
    title: 'another thing that is awesome',
    date: new Date(),
    tags: [],
  })).toBe(false)
})