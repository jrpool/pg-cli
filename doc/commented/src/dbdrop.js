const {Client} = require('pg');

/// Destruction of tasks database.

// Identify the statements to destroy the tasks database and its owner.
const dropCommands = [
  'drop database tasks',
  'drop role taskmaster'
];
// Create a client to connect to the postgres database.
const client = new Client({database: 'postgres'});
// Make the connection. After it is complete:
client.connect().then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Connected to postgres database');
    // Execute the statement destroying the tasks database.
    return client.query(dropCommands[0]);
  }
// After the execution is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Tasks database destroyed');
    // Execute the statement destroying the tasks database owner.
    return client.query(dropCommands[1]);
  }
// After the execution is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Taskmaster role destroyed');
    // Disconnect from the postgres database.
    return client.end();
  }
// After the disconnection is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Disconnected from postgres database');
  }
// If any error was thrown:
).catch(
  error => {
    // Report it.
    console.log('Error (client): ' + error.message);
    // Disconnect from the postgres database if still connected.
    client.end();
  }
);
