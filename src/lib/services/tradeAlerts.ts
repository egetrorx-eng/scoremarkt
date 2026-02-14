import { sendEmail, orderFilledEmail, alphaAlertEmail } from '../resend';

/**
 * TradeAlerts Service
 * ═══════════════════════════════════════════════════════════════
 * Manages transactional notifications for trading events.
 */

export const tradeAlerts = {
    /**
     * Notify user when a limit order is fulfilled
     */
    async notifyOrderFilled(user: { name: string; email: string }, order: {
        orderId: string;
        market: string;
        side: string;
        shares: number;
        price: number;
    }) {
        if (!user.email) return;

        console.log(`[TradeAlerts] Sending fulfillment email to ${user.email} for order ${order.orderId}`);

        const html = orderFilledEmail({
            name: user.name,
            orderId: order.orderId,
            market: order.market,
            side: order.side,
            shares: order.shares,
            price: order.price,
        });

        return sendEmail({
            to: user.email,
            subject: `Order Filled: ${order.side} ${order.market} @ ${order.price}¢`,
            html,
        });
    },

    /**
     * Notify user of a high-confidence AI Alpha alert
     */
    async notifyAlphaAlert(user: { name: string; email: string }, alert: {
        market: string;
        alphaScore: number;
        consensus: string;
    }) {
        if (!user.email) return;

        console.log(`[TradeAlerts] Sending Alpha alert to ${user.email} for ${alert.market}`);

        const html = alphaAlertEmail({
            name: user.name,
            market: alert.market,
            alphaScore: alert.alphaScore,
            consensus: alert.consensus,
        });

        return sendEmail({
            to: user.email,
            subject: `High Alpha Alert: ${alert.market} (${alert.alphaScore}%)`,
            html,
        });
    }
};
