-- HITK Hub — starter seed data
-- Run AFTER schema.sql. Safe to re-run (uses ON CONFLICT / existence checks).
-- Edit the department/subject lists to match what your college actually offers.

insert into departments (name, code) values
  ('Computer Science & Engineering', 'CSE'),
  ('Information Technology', 'IT'),
  ('Electronics & Communication Engineering', 'ECE'),
  ('Electrical Engineering', 'EE'),
  ('Civil Engineering', 'CE'),
  ('Mechanical Engineering', 'ME'),
  ('Applied Electronics & Instrumentation Engineering', 'AEIE')
on conflict (code) do nothing;

insert into semesters (year, semester_number, name)
select y, s, 'Semester ' || s
from (values (1,1),(1,2),(2,3),(2,4),(3,5),(3,6),(4,7),(4,8)) as v(y, s)
where not exists (select 1 from semesters where year = v.y and semester_number = v.s);

-- Subjects for CSE (2nd/3rd/4th year) as a starting point — add the rest
-- for other departments the same way, or build an admin "add subject" form.
do $$
declare
  cse_id uuid;
  sem3 uuid; sem4 uuid; sem5 uuid; sem6 uuid; sem7 uuid;
begin
  select id into cse_id from departments where code = 'CSE';
  select id into sem3 from semesters where semester_number = 3;
  select id into sem4 from semesters where semester_number = 4;
  select id into sem5 from semesters where semester_number = 5;
  select id into sem6 from semesters where semester_number = 6;
  select id into sem7 from semesters where semester_number = 7;

  insert into subjects (department_id, semester_id, name, code)
  select cse_id, sem3, 'Data Structures', 'CS201'
  where not exists (select 1 from subjects where department_id = cse_id and name = 'Data Structures');

  insert into subjects (department_id, semester_id, name, code)
  select cse_id, sem5, 'DBMS', 'CS301'
  where not exists (select 1 from subjects where department_id = cse_id and name = 'DBMS');

  insert into subjects (department_id, semester_id, name, code)
  select cse_id, sem5, 'Operating Systems', 'CS302'
  where not exists (select 1 from subjects where department_id = cse_id and name = 'Operating Systems');

  insert into subjects (department_id, semester_id, name, code)
  select cse_id, sem7, 'Computer Networks', 'CS401'
  where not exists (select 1 from subjects where department_id = cse_id and name = 'Computer Networks');

  insert into subjects (department_id, semester_id, name, code)
  select cse_id, sem4, 'Algorithms', 'CS202'
  where not exists (select 1 from subjects where department_id = cse_id and name = 'Algorithms');
end $$;

-- ------------------------------------------------------------
-- Promote yourself to admin AFTER you've signed up once through the app:
--   update profiles set role = 'admin' where email = 'you@hitk.edu.in';
-- ------------------------------------------------------------
