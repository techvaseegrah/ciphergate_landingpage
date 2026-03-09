import api from './api';

// ── Auto-pay subscription endpoints ──
export const createSubscription = async (data) => {
    const response = await api.post('payments/create-subscription', data);
    return response.data;
};

export const verifySubscription = async (data) => {
    const response = await api.post('payments/verify-subscription', data);
    return response.data;
};

export const cancelSubscription = async () => {
    const response = await api.post('payments/cancel-subscription');
    return response.data;
};

// ── Legacy one-time order (backward compat) ──
export const createOrder = async (orderData) => {
    const response = await api.post('payments/create-order', orderData);
    return response.data;
};

export const verifyPayment = async (paymentData) => {
    const response = await api.post('payments/verify-payment', paymentData);
    return response.data;
};
