create table tasks (
  id serial primary key,
  description text not null
);

comment on table tasks is 'List of tasks not yet performed';
comment on column tasks.id is 'Unique identifier';
comment on column tasks.description is 'Description';

create function add(what text, out identifier integer)
  returns integer language sql as $$
    insert into tasks (description) values (what)
      returning id as identifier;
  $$;

create function done(identifier integer, out what text)
  returns text language sql as $$
    delete from tasks where id = identifier
      returning id as identifier, description as what;
  $$;

create function done
  (startID integer, endID integer, out identifier integer, out what text)
  returns setof record language sql as $$
    delete from tasks where id >= startID and id <= endID
      returning id as identifier, description as what;
  $$;

create function list(out identifier integer, out what text)
  returns setof record language sql as $$
    select id as identifier, description as what from tasks order by id;
  $$;

create function reset(out done boolean)
  returns boolean language sql as $$
    truncate tasks;
    select setval('tasks_id_seq', 0);
  $$;
