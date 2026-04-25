-- ============================================================
-- justabit — Seed data for testing
-- Paste into: Dashboard → SQL Editor → New query → Run
--
-- Change the email below to match your test user's email.
-- The user must already exist (sign up via the app first).
--
-- Totals: 12 envelopes, 48 expenses, 8 incomes, 6 notes
--         across February, March, and April 2026
-- ============================================================

DO $$
DECLARE
  v_uid            uuid;

  -- original 6 envelopes
  v_groceries      uuid;
  v_rent           uuid;
  v_transport      uuid;
  v_entertainment  uuid;
  v_dining         uuid;
  v_healthcare     uuid;

  -- 6 new envelopes
  v_utilities      uuid;
  v_clothing       uuid;
  v_personal_care  uuid;
  v_subscriptions  uuid;
  v_home           uuid;
  v_fitness        uuid;

BEGIN

  -- ── Resolve user ───────────────────────────────────────────
  SELECT id INTO v_uid
  FROM auth.users
  WHERE email = 'setup@gmail.com'
  LIMIT 1;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'No user found with that email. Register in the app first.';
  END IF;

  -- ── Envelopes (12) ─────────────────────────────────────────
  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Groceries', false, 400.00, '🛒', '#86bd75', v_uid)
    RETURNING id INTO v_groceries;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Rent', true, 1200.00, '🏠', '#52808D', v_uid)
    RETURNING id INTO v_rent;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Transportation', false, 150.00, '🚗', '#7596A5', v_uid)
    RETURNING id INTO v_transport;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Entertainment', false, 100.00, '🎬', '#3A27B7', v_uid)
    RETURNING id INTO v_entertainment;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Dining Out', false, 200.00, '🍽️', '#E3AAB3', v_uid)
    RETURNING id INTO v_dining;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Healthcare', false, 80.00, '💊', '#AFA72B', v_uid)
    RETURNING id INTO v_healthcare;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Utilities', true, 120.00, '⚡', '#9ED5E5', v_uid)
    RETURNING id INTO v_utilities;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Clothing', false, 150.00, '👕', '#B22222', v_uid)
    RETURNING id INTO v_clothing;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Personal Care', false, 60.00, '🧴', '#32EE90', v_uid)
    RETURNING id INTO v_personal_care;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Subscriptions', true, 50.00, '📱', '#8170DC', v_uid)
    RETURNING id INTO v_subscriptions;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Home & Garden', false, 100.00, '🏡', '#243439', v_uid)
    RETURNING id INTO v_home;

  INSERT INTO public.envelopes (title, fixed, budget, icon, color, user_id)
    VALUES ('Fitness', false, 80.00, '💪', '#6ACF6A', v_uid)
    RETURNING id INTO v_fitness;

  -- ── Expenses — April 2026 (24) ─────────────────────────────
  INSERT INTO public.expenses (location, envelope_id, user_id, date, amount, comments) VALUES
    ('Monthly Rent',       v_rent,          v_uid, '2026-04-01', 1200.00, 'April rent'),
    ('Netflix',            v_entertainment, v_uid, '2026-04-01',   15.99, 'Monthly subscription'),
    ('Spotify',            v_entertainment, v_uid, '2026-04-01',    9.99, 'Monthly subscription'),
    ('Amazon Prime',       v_subscriptions, v_uid, '2026-04-01',   14.99, 'Monthly subscription'),
    ('Planet Fitness',     v_fitness,       v_uid, '2026-04-01',   24.99, 'Monthly membership'),
    ('Electric Bill',      v_utilities,     v_uid, '2026-04-02',   98.50, NULL),
    ('Water Bill',         v_utilities,     v_uid, '2026-04-02',   32.00, NULL),
    ('Trader Joe''s',      v_groceries,     v_uid, '2026-04-03',   72.40, 'Weekly shop'),
    ('Shell Gas Station',  v_transport,     v_uid, '2026-04-04',   55.20, 'Fill up'),
    ('H&M',                v_clothing,      v_uid, '2026-04-05',   65.40, 'Spring clothes'),
    ('Chipotle',           v_dining,        v_uid, '2026-04-06',   28.50, NULL),
    ('Haircut',            v_personal_care, v_uid, '2026-04-07',   45.00, NULL),
    ('CVS Pharmacy',       v_healthcare,    v_uid, '2026-04-08',   32.10, 'Allergy meds'),
    ('Home Depot',         v_home,          v_uid, '2026-04-09',   78.30, 'Garden supplies'),
    ('Whole Foods',        v_groceries,     v_uid, '2026-04-10',   45.80, NULL),
    ('Uber',               v_transport,     v_uid, '2026-04-12',   18.75, 'Airport ride'),
    ('AMC Theaters',       v_entertainment, v_uid, '2026-04-14',   32.00, 'Movie night'),
    ('Target',             v_groceries,     v_uid, '2026-04-15',   55.60, NULL),
    ('Olive Garden',       v_dining,        v_uid, '2026-04-16',   67.90, 'Birthday dinner'),
    ('Trader Joe''s',      v_groceries,     v_uid, '2026-04-18',   68.20, NULL),
    ('Walgreens',          v_healthcare,    v_uid, '2026-04-20',   24.50, NULL),
    ('Starbucks',          v_dining,        v_uid, '2026-04-21',   22.80, NULL),
    ('Taco Bell',          v_dining,        v_uid, '2026-04-22',   14.30, 'Lunch'),
    ('Metro Pass',         v_transport,     v_uid, '2026-04-23',   33.00, 'Monthly pass');

  -- ── Expenses — March 2026 (15) ─────────────────────────────
  INSERT INTO public.expenses (location, envelope_id, user_id, date, amount, comments) VALUES
    ('Monthly Rent',       v_rent,          v_uid, '2026-03-01', 1200.00, 'March rent'),
    ('Netflix',            v_entertainment, v_uid, '2026-03-01',   15.99, 'Monthly subscription'),
    ('Amazon Prime',       v_subscriptions, v_uid, '2026-03-01',   14.99, 'Monthly subscription'),
    ('Planet Fitness',     v_fitness,       v_uid, '2026-03-01',   24.99, 'Monthly membership'),
    ('Electric Bill',      v_utilities,     v_uid, '2026-03-02',  102.30, NULL),
    ('Trader Joe''s',      v_groceries,     v_uid, '2026-03-03',   89.60, NULL),
    ('Shell Gas Station',  v_transport,     v_uid, '2026-03-07',   52.40, NULL),
    ('Walmart',            v_groceries,     v_uid, '2026-03-08',   78.40, NULL),
    ('Subway',             v_dining,        v_uid, '2026-03-10',   15.30, NULL),
    ('Forever 21',         v_clothing,      v_uid, '2026-03-12',   89.20, 'Sale items'),
    ('Costco',             v_groceries,     v_uid, '2026-03-15',  145.70, 'Bulk run'),
    ('IKEA',               v_home,          v_uid, '2026-03-18',  156.40, 'Home office setup'),
    ('Doctor Visit',       v_healthcare,    v_uid, '2026-03-20',   50.00, 'Annual checkup'),
    ('Sushi Palace',       v_dining,        v_uid, '2026-03-24',   54.80, 'Dinner out'),
    ('Steam',              v_entertainment, v_uid, '2026-03-27',   29.99, 'Game sale');

  -- ── Expenses — February 2026 (9) ──────────────────────────
  INSERT INTO public.expenses (location, envelope_id, user_id, date, amount, comments) VALUES
    ('Monthly Rent',       v_rent,          v_uid, '2026-02-01', 1200.00, 'February rent'),
    ('Netflix',            v_entertainment, v_uid, '2026-02-01',   15.99, 'Monthly subscription'),
    ('Amazon Prime',       v_subscriptions, v_uid, '2026-02-01',   14.99, 'Monthly subscription'),
    ('Planet Fitness',     v_fitness,       v_uid, '2026-02-01',   24.99, 'Monthly membership'),
    ('Electric Bill',      v_utilities,     v_uid, '2026-02-02',  115.20, 'Higher in winter'),
    ('Trader Joe''s',      v_groceries,     v_uid, '2026-02-05',   95.30, NULL),
    ('Shell Gas Station',  v_transport,     v_uid, '2026-02-08',   48.60, NULL),
    ('Valentine''s Dinner',v_dining,        v_uid, '2026-02-14',  120.00, 'Special occasion'),
    ('Walgreens',          v_healthcare,    v_uid, '2026-02-22',   38.70, NULL);

  -- ── Incomes (8) ────────────────────────────────────────────
  INSERT INTO public.incomes (source, amount, date, user_id, savings, investments, remainder) VALUES
    ('Payroll',       2800.00, '2026-04-01', v_uid, 200.00, 100.00, 2500.00),
    ('Freelance',      450.00, '2026-04-15', v_uid,   0.00,   0.00,  450.00),
    ('Performance Bonus', 300.00, '2026-04-22', v_uid, 300.00, 0.00, 0.00),
    ('Payroll',       2800.00, '2026-03-01', v_uid, 200.00, 100.00, 2500.00),
    ('Side Project',   200.00, '2026-03-20', v_uid,   0.00,   0.00,  200.00),
    ('Reimbursement',   75.00, '2026-03-28', v_uid,   0.00,   0.00,   75.00),
    ('Payroll',       2800.00, '2026-02-01', v_uid, 200.00, 100.00, 2500.00),
    ('Side Project',   150.00, '2026-02-20', v_uid,   0.00,   0.00,  150.00);

  -- ── Notes (6) ──────────────────────────────────────────────
  -- month is 0-indexed: 3 = April, 2 = March, 1 = February
  INSERT INTO public.notes (month, content, user_id) VALUES
    (3, 'Check grocery budget before the next shop — been running close to limit.', v_uid),
    (3, 'Look into gym membership pricing, might swap Entertainment budget around.', v_uid),
    (3, 'Need to review subscriptions — might be paying for things I don''t use.', v_uid),
    (2, 'Great month! Stayed under budget on most categories. Costco bulk run was worth it.', v_uid),
    (2, 'IKEA trip was a big one but necessary — home office setup is finally done.', v_uid),
    (1, 'Valentine''s dinner blew the Dining budget. Worth it though.', v_uid);

  RAISE NOTICE 'Seed complete for user % — 12 envelopes, 48 expenses, 8 incomes, 6 notes', v_uid;

END $$;
