const fs = require('fs');

const {Client} = require('pg');

/// Destruction of tasks database.

// Identify the statements to destroy the tasks database.
fs.readFile('./dbdrop.sql', 'utf8', (err, data) => {
  // If the identification failed:
  if (err) {
    // Report this.
    console.log('Error (./dbdrop.sql): ' + err.message);
  }
  // Otherwise, i.e. if the identification succeeded:
  else {
    // Create a client to connect to the postgres database.
    const client = new Client({database: 'postgres'});
    // Make the connection.
    client.connect().catch(
      // If the connection failed:
      error => {
        // Report this.
        console.log(
          'Connection to postgres database failed with message:\n'
          + error.message
        );
      }
    ).then(
      // If the connection succeeded:
      () => {
        // Report this.
        console.log('Connected to postgres database');
        // Execute the statements destroying the tasks database.
        client.query(data);
      }
    ).catch(
      // If the destruction failed:
      error => {
        console.log(
          'Tasks database destruction failed with message:\n' + error.message
        );
      }
    ).then(
      // If the destruction succeeded:
      result => {
        // Report this.
        console.log(
          'Tasks database and manager role destroyed with messages:\n'
          + result
        );
        // Disconnect from the postgres database.
        client.end();
      }
    ).catch(
      // If the disconnection failed:
      error => {
        // Report this.
        console.log(
          'Disconnection from postgres database failed with message:\n'
          + error.message
        );
      }
    ).then(
      // If the disconnection succeeded:
      () => {
        // Report this.
        console.log('Disconnected from postgres database');
      }
    );
  }
});
