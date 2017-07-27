const fs = require('fs');

const {Client} = require('pg');

/// Destruction of tasks database.

const dropCommands = [
  'drop database tasks',
  'drop role taskmaster'
];
const client = new Client({database: 'postgres'});
client.connect().then(
  () => {
    console.log('Connected to postgres database');
    return client.query(dropCommands[0]);
  }
).then(
  () => {
    console.log('Tasks database destroyed');
    return client.query(dropCommands[1]);
  }
).then(
  () => {
    console.log('Taskmaster role destroyed');
    return client.end();
  }
).then(
  () => {
    console.log('Disconnected from postgres database');
  }
).catch(
  error => {
    console.log('Error (client): ' + error.message);
    client.end();
  }
);
