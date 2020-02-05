const analyzeNotes = require('../utils/analyzeNotes');
const formatDate = require('date-fns/format')
const sub = require('date-fns/sub')

function formattedMonth(subtract) {
  return formatDate(sub(new Date(), { months: subtract }), 'yyyy-MM')
}

test('notes are converted to a table correctly', () => {
  const notes = [
    { title: '', date: sub(new Date(), { months: 1 }), tags: ['one'] },
    { title: '', date: sub(new Date(), { months: 1 }), tags: ['one', 'two'] },
    { title: '', date: sub(new Date(), { months: 2 }), tags: ['one', 'two'] },
    { title: '', date: sub(new Date(), { months: 1 }), tags: ['one', 'two', 'three'] },
    { title: '', date: sub(new Date(), { months: 2 }), tags: ['one', 'two', 'three'] },
    { title: '', date: sub(new Date(), { months: 3 }), tags: ['one', 'two', 'three'] },
  ]

  expect(analyzeNotes(notes)).toEqual([
    [ 'month',          'one', 'three', 'two'  ],
    [ formattedMonth(3),  1,     1,       1    ],
    [ formattedMonth(2),  2,     1,       2    ],
    [ formattedMonth(1),  3,     1,       2    ]
  ]); 
});

test('tags are blank (not zero) until they first appear', () => {
  const notes = [
    { title: '', date: sub(new Date(), { months: 1 }), tags: ['one'] },
    { title: '', date: sub(new Date(), { months: 1 }), tags: ['one', 'two'] },
    { title: '', date: sub(new Date(), { months: 2 }), tags: ['one', 'two'] },
    { title: '', date: sub(new Date(), { months: 1 }), tags: ['one', 'two', 'three'] },
    { title: '', date: sub(new Date(), { months: 2 }), tags: ['one', 'two', 'three'] },
    { title: '', date: sub(new Date(), { months: 3 }), tags: [ 'two', 'three'] },
  ]

  expect(analyzeNotes(notes)).toEqual([
    [ 'month',          'one', 'three', 'two'  ],
    [ formattedMonth(3),  '',    1,       1    ],
    [ formattedMonth(2),  2,     1,       2    ],
    [ formattedMonth(1),  3,     1,       2    ]
  ]); 
});