create table boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  title text not null,
  created_at timestamp default now()
);

create table columns (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references boards(id) on delete cascade,
  title text not null,
  position real not null,
  created_at timestamp default now()
);

create table cards (
  id uuid default gen_random_uuid() primary key,
  column_id uuid references columns(id) on delete cascade,
  title text not null,
  description text,
  position real not null,
  created_at timestamp default now()
);

alter table boards enable row level security;
alter table columns enable row level security;
alter table cards enable row level security;

create policy "Kullanici kendi boardlarini gorur"
on boards for all using (auth.uid() = user_id);

create policy "Kullanici kendi columnlarini gorur"
on columns for all using (
  board_id in (select id from boards where user_id = auth.uid())
);

create policy "Kullanici kendi kartlarini gorur"
on cards for all using (
  column_id in (select id from columns where board_id in (
    select id from boards where user_id = auth.uid()
  ))
);
