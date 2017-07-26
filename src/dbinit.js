const fs = require('fs');

const {Client} = require('pg');

/// Create manager role and create and populate tasks database.

fs.readFile('./dbinit.sql', 'utf8', (err, data) => {
  if (err) {
    console.log('Error (./sql/dbinit.sql): ' + err.message);
  }
  else {
    const client0 = new Client({database: 'postgres'});
    client0.connect().then(
      result => {
        console.log(
          'Connected to postgres database with message:\n  ' + result
        );
        client0.query(data);
      }
    ).then(
      result => {
        console.log(
          'Manager role and tasks database created with message:\n  ' + result
        );
        client0.end();
      }
    ).then(
      result => {
        console.log(
          'Disconnected from postgres database with message:\n  ' + result
        );
        fs.readFile('./sql/schema.sql', 'utf8', (err, data) => {
          if (err) {
            console.log('Error (./sql/schema.sql): ' + err.message);
          }
          else {
            const client1 = new Client({
              user: 'manager',
              database: 'tasks'
            });
            client1.connect().then(
              result => {
                console.log(
                  'Connected to tasks database with message:\n + result'
                );
                client1.query(data)
              }
            ).then(
              result => {
                console.log(
                  'Tasks database populated with message:\n' + result
                );
                client1.end();
              }
            ).then(
              result => {
                console.log(
                  'Disconnected from tasks database with message:\n  '
                  + result
                );
              }
            ).catch(
              error => {
                console.log('Error (client1): ' + error.message);
              }
            );
          }
        });
      }
    ).catch(
      error => {
        console.log('Error (client0): ' + error.message);
      }
    );
  }
});
