module.exports = [
  {
    type: 'list',
    name: 'type',
    message: 'What type of scaffold do you want to get?',
    choices: ['npm module', 'git repo', 'json file', 'basic', 'blank'],
    default: 4,
    filter: item => item.split(' ')[0]
  },
  {
    type: 'input',
    name: 'place',
    message: hash => `Which ${hash.type} do you want to use?`,
    default: '.',
    when: hash => hash.type !== 'blank' && hash.type !== 'basic'
  },
  {
    type: 'input',
    name: 'name',
    message: 'What should it be called?',
    default: 'my-app'
  }
];
