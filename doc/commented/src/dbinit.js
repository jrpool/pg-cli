const fs = require('fs');

const {Client} = require('pg');

/// Creation and population of tasks database.

// Identify the statements to create the tasks database.
fs.readFile('./dbinit.sql', 'utf8', (err, data) => {
  // If the identification failed:
  if (err) {
    // Report this.
    console.log('Error (./dbinit.sql): ' + err.message);
  }
  // Otherwise, i.e. if the identification succeeded:
  else {
    // Create a client to connect to the postgres database.
    const client0 = new Client({database: postgres});
    // Make the connection.
    client0.connect().catch(
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
        // Execute the statements creating the tasks database.
        client0.query(data);
      }
    // Await the completion of the creation of the tasks database.
    ).catch(
      // If the creation failed:
      error => {
        console.log(
          'Tasks database creation failed with message:\n' + error.message
        );
      }
    ).then(
      // If the creation succeeded:
      result => {
        // Report this.
        console.log('Tasks database created with message:\n' + result);
        // Disconnect from the postgres database.
        client0.end();
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
        // Identify the statements to populate the tasks database.
        fs.readFile('./schema.sql', 'utf8', (err, data) => {
          // If the identification failed:
          if (err) {
            // Report this.
            console.log('Error (./schema.sql): ' + err.message);
          }
          // Otherwise, i.e. if the identification succeeded:
          else {
            // Create a client to connect to the tasks database as its owner.
            const client1 = new Client({
              user: manager,
              database: tasks
            });
            // Make the connection.
            client1.connect().catch(
              // If the connection failed:
              error => {
                // Report this.
                console.log(
                  'Connection to tasks database failed with message'
                  + error.message
                );
              }
            ).then(
              // If the connection succeeded:
              () => {
                // Report this.
                console.log('Connected to tasks database');
                // Execute the statements to populate the database.
                client1.query(data).catch(
                  // If the execution failed:
                  error => {
                    console.log(
                      'Population of tasks database failed with message:\n'
                      + error.message
                    )
                  }
                ).then(
                  // If the execution succeeded:
                  result => {
                    // Report this.
                    console.log(
                      'Tasks database populated with message:\n' + result
                    )
                    // Disconnect from the tasks database.
                    client1.end();
                  }
                ).catch(
                  // If the disconnection failed:
                  error => {
                    // Report this.
                    console.log(
                      'Disconnection from tasks database failed with message:\n'
                      + error.message
                    );
                  }
                ).then(
                  // If the disconnection succeeded:
                  () => {
                    // Report this.
                    console.log('Disconnected from tasks database');
                  }
                )
              }
            )
          }
        });
      }
    );
  }
});
