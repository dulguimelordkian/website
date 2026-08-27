import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).end();

    const event = req.body.data;

    // Check if the event is a paid session
    if (event.attributes.type === 'checkout_session.payment.paid') {
        const session = event.attributes.data;
        const metadata = session.attributes.metadata;

        await supabase.from('orders').insert([{
            product_id: metadata.product_id,
            buyer_id: metadata.buyer_id,
            seller_id: metadata.seller_id,
            amount: session.attributes.line_items[0].amount / 100,
            status: 'paid',
            paymongo_session_id: session.id
        }]);
    }

    return res.status(200).json({ received: true });
}