create table tasks (
  id serial primary key,
  description text not null
);

comment on table tasks is 'List of tasks not yet performed';
comment on column tasks.id is 'Unique identifier';
comment on column tasks.description is 'Description';
