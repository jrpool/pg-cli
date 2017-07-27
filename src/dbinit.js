const fs = require('fs');

const {Client} = require('pg');

/// Create manager role and create and populate tasks database.

const initCommands = [
  'create role taskmaster login',
  'comment on role taskmaster is \'Manager of task data\'',
  'create database tasks owner taskmaster',
  'comment on database tasks is \'Tasks not yet performed\''
];

const client0 = new Client({database: 'postgres'});
client0.connect().then(
  () => {
    console.log('Connected to postgres database');
    return client0.query(initCommands[0]);
  }
).then(
  () => {
    console.log('Taskmaster role created');
    return client0.query(initCommands[1]);
  }
).then(
  () => {
    console.log('Taskmaster role documented');
    return client0.query(initCommands[2]);
  }
).then(
  () => {
    console.log('Tasks database created');
    return client0.query(initCommands[3]);
  }
).then(
  () => {
    console.log('Tasks database documented');
    return client0.end();
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
          user: 'taskmaster',
          database: 'tasks'
        });
        client1.connect().then(
          () => {
            console.log('Connected to tasks database');
            return client1.query(data);
          }
        ).then(
          () => {
            console.log('Tasks database populated');
            return client1.end();
          }
        ).then(
          () => {
            console.log('Disconnected from tasks database');
          }
        ).catch(
          error => {
            console.log('Error (client1): ' + error.message);
            client1.end();
          }
        );
      }
    });
  }
).catch(
  error => {
    console.log('Error (client0): ' + error.message);
    client0.end();
  }
);
