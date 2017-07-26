create role manager login;
create database tasks owner manager;
comment on role manager is 'Manager of task data';
comment on database tasks is 'Tasks not yet performed';
