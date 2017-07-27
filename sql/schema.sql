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

create function done(soleid integer, out identifier integer, out what text)
  returns setof record language sql as $$
    delete from tasks where id = soleid
      returning id as identifier, description as what;
  $$;

create function done
  (startid integer, endid integer, out identifier integer, out what text)
  returns setof record language sql as $$
    delete from tasks where id >= startid and id <= endid
      returning id as identifier, description as what;
  $$;

create function list(out identifier integer, out what text)
  returns setof record language sql as $$
    select id as identifier, description as what from tasks order by id;
  $$;

create function reset(out newid integer)
  returns integer language sql as $$
    truncate tasks;
    select cast(setval('tasks_id_seq', 1, false) as integer);
  $$;
