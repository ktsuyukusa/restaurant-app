-- Set up auth schema if not exists
create schema if not exists auth;

-- Drop existing trigger if exists
drop trigger if exists on_auth_user_created on auth.users;

-- Drop existing function if exists
drop function if exists public.handle_new_user();

-- Create or update profiles table
do $$ 
begin
    if not exists (select from pg_tables where schemaname = 'public' and tablename = 'profiles') then
        create table public.profiles (
            id uuid references auth.users on delete cascade,
            user_type text check (user_type in ('customer', 'restaurant_owner', 'admin')),
            name text,
            phone text,
            location_consent boolean default false,
            admin_code text,
            restaurant_name text,
            restaurant_address text,
            restaurant_phone text,
            created_at timestamptz default now(),
            primary key (id)
        );
    end if;
end $$;

-- Enable RLS
alter table public.profiles enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Public profiles are viewable by everyone" on public.profiles;
drop policy if exists "Users can insert their own profile" on public.profiles;
drop policy if exists "Users can update their own profile" on public.profiles;

-- Create or replace policies
create policy "Public profiles are viewable by everyone"
    on public.profiles for select
    using ( true );

create policy "Users can insert their own profile"
    on public.profiles for insert
    with check ( auth.uid() = id );

create policy "Users can update their own profile"
    on public.profiles for update
    using ( auth.uid() = id );

-- Create or replace the trigger function
create or replace function public.handle_new_user()
returns trigger as $$
begin
    insert into public.profiles (id, user_type)
    values (new.id, 'customer')
    on conflict (id) do nothing;
    return new;
end;
$$ language plpgsql security definer;

-- Create the trigger
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();
