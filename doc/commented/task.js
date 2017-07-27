/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

/// ///// IMPORTS ///// ///

// Import Client from the pg module.
const {Client} = require('pg');

// Import the “cli-table2” module.
const Table = require('cli-table2');

// Import the validation objects from the validate module.
const {isPositiveInt, isPositiveIntRange} = require('./src/validate');

/// ///// GENERAL FUNCTIONS ///// ///

/**
  Define a function that returns a database function invocation.
  Preconditions:
    0. args has length 1 or more.
    1. Each element of args is defined.
    2. args[0] is a valid PostgreSQL identifier.
*/
const mkFnCall = args => {
  // Identify the function arguments as a string, blank if none.
  const fnArgs = args.slice(1).map(arg => "'" + arg + "'").join(', ');
  // Return the query.
  return 'select * from ' + args[0] + '(' + fnArgs + ')';
};

/**
  Define a function that formulates a message.
  Preconditions:
    0. messages is an object.
    1. messageKey is one of the properties of messages.
    2. symbol is a nonblank string without any RegExp metacharacters.
    3. replacement is a string.
*/
const formulateMessage = (messages, messageKey, symbol, replacement) => {
  // Initialize the message.
  let message = messages[messageKey];
  // If there is a symbol to replace in it:
  if (symbol) {
    // Replace all instances of it.
    message = message.replace(RegExp(symbol, 'g'), replacement);
  }
  // Return the message.
  return message;
};

/// Define a function that acts on a message.
const handleMessage = (messages, messageKey, symbol, replacement) => {
  // Formulate and output the message.
  console.log(formulateMessage(messages, messageKey, symbol, replacement));
};

/**
  Define a function that connects to the tasks database, executes a function
  in it, handles its result, and disconnects from the database.
*/
const callFn = (messages, handler, fnName, ...fnArgs) => {
  // Create a client to connect to the tasks database.
  const client = new Client({
    user: 'taskmaster',
    database: 'tasks'
  });
  // Make the connection. After it is complete:
  client.connect().then(
    // If it succeeded:
    () => {
      // Execute the specified function and return its result.
      return client.query(mkFnCall([fnName, ...fnArgs]));
    }
  // After the execution is complete:
  ).then(
    // If it succeeded:
    result => {
      // Handle the result of the function execution.
      handler(messages, result);
      // Disconnect from the tasks database.
      return client.end();
    }
  // After the disconnection is complete:
  ).catch(
    // If any error was thrown:
    error => {
      // Report it.
      console.log('Error (' + fnName + '): ' + error.message);
      // Disconnect from the tasks database, if still connected.
      client.end();
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
  handleMessage(
    messages, 'addReport', '«addResult»', result.rows[0].identifier
  );
};

/// Define a handler for the result of the done command.
const doneHandler = (messages, result) => {
  // Identify an array of the row objects in the result.
  const rows = result.rows;
  // If any tasks were removed:
  if (rows.length) {
    // For each of them:
    for (const row of rows) {
      // Handle its values.
      handleMessage(
        messages, 'doneReport', '«idAndDoneResult»',
        row.identifier + ' ' + row.what
      );
    }
  }
  // Otherwise, i.e. if no task was removed:
  else {
    // Report this.
    handleMessage(messages, 'doneMissingFail');
  }
};

/// Define a handler for the result of the list command.
const listHandler = (messages, result) => {
  // Create a table with column headers for list items.
  const table = new Table({
    head: [messages.listCol0Head, messages.listCol1Head]
  });
  // Identify an array of the row objects in the result, in ID order.
  const rows = result.rows;
  // If any tasks exist:
  if (rows.length) {
    // For each of them:
    for (const row of rows) {
      // Add it to the table.
      table.push([row.identifier, row.what]);
    }
  }
  // Identify a footer template for the table.
  const footer =
    rows.length === 1 ? messages.listSumReport1 : messages.listSumReport2;
  /*
    Identify a custom messages object for this command’s report.
  */
  const listMessages = {'table': [table.toString(), footer].join('\n')};
  // Handle the table and its footer template as a message.
  handleMessage(listMessages, 'table', '«rows.length»', rows.length);
};

/// Define a handler for the result of the reset command.
const resetHandler = (messages) => {
  handleMessage(messages, 'resetReport');
};

/// ///// EXECUTION ///// ///

/// Identify the command-line arguments.
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

exports.mkFnCall = mkFnCall;
exports.formulateMessage = formulateMessage;
