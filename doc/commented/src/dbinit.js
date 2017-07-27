const fs = require('fs');

const {Client} = require('pg');

/// Create manager role and create and populate tasks database.

/*
  Identify the statements to create the tasks database and its owner.
  (PostgreSQL prohibits combining the statement creating the database
  with any other statement, so it would require 3 files to store these
  4 statements.)
*/
const initCommands = [
  'create role taskmaster login',
  'comment on role taskmaster is \'Manager of task data\'',
  'create database tasks owner taskmaster',
  'comment on database tasks is \'Tasks not yet performed\''
];

// Create a client to connect to the postgres database.
const client0 = new Client({database: 'postgres'});
// Make the connection. After it is complete:
client0.connect().then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Connected to postgres database');
    // Execute the statement creating the tasks database owner.
    return client0.query(initCommands[0]);
  }
// After the execution is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Taskmaster role created');
    // Execute the statement documenting the tasks database owner.
    return client0.query(initCommands[1]);
  }
// After the execution is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Taskmaster role documented');
    // Execute the statement creating the tasks database.
    return client0.query(initCommands[2]);
  }
// After the execution is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Tasks database created');
    // Execute the statement documenting the tasks database.
    return client0.query(initCommands[3]);
  }
// After the execution is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Tasks database documented');
    // Disconnect from the postgres database.
    return client0.end();
  }
// After the disconnection is complete:
).then(
  // If it succeeded:
  () => {
    // Report this.
    console.log('Disconnected from postgres database');
    // Identify the statements to populate the tasks database.
    fs.readFile('./sql/schema.sql', 'utf8', (err, data) => {
      // If the identification failed:
      if (err) {
        // Report this.
        console.log('Error (./sql/schema.sql): ' + err.message);
      }
      // Otherwise, i.e. if the identification succeeded:
      else {
        // Create a client to connect to the tasks database as its owner.
        const client1 = new Client({
          user: 'taskmaster',
          database: 'tasks'
        });
        // Make the connection. After it is complete:
        client1.connect().then(
          // If the connection succeeded:
          () => {
            // Report this.
            console.log('Connected to tasks database');
            // Execute the statements to populate the database.
            return client1.query(data);
          }
        // When the execution is complete:
        ).then(
          // If it succeeded:
          () => {
            // Report this.
            console.log('Tasks database populated');
            // Disconnect from the tasks database.
            return client1.end();
          }
        // When the disconnection is complete:
        ).then(
          // If it succeeded:
          () => {
            // Report this.
            console.log('Disconnected from tasks database');
          }
        // If any error was thrown:
        ).catch(
          error => {
            // Report it.
            console.log('Error (client1): ' + error.message);
            // Disconnect from the tasks database if still connected.
            client1.end();
          }
        );
      }
    });
  }
// If any error was thrown:
).catch(
  error => {
    // Report it.
    console.log('Error (client0): ' + error.message);
    // Disconnect from the postgres database if still connected.
    client0.end();
  }
);
