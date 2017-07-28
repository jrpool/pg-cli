/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

const {isPositiveInt, isPositiveIntRange} = require('./src/validate');

const {
  helpHandler, callFn, handleMessage, addHandler, doneHandler, listHandler,
  resetHandler
} = require('./src/util');

const args = process.argv.slice(2);

const messages = module.require('./src/messages').messages;

if (args[0] !== undefined) {
  if (args[0] === 'help' && args.length === 1) {
    helpHandler(messages);
  }
  else if (args[0] === 'add' && args.length === 2 && args[1].length) {
    callFn(messages, addHandler, 'add', args[1]);
  }
  else if (args[0] === 'done' && args.length === 2 && args[1].length) {
    if (isPositiveInt(args[1])) {
      callFn(messages, doneHandler, 'done', args[1]);
    }
    else if (isPositiveIntRange(args[1])) {
      callFn(messages, doneHandler, 'done', ...args[1].split('-'));
    }
    else {
      handleMessage(messages, 'commandFail');
    }
  }
  else if (args[0] === 'list' && args.length === 1) {
    callFn(messages, listHandler, 'list');
  }
  else if (args[0] === 'reset' && args.length === 1) {
    callFn(messages, resetHandler, 'reset');
  }
  else {
    handleMessage(messages, 'commandFail');
  }
}
else {
  handleMessage(messages, 'commandFail');
}
