const fs = require('fs');

const {Client} = require('pg');

/// Create manager role and create and populate tasks database.

fs.readFile('./sql/dbinit.sql', 'utf8', (err, data) => {
  if (err) {
    console.log('Error (./sql/dbinit.sql): ' + err.message);
  }
  else {
    const client0 = new Client({database: 'postgres'});
    client0.connect().then(
      () => {
        console.log('Connected to postgres database');
        client0.query(data);
      }
    ).then(
      () => {
        console.log('Manager role and tasks database created');
        client0.end();
      }
    ).then(
      () => {
        console.log('Disconnected from postgres database');
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
              () => {
                console.log('Connected to tasks database');
                client1.query(data)
              }
            ).then(
              () => {
                console.log('Tasks database populated');
                client1.end();
              }
            ).then(
              () => {
                console.log('Disconnected from tasks database');
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
