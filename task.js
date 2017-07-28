/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

const validate = require('./src/validate');

const util = require('./src/util');

const {messages} = module.require('./src/messages');

const args = process.argv.slice(2);

if (args[0] !== undefined) {
  if (args[0] === 'help' && args.length === 1) {
    util.helpHandler(messages);
  }
  else if (args[0] === 'add' && args.length === 2 && args[1].length) {
    util.callFn(messages, util.addHandler, 'add', args[1]);
  }
  else if (args[0] === 'done' && args.length === 2 && args[1].length) {
    if (validate.isPositiveInt(args[1])) {
      util.callFn(messages, util.doneHandler, 'done', args[1]);
    }
    else if (isPositiveIntRange(args[1])) {
      util.callFn(messages, util.doneHandler, 'done', ...args[1].split('-'));
    }
    else {
      util.handleMessage(messages, 'commandFail');
    }
  }
  else if (args[0] === 'list' && args.length === 1) {
    util.callFn(messages, util.listHandler, 'list');
  }
  else if (args[0] === 'reset' && args.length === 1) {
    util.callFn(messages, util.resetHandler, 'reset');
  }
  else {
    util.handleMessage(messages, 'commandFail');
  }
}
else {
  util.handleMessage(messages, 'commandFail');
}
