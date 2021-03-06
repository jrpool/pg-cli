/**
  Management utilities for a list stored in a PostgreSQL database. Performs
  additions to it, deletions from it, and disclosures and resets of it.
*/

/// ///// IMPORTS ///// ///

const {Client} = require('pg');

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
  const fnArgs = args.slice(1).map(arg => '\'' + arg + '\'').join(', ');
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
  let message = messages[messageKey];
  if (symbol) {
    message = message.replace(RegExp(symbol, 'g'), replacement);
  }
  return message;
};

/// Define a function that acts on a message.
exports.handleMessage = (messages, messageKey, symbol, replacement) => {
  console.log(
    exports.formulateMessage(messages, messageKey, symbol, replacement)
  );
};

/**
  Define a function that connects to the tasks database, executes a function
  in it, handles its result, and disconnects from the database.
*/
exports.callFn = (messages, handler, fnName, ...fnArgs) => {
  const client = new Client({
    user: 'taskmaster',
    database: 'tasks'
  });
  client.connect().then(
    () => {
      return client.query(exports.mkFnCall([fnName, ...fnArgs]));
    }
  ).then(
    result => {
      handler(messages, result);
      return client.end();
    }
  ).catch(
    error => {
      console.log('Error (' + fnName + '): ' + error.message);
      client.end();
    }
  );
};

/// ///// COMMAND-SPECIFIC HANDLERS ///// ///

/// Define a handler for the result of the help command.
exports.helpHandler = messages => {
  exports.handleMessage(messages, 'helpTip');
};

/// Define a handler for the result of the add command.
exports.addHandler = (messages, result) => {
  exports.handleMessage(
    messages, 'addReport', '«addResult»', result.rows[0].identifier
  );
};

/// Define a handler for the result of the done command.
exports.doneHandler = (messages, result) => {
  const rows = result.rows;
  if (rows.length) {
    for (const row of rows) {
      exports.handleMessage(
        messages, 'doneReport', '«idAndDoneResult»',
        row.identifier + ' ' + row.what
      );
    }
  }
  else {
    exports.handleMessage(messages, 'doneMissingFail');
  }
};

/// Define a handler for the result of the list command.
exports.listHandler = (messages, result) => {
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
  exports.handleMessage(listMessages, 'table', '«rows.length»', rows.length);
};

/// Define a handler for the result of the reset command.
exports.resetHandler = (messages) => {
  exports.handleMessage(messages, 'resetReport');
};
