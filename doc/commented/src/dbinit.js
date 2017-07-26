const fs = require('fs');

const {Client} = require('pg');

/// Create manager role and create and populate tasks database.

// Identify the statements to create the tasks database.
fs.readFile('./sql/dbinit.sql', 'utf8', (err, data) => {
  // If the identification failed:
  if (err) {
    // Report this.
    console.log('Error (./sql/dbinit.sql): ' + err.message);
  }
  // Otherwise, i.e. if the identification succeeded:
  else {
    // Create a client to connect to the postgres database.
    const client0 = new Client({database: 'postgres'});
    // Make the connection. After it is complete:
    client0.connect().then(
      // If it succeeded:
      () => {
        // Report this.
        console.log('Connected to postgres database');
        // Execute the statements creating the tasks database and its owner.
        client0.query(data);
      }
    // After the creations are complete:
    ).then(
      // If they succeeded:
      () => {
        // Report this.
        console.log('Manager role and tasks database created');
        // Disconnect from the postgres database.
        client0.end();
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
              user: 'manager',
              database: 'tasks'
            });
            // Make the connection. After it is complete:
            client1.connect().then(
              // If the connection succeeded:
              () => {
                // Report this.
                console.log('Connected to tasks database');
                // Execute the statements to populate the database.
                client1.query(data)
              }
            // When the execution is complete:
            ).then(
              // If it succeeded:
              () => {
                // Report this.
                console.log('Tasks database populated');
                // Disconnect from the tasks database.
                client1.end();
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
      }
    );
  }
});
