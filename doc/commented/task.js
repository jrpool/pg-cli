/**
  Manager of a list stored in a PostgreSQL database. Performs additions to it,
  deletions from it, and disclosures and resets of it in response to
  command-line arguments. Called by Node.js.
*/

//////// IMPORTS ////////

// Import Client from the pg module.
const {Client} = require('pg');

// Import the “cli-table2” module.
const Table = require('cli-table2');

// Import the validate objects from the validate module.
const {isNonblankString, areIntRangeStrings} = require('./src/validate');

//////// GENERAL FUNCTIONS ////////

/// Define a function that returns a database function invocation.
const makeFnCall = args => {
  // Identify the function arguments as a string, blank if none.
  const fnArgs = args.slice(1).join(', ');
  // Return the query.
  return 'select * from ' + args[0] + '(' + fnArgs + ')';
};

/// Define a function that acts on a message.
const handleMessage = (messages, messageKey, symbol, replacement) => {
  // Initialize the message.
  let message = messages[messageKey];
  // If there is a symbol to replace in it:
  if (symbol) {
    // Replace all instances of it.
    message = message.replace(RegExp(symbol, 'g'), replacement);
  }
  // Output the message.
  console.log(message);
};

/**
  Define a function that executes a function in the tasks database and
  handles its result.
*/
const execute = (messages, handler, fnName, ...fnArgs) => {
  // Create a client to connect to the tasks database.
  const client = new Client({
    user: manager,
    database: tasks
  });
  // Make the connection.
  client.connect().catch(
    // If the connection failed:
    error => {
      // Report this.
      console.log(
        'Connection to tasks database failed with message:\n'
        + error.message
      );
    }
  ).then(
    // If the connection succeeded:
    () => {
      // Report this.
      console.log('Connected to tasks database');
      // Execute the specified function.
      client.query(mkFnCall([fnName, ...fnArgs]));
    }
  ).catch(
    // If the execution failed:
    error => {
      console.log(
        'Execution of ' + fnName + ' failed with message:\n' + error.message
      );
    }
  ).then(
    // If the execution succeeded:
    result => {
      // Report this.
      console.log(fnName + ' executed');
      // Disconnect from the tasks database.
      client.end().then(
        // If the disconnection succeeded:
        () => {
          // Report this.
          console.log('Application disconnected from tasks database');
          // Handle the result of the function execution.
          handler(messages, result);
        },
        // Otherwise, i.e. if the disconnection failed:
        error => {
          // Report this.
          console.log(
            'Disconnection from tasks database failed with message:\n'
            + error.message
          );
        }
      );
    }
  )
};

//////// COMMAND-SPECIFIC HANDLERS ////////

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
  // Identify an array of the row objects in the result.
  const rows = result.rows;
  // If any tasks were removed:
  if (rows.length) {
    // For each of them:
    for (row of rows) {
      // Handle its values.
      handleMessage(
        messages, 'doneReport','«id+doneResult»',
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
    for (row of rows) {
      // Add it to the table.
      table.push([row.identifier, row.what]);
    };
  }
  // Identify a footer template for the table.
  const footer =
    rows.length === 1 ? messages.listSumReport1 : messages.listSumReport2;
  /*
    Identify a custom messages object for this command’s report.
  */
  const listMessages = {'table': [table.toString(), footer].join('\n')};
  // Handle the table and its footer template as a message.
  handleMessage(tableWrapper, 'table', '«rows.length»', rows.length);
};

/// Define a handler for the result of the reset command.
const resetHandler = (messages, result) => {
  handleMessage(messages, resetReport);
};

//////// EXECUTION ////////

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
    execute(messages, addHandler, 'add', args[1]);
  }
  // Otherwise, if it is “done”, there is 1 more argument, and it is nonblank:
  else if (args[0] === 'done' && args.length === 2 && args[1].length) {
    // If the argument is a positive integer:
    if (isPositiveInt(args[1])) {
      // Perform the command.
      execute(messages, doneHandler, 'done', args[1]);
    }
    // Otherwise, if the argument is a positive integer range:
    if (isPositiveIntRange(args[1])) {
      // Perform the command.
      execute(messages, doneHandler, 'done', args[1].split('-'));
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
    execute(messages, listHandler, 'list');
  }
  // Otherwise, if it is “reset” and the arguments are valid:
  else if (args[0] === 'reset' && args.length === 1) {
    // Perform the command.
    execute(messages, resetHandler, 'reset');
  }
  // Otherwise, i.e. if the command was invalid:
  else {
    // Report the error.
    handleMessage(messages, 'commandFail');
  }
}
