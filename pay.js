export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { amount, name, buyer_id, seller_id, product_id } = req.body;

    try {
        const response = await fetch('https://api.paymongo.com/v1/checkout_sessions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Basic ${Buffer.from(process.env.PAYMONGO_SECRET_KEY).toString('base64')}`
            },
            body: JSON.stringify({
                data: {
                    attributes: {
                        line_items: [{
                            currency: 'PHP',
                            amount: Math.round(amount * 100), // Convert PHP to centavos
                            name: name,
                            quantity: 1
                        }],
                        payment_method_types: ['gcash', 'paymaya', 'card'],
                        description: `AURA Apparel - ${name}`,
                        metadata: {
                            buyer_id: buyer_id,
                            seller_id: seller_id,
                            product_id: product_id
                        }
                    }
                }
            })
        });

        const data = await response.json();
        
        if (data.errors) {
            return res.status(400).json({ error: data.errors[0].detail });
        }

        return res.status(200).json({ 
            checkout_url: data.data.attributes.checkout_url,
            session_id: data.data.id
        });
    } catch (error) {
        return res.status(500).json({ error: 'Failed to create Paymongo session' });
    }
}