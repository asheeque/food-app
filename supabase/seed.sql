-- ============================================================
-- Deira Fresh — Seed Data (dev / testing)
-- Run after the migration. Safe to re-run (uses ON CONFLICT DO NOTHING).
-- ============================================================

-- Suppliers
INSERT INTO public.suppliers (id, business_name, trade_license, trn, categories, products_count, whatsapp, email, warehouse_address, orders_count, rating, on_time_rate, active)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'TL-2024-8821', 'TRN-100298765', ARRAY['Vegetables','Fruits','Herbs'], 47, '+971501234567', 'orders@alkhaleej.ae', 'Warehouse 12, Al Quoz Industrial 3, Dubai', 142, 4.8, 96.5, true),
  ('11111111-0000-0000-0000-000000000002', 'Emirates Dairy & Poultry', 'TL-2024-3312', 'TRN-200198432', ARRAY['Dairy','Eggs','Poultry'], 31, '+971502345678', 'supply@emiratesdairy.ae', 'Unit 4, JAFZA South, Dubai', 89, 4.6, 93.2, true),
  ('11111111-0000-0000-0000-000000000003', 'Spice Route Trading', 'TL-2024-5577', 'TRN-300456123', ARRAY['Spices','Dry Goods','Condiments'], 58, '+971503456789', 'hello@spiceroute.ae', 'Shop 7, Deira Spice Market, Dubai', 67, 4.9, 98.1, true),
  ('11111111-0000-0000-0000-000000000004', 'Blue Ocean Seafood', 'TL-2024-9901', 'TRN-400789012', ARRAY['Fish','Shellfish','Frozen Seafood'], 24, '+971504567890', 'orders@blueocean.ae', 'Cold Store 3, Deira Fish Market, Dubai', 54, 4.5, 91.8, true)
ON CONFLICT (id) DO NOTHING;

-- Restaurants
INSERT INTO public.restaurants (id, name, brand_group, zone, contact, whatsapp, email, cuisine_type, preferred_time, primary_supplier_id, active, orders_count, gmv)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'Taj Dubai Kitchen', NULL, 'Downtown / Business Bay', 'Ahmed Hassan', '+971551234567', 'kitchen@tajdubai.ae', 'Indian', '6:00 AM – 9:00 AM', '11111111-0000-0000-0000-000000000001', true, 48, 24800),
  ('22222222-0000-0000-0000-000000000002', 'Beirut Garden', 'Levant Group', 'Jumeirah', 'Sara Al Masri', '+971552345678', 'chef@beirutgarden.ae', 'Lebanese', '5:30 AM – 8:00 AM', '11111111-0000-0000-0000-000000000001', true, 36, 18200),
  ('22222222-0000-0000-0000-000000000003', 'Golden Wok', 'Eastern Bites LLC', 'Deira', 'Chen Wei', '+971553456789', 'orders@goldenwok.ae', 'Chinese', '7:00 AM – 10:00 AM', '11111111-0000-0000-0000-000000000002', true, 29, 15600),
  ('22222222-0000-0000-0000-000000000004', 'Casa Napoli', NULL, 'Bur Dubai', 'Marco Rossi', '+971554567890', 'kitchen@casanapoli.ae', 'Italian', '6:30 AM – 9:30 AM', '11111111-0000-0000-0000-000000000003', true, 22, 12400),
  ('22222222-0000-0000-0000-000000000005', 'The Saffron', 'Luxury Hotels Group', 'Al Quoz', 'Fatima Al Zaabi', '+971555678901', 'procurement@saffron.ae', 'Emirati', '5:00 AM – 7:00 AM', '11111111-0000-0000-0000-000000000001', true, 61, 38500)
ON CONFLICT (id) DO NOTHING;

