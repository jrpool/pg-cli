const fs = require('fs');

const {Client} = require('pg');

/// Destruction of tasks database.

fs.readFile('./dbdrop.sql', 'utf8', (err, data) => {
  if (err) {
    console.log('Error (./dbdrop.sql): ' + err.message);
  }
  else {
    const client = new Client({database: 'postgres'});
    client.connect().catch(
      error => {
        console.log(
          'Connection to postgres database failed with message:\n'
          + error.message
        );
      }
    ).then(
      () => {
        console.log('Connected to postgres database');
        client.query(data);
      }
    ).catch(
      error => {
        console.log(
          'Tasks database destruction failed with message:\n' + error.message
        );
      }
    ).then(
      result => {
        console.log(
          'Tasks database and manager role destroyed with messages:\n'
          + result
        );
        client.end();
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
      }
    );
  }
});
