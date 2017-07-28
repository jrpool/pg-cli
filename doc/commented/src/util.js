/**
  Management utilities for a list stored in a PostgreSQL database. Performs
  additions to it, deletions from it, and disclosures and resets of it.
*/

/// ///// IMPORTS ///// ///

// Import Client from the pg module.
const {Client} = require('pg');

// Import the “cli-table2” module.
const Table = require('cli-table2');

/// ///// GENERAL FUNCTIONS ///// ///

/**
  Define a function that returns a database function invocation.
  Preconditions:
    0. args has length 1 or more.
    1. Each element of args is defined.
    2. args[0] is a valid PostgreSQL identifier.
*/
exports.mkFnCall = args => {
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
exports.formulateMessage = (messages, messageKey, symbol, replacement) => {
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
exports.handleMessage = (messages, messageKey, symbol, replacement) => {
  // Formulate and output the message.
  console.log(formulateMessage(messages, messageKey, symbol, replacement));
};

/**
  Define a function that connects to the tasks database, executes a function
  in it, handles its result, and disconnects from the database.
*/
exports.callFn = (messages, handler, fnName, ...fnArgs) => {
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
exports.helpHandler = messages => {
  handleMessage(messages, 'helpTip');
};

/// Define a handler for the result of the add command.
exports.addHandler = (messages, result) => {
  handleMessage(
    messages, 'addReport', '«addResult»', result.rows[0].identifier
  );
};

/// Define a handler for the result of the done command.
exports.doneHandler = (messages, result) => {
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
exports.listHandler = (messages, result) => {
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
exports.resetHandler = (messages) => {
  handleMessage(messages, 'resetReport');
};