-- Orders (sample)
INSERT INTO public.orders (id, restaurant_id, restaurant_name, supplier_id, supplier_name, status, amount, source, items, created_at, updated_at)
VALUES
  ('DF-4821', '22222222-0000-0000-0000-000000000001', 'Taj Dubai Kitchen', '11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'Delivered', 1840, 'WhatsApp',
    '[{"id":"i1","name":"Tomatoes","qty":20,"unit":"kg","confidence":0.97},{"id":"i2","name":"Onions","qty":15,"unit":"kg","confidence":0.95},{"id":"i3","name":"Fresh Coriander","qty":5,"unit":"bunches","confidence":0.88}]',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  ('DF-4822', '22222222-0000-0000-0000-000000000002', 'Beirut Garden', '11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'Confirmed', 920, 'WhatsApp',
    '[{"id":"i4","name":"Parsley","qty":10,"unit":"bunches","confidence":0.91},{"id":"i5","name":"Lemons","qty":8,"unit":"kg","confidence":0.99}]',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  ('DF-4823', '22222222-0000-0000-0000-000000000003', 'Golden Wok', '11111111-0000-0000-0000-000000000002', 'Emirates Dairy & Poultry', 'Pending', 1250, 'WhatsApp',
    '[{"id":"i6","name":"Eggs","qty":30,"unit":"boxes","confidence":0.94},{"id":"i7","name":"Chicken Breast","qty":25,"unit":"kg","confidence":0.89}]',
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
  ('DF-4824', '22222222-0000-0000-0000-000000000005', 'The Saffron', '11111111-0000-0000-0000-000000000001', 'Al Khaleej Fresh Produce', 'Delivered', 3200, 'Portal',
    '[{"id":"i8","name":"Saffron","qty":0.5,"unit":"kg","confidence":1},{"id":"i9","name":"Dates","qty":20,"unit":"kg","confidence":1}]',
    NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
  ('DF-4825', '22222222-0000-0000-0000-000000000004', 'Casa Napoli', '11111111-0000-0000-0000-000000000003', 'Spice Route Trading', 'Pending', 580, 'WhatsApp',
    '[{"id":"i10","name":"Basil","qty":6,"unit":"bunches","confidence":0.82},{"id":"i11","name":"Oregano","qty":2,"unit":"kg","confidence":0.78}]',
    NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Inventory (Al Khaleej Fresh Produce)
INSERT INTO public.inventory (supplier_id, name, category, stock_qty, unit, reorder_threshold, status)
VALUES
  ('11111111-0000-0000-0000-000000000001', 'Tomatoes',        'Vegetables', 450, 'kg',      50, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Onions',          'Vegetables', 380, 'kg',      50, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Potatoes',        'Vegetables',  12, 'kg',      30, 'Low Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Fresh Coriander', 'Herbs',       48, 'bunches', 20, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Parsley',         'Herbs',       32, 'bunches', 20, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Lemons',          'Fruits',     210, 'kg',      40, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Mangoes',         'Fruits',       0, 'kg',      20, 'Out of Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Cucumber',        'Vegetables', 165, 'kg',      30, 'In Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Bell Peppers',    'Vegetables',   8, 'kg',      25, 'Low Stock'),
  ('11111111-0000-0000-0000-000000000001', 'Garlic',          'Vegetables',  90, 'kg',      20, 'In Stock');

-- WhatsApp log
INSERT INTO public.whatsapp_log (restaurant_id, restaurant_name, type, transcript, parsed, status, order_id)
VALUES
  ('22222222-0000-0000-0000-000000000001', 'Taj Dubai Kitchen',  'Voice', '20 kg tomatoes, 15 kg onions, 5 bunches fresh coriander please', true, 'Delivered', 'DF-4821'),
  ('22222222-0000-0000-0000-000000000002', 'Beirut Garden',      'Voice', '10 bunches parsley, 8 kg lemons',                                 true, 'Confirmed', 'DF-4822'),
  ('22222222-0000-0000-0000-000000000003', 'Golden Wok',         'Text',  '30 boxes eggs and 25 kg chicken breast',                          true, 'Pending',   'DF-4823'),
  ('22222222-0000-0000-0000-000000000004', 'Casa Napoli',        'Voice', 'Six bunches basil and two kilo oregano',                          true, 'Pending',   'DF-4825');
