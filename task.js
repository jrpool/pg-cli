/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

/// ///// IMPORTS ///// ///

const {Client} = require('pg');

const Table = require('cli-table2');

const {isPositiveInt, isPositiveIntRange} = require('./src/validate');

/// ///// GENERAL FUNCTIONS ///// ///

/// Define a function that returns a database function invocation.
const mkFnCall = args => {
  const fnArgs = args.slice(1).join(', ');
  return 'select * from ' + args[0] + '(' + fnArgs + ')';
};

/// Define a function that acts on a message.
const handleMessage = (messages, messageKey, symbol, replacement) => {
  let message = messages[messageKey];
  if (symbol) {
    message = message.replace(RegExp(symbol, 'g'), replacement);
  }
  console.log(message);
};

/**
  Define a function that executes a function in the tasks database and
  handles its result.
*/
const callFn = (messages, handler, fnName, ...fnArgs) => {
  const client = new Client({
    user: 'taskmaster',
    database: 'tasks'
  });
  client.connect().then(
    () => {
      console.log('Connected to tasks database');
      return client.query(mkFnCall([fnName, ...fnArgs]));
    }
  ).then(
    result => {
      console.log(fnName + ' executed');
      handler(messages, result);
      return client.end()
    }
  ).then(
    () => {
      console.log('Disconnected from tasks database');
    }
  ).catch(
    error => {
      console.log('Error (' + fnName + '): ' + error.message);
    }
  );
};

/// ///// COMMAND-SPECIFIC HANDLERS ///// ///

/// Define a handler for the result of the help command.
const helpHandler = messages => {
  handleMessage(messages, 'helpTip');
};

/// Define a handler for the result of the add command.
const addHandler = (messages, result) => {
  handleMessage(messages, 'addReport', '«addResult»', result);
};

/**
  Define a handler for the result of the done command.
*/
const doneHandler = (messages, result) => {
  const rows = result.rows;
  if (rows.length) {
    for (const row of rows) {
      handleMessage(
        messages, 'doneReport','«id+doneResult»',
        row.identifier + ' ' + row.what
      );
    }
  }
  else {
    handleMessage(messages, 'doneMissingFail');
  }
};

/// Define a handler for the result of the list command.
const listHandler = (messages, result) => {
  const table = new Table({
    head: [messages.listCol0Head, messages.listCol1Head]
  });
  const rows = result.rows;
  if (rows.length) {
    for (const row of rows) {
      table.push([row.identifier, row.what]);
    }
  }
  const footer =
    rows.length === 1 ? messages.listSumReport1 : messages.listSumReport2;
  const listMessages = {'table': [table.toString(), footer].join('\n')};
  handleMessage(listMessages, 'table', '«rows.length»', rows.length);
};

/// Define a handler for the result of the reset command.
const resetHandler = (messages) => {
  handleMessage(messages, 'resetReport');
};

/// ///// EXECUTION ///// ///

/// Identify the command-line arguments.
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
    if (isPositiveIntRange(args[1])) {
      callFn(messages, doneHandler, 'done', args[1].split('-'));
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
