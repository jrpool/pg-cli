/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

// Import the validation objects from the validate module.
const {isPositiveInt, isPositiveIntRange} = require('./src/validate');

// Import the utility functions from the util module.
const {
  helpHandler, callFn, handleMessage, addHandler, doneHandler, listHandler,
  resetHandler
} = require('./src/util');

// Identify the command-line arguments.
const args = process.argv.slice(2);

// Import the “messages” object from the messages module.
const messages = module.require('./src/messages').messages;

// If a command is named:
if (args[0] !== undefined) {
  // If it is “help” and the arguments are valid:
  if (args[0] === 'help' && args.length === 1) {
    // Perform the command.
    helpHandler(messages);
  }
  // Otherwise, if it is “add” and the arguments are valid:
  else if (args[0] === 'add' && args.length === 2 && args[1].length) {
    // Perform the command.
    callFn(messages, addHandler, 'add', args[1]);
  }
  // Otherwise, if it is “done”, there is 1 more argument, and it is nonblank:
  else if (args[0] === 'done' && args.length === 2 && args[1].length) {
    // If the argument is a positive integer:
    if (isPositiveInt(args[1])) {
      // Perform the command.
      callFn(messages, doneHandler, 'done', args[1]);
    }
    // Otherwise, if the argument is a positive integer range:
    else if (isPositiveIntRange(args[1])) {
      // Perform the command.
      callFn(messages, doneHandler, 'done', ...args[1].split('-'));
    }
    // Otherwise, i.e. if the argument is invalid:
    else {
      // Report the error.
      handleMessage(messages, 'commandFail');
    }
  }
  // Otherwise, if it is “list” and the arguments are valid:
  else if (args[0] === 'list' && args.length === 1) {
    // Perform the command.
    callFn(messages, listHandler, 'list');
  }
  // Otherwise, if it is “reset” and the arguments are valid:
  else if (args[0] === 'reset' && args.length === 1) {
    // Perform the command.
    callFn(messages, resetHandler, 'reset');
  }
  // Otherwise, i.e. if the command was invalid:
  else {
    // Report the error.
    handleMessage(messages, 'commandFail');
  }
}
// Otherwise, i.e. if no command is named:
else {
  // Report the error.
  handleMessage(messages, 'commandFail');
}
