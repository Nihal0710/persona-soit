-- Create newsletter_subscriptions table
create table newsletter_subscriptions (
  id uuid default uuid_generate_v4() primary key,
  email text not null unique,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  status text default 'active' check (status in ('active', 'unsubscribed'))
);

-- Enable RLS
alter table newsletter_subscriptions enable row level security;

-- Create policy for inserting (public can subscribe)
create policy "Anyone can subscribe" on newsletter_subscriptions
  for insert with check (true);

-- Create policy for admin access (service role can read all)
create policy "Service role can read all" on newsletter_subscriptions
  for select using (auth.role() = 'service_role'); 