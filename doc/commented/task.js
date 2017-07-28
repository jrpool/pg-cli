/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

// Import the validate module.
const validate = require('./src/validate');

// Import the util module.
const util = require('./src/util');

// Import the “messages” object from the messages module.
const {messages} = module.require('./src/messages');

// Identify the command-line arguments.
const args = process.argv.slice(2);

// If a command is named:
if (args[0] !== undefined) {
  // If it is “help” and the arguments are valid:
  if (args[0] === 'help' && args.length === 1) {
    // Perform the command.
    util.helpHandler(messages);
  }
  // Otherwise, if it is “add” and the arguments are valid:
  else if (args[0] === 'add' && args.length === 2 && args[1].length) {
    // Perform the command.
    util.callFn(messages, util.addHandler, 'add', args[1]);
  }
  // Otherwise, if it is “done”, there is 1 more argument, and it is nonblank:
  else if (args[0] === 'done' && args.length === 2 && args[1].length) {
    // If the argument is a positive integer:
    if (validate.isPositiveInt(args[1])) {
      // Perform the command.
      util.callFn(messages, util.doneHandler, 'done', args[1]);
    }
    // Otherwise, if the argument is a positive integer range:
    else if (validate.isPositiveIntRange(args[1])) {
      // Perform the command.
      util.callFn(messages, util.doneHandler, 'done', ...args[1].split('-'));
    }
    // Otherwise, i.e. if the argument is invalid:
    else {
      // Report the error.
      util.handleMessage(messages, 'commandFail');
    }
  }
  // Otherwise, if it is “list” and the arguments are valid:
  else if (args[0] === 'list' && args.length === 1) {
    // Perform the command.
    util.callFn(messages, util.listHandler, 'list');
  }
  // Otherwise, if it is “reset” and the arguments are valid:
  else if (args[0] === 'reset' && args.length === 1) {
    // Perform the command.
    util.callFn(messages, util.resetHandler, 'reset');
  }
  // Otherwise, i.e. if the command was invalid:
  else {
    // Report the error.
    util.handleMessage(messages, 'commandFail');
  }
}
// Otherwise, i.e. if no command is named:
else {
  // Report the error.
  util.handleMessage(messages, 'commandFail');
}
