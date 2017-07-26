const fs = require('fs');

const {Client} = require('pg');

/// Creation and population of tasks database.

fs.readFile('./dbinit.sql', 'utf8', (err, data) => {
  if (err) {
    console.log('Error (./dbinit.sql): ' + err.message);
  }
  else {
    const client0 = new Client({database: postgres});
    client0.connect().catch(
      error => {
        console.log(
          'Connection to postgres database failed with message:\n'
          + error.message
        );
      }
    ).then(
      () => {
        console.log('Connected to postgres database');
        client0.query(data);
      }
    ).catch(
      error => {
        console.log(
          'Tasks database creation failed with message:\n' + error.message
        );
      }
    ).then(
      result => {
        console.log('Tasks database created with message:\n' + result);
        client0.end();
      }
    ).catch(
      error => {
        console.log(
          'Disconnection from postgres database failed with message:\n'
          + error.message
        );
      }
    ).then(
      () => {
        console.log('Disconnected from postgres database');
        fs.readFile('./schema.sql', 'utf8', (err, data) => {
          if (err) {
            console.log('Error (./schema.sql): ' + err.message);
          }
          else {
            const client1 = new Client({
              user: manager,
              database: tasks
            });
            client1.connect().catch(
              error => {
                console.log(
                  'Connection to tasks database failed with message'
                  + error.message
                );
              }
            ).then(
              () => {
                console.log('Connected to tasks database');
                client1.query(data).catch(
                  error => {
                    console.log(
                      'Population of tasks database failed with message:\n'
                      + error.message
                    )
                  }
                ).then(
                  result => {
                    console.log(
                      'Tasks database populated with message:\n' + result
                    )
                    client1.end();
                  }
                ).catch(
                  error => {
                    console.log(
                      'Disconnection from tasks database failed with message:\n'
                      + error.message
                    );
                  }
                ).then(
                  () => {
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
