/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

const validate = require('./src/validate');

const util = require('./src/util');

const {messages} = module.require('./src/messages');

const args = process.argv.slice(2);


//this top level wrapper if statement could be handled in an else at the bottom of the chain of if/else statements
//and does not need to encapsulate the rest of the code. Let all the inital clases handle non-erroroneous instances,
//then use the final else to handle undefined, null, or unsupported arguments. The fact that I see the same line
//repeated on lines 35, 45, & 49 is a red flag for me that this could be refactored to be cleaner.
//consider making each function more concise and use a switch statement.
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
    else if (validate.isPositiveIntRange(args[1])) {
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
