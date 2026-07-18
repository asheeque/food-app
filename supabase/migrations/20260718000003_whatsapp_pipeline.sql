-- ============================================================
-- WhatsApp ordering pipeline support
-- ============================================================
-- message_id: Meta's message id on the *originating* text/voice message —
-- guards against Meta's webhook retries creating duplicate log rows.
-- parsed_items: the AI-parsed structured order, held here until the
-- restaurant replies CONFIRM and a real row is created in `orders`.

alter table public.whatsapp_log add column message_id text unique;
alter table public.whatsapp_log add column parsed_items jsonb;
