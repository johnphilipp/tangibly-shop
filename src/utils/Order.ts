export type Order = {
    checkoutSessionId: string;
    lineItems: {
        type: string;
        price: string;
        quantity: number;
    } [],
    status: string;
    shipping: {
        address: {
            city: string | null;
            country: string | null;
            line1: string | null;
            line2: string | null;
            postal_code: string | null;
            state: string | null
        } | undefined,
        name: string | null | undefined,
    } | null,
    email: string | null;
    name: string | null | undefined;
    phone: string | null | undefined;
    paymentStatus: string;
    currency: string | null;
    amountTotal: number | null;
}