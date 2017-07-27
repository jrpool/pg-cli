import {expect} from 'chai';
const {execSync} = require('child_process');
const {isPositiveInt, isPositiveIntRange} = require('./src/validate');
const {mkFnCall} = require('./task.js');

describe('validate', function() {

  context('positive integer', function() {

    it('valid argument', function() {
      expect(isPositiveInt('34').true);
    });

    it('negative argument', function() {
      expect(isPositiveInt('-34').false);
    });

    it('noninteger argument', function() {
      expect(isPositiveInt('34.5').false);
    });

    it('nonnumeric argument', function() {
      expect(isPositiveInt('3+5').false);
    });

    it('zero argument', function() {
      expect(isPositiveInt('0').false);
    });

  });

  context('positive integer range', function() {

    it('valid range with distinct bounds', function() {
      expect(isPositiveInt('34-45').true);
    });

    it('valid but alphabetically descending range', function() {
      expect(isPositiveInt('4-15').true);
    });

    it('valid range with identical bounds', function() {
      expect(isPositiveInt('34-34').true);
    });

    it('partly nonpositive range', function() {
      expect(isPositiveInt('0-3').false);
    });

    it('partly negative range', function() {
      expect(isPositiveInt('-6-3').false);
    });

    it('noninteger bound', function() {
      expect(isPositiveInt('20-34.5').false);
    });

    it('nonnumeric bound', function() {
      expect(isPositiveInt('5-x').false);
    });

    it('nonrange argument', function() {
      expect(isPositiveInt('17').false);
    });

    it('descending order', function() {
      expect(isPositiveInt('7-3').false);
    });

  });

});

describe('mkFnCall', function() {

  it('no argument', function() {
    expect(mkFnCall('someFunction')).equal('select * from someFunction()');
  });

  it('1 argument', function() {
    expect(mkFnCall('someFunction', 'someArg'))
      .equal('select * from someFunction(\'someArg\')');
  });

  it('2 arguments', function() {
    expect(mkFnCall('someFunction', 'thisArg', 17))
      .equal('select * from someFunction(\'thisArg\', \'17\')');
  });

  it('blank arguments', function() {
    expect(mkFnCall('someFunction', 'thisArg', 17, ''))
      .equal('select * from someFunction(\'thisArg\', \'17\', \'\')');
  });

});

describe('formulateMessage', function() {

  it('no replacement', function() {
    const messages = {
      'm0': 'This is message 0.',
      'm1': 'Every «item» is in its own «item» list.'
    };
    expect(formulateMessage(messages, 'm0')).equal('This is message 0.');
  });

  it('vacuous replacement', function() {
    const messages = {
      'm0': 'This is message 0.',
      'm1': 'Every «item» is in its own «item» list.'
    };
    expect(formulateMessage(messages, 'm0', '«thing»', 'car'))
      .equal('This is message 0.');
  });

  it('operative replacement', function() {
    const messages = {
      'm0': 'This is message 0.',
      'm1': 'Every «item» is in its own «item» list.'
    };
    expect(formulateMessage(messages, 'm1', '«item»', 'task'))
      .equal('Every task is in its own task list.');
  });

});

describe('task', function() {

  before('factory reset before initial test', function() {
    execSync('npm run dbdrop');
    execSync('npm run dbinit');
  });

  beforeEach('factory reset before each test', function() {
    execSync('node task reset');
  });

  after('factory reset after final test', function() {
    execSync('npm run dbdrop');
    execSync('npm run dbinit');
  });

  context('valid arguments', function() {

    it('first add command adds task 1', function() {
      const response = execSync(
        'node task add \'test the add module\''
      ).toString();
      expect(response).equal('Created task 1.\n');
    });

    it('second add command adds task 2', function() {
      execSync('node task add \'test the add module once\'');
      const response = execSync(
        'node task add \'test the add module again\''
      ).toString();
      expect(response).equal('Created task 2.\n');
    });

    it('done command on 1 task deletes it', function() {
      execSync('node task add \'test done\'');
      execSync('node task add \'test done again\'');
      const response = execSync('node task done 2').toString();
      expect(response).equal('Completed the task \'2 test done again\'.\n');
    });

    it('list command gets answer in correct format', function() {
      execSync('node task add \'test list\'');
      execSync('node task add \'test list again\'');
      const response = execSync('node task list').toString();
      expect(response).match(/^[^]+ID.+Description[^]+2 tasks\.\n$/);
    });

    it('reset command resets the list', function() {
      execSync('node task add \'test reset\'');
      execSync('node task add \'test reset again\'');
      const response = execSync('node task reset').toString();
      expect(response).equal('The list is empty and the next ID is 1.\n');
    });

    it('help command gets answer in correct format', function() {
      const response = execSync('node task help').toString();
      expect(response).match(/^\n=+\nThis application manages [^]+$/);
    });

  });

  context('invalid arguments', function() {

    it('add command with blank description', function() {
      const response = execSync('node task add \'\'').toString();
      expect(response).equal(
        'The command was unsuccessful because of a format error.\n'
      );
    });

    it('done command with an ID range containing no tasks', function() {
      const response = execSync('node task done 999-1002').toString();
      expect(response).equal(
        'The removal was unsuccessful because no such task exists.\n'
      );
    });

    it('done command with an ID range in descending order', function() {
      const response = execSync('node task done 2-1').toString();
      expect(response).equal(
        'The command was unsuccessful because of a format error.\n'
      );
    });

    it('done command with a nonnumeric ID', function() {
      const response = execSync('node task done V').toString();
      expect(response).equal(
        'The command was unsuccessful because of a format error.\n'
      );
    });

    it('invalid command name', function() {
      const response = execSync('node task kill 1').toString();
      expect(response).equal(
        'The command was unsuccessful because of a format error.\n'
      );
    });

  });

});
