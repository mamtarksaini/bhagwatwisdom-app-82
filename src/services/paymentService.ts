
import { supabase } from "@/integrations/supabase/client";

// Types for payment providers and responses
export type PaymentProvider = 'paypal' | 'razorpay';

export interface PaymentOrder {
  id: string;
  provider: PaymentProvider;
  [key: string]: any;
}

export interface PaymentVerification {
  success: boolean;
  message: string;
  subscription?: any;
  [key: string]: any;
}

/**
 * Create a payment order with the specified provider
 * @param planId The ID of the subscription plan
 * @param provider The payment provider ('paypal' or 'razorpay')
 * @returns The created order details
 */
export async function createPaymentOrder(
  planId: string, 
  provider: PaymentProvider
): Promise<PaymentOrder> {
  try {
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    // Call the Supabase Edge Function to create an order
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        planId,
        provider,
      },
      method: 'POST',
      path: '/create-order',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) {
      console.error('Error creating payment order:', error);
      throw new Error(error.message || 'Failed to create payment order');
    }
    
    return {
      ...data,
      provider,
    };
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    throw error;
  }
}

/**
 * Verify and process a completed payment
 * @param provider The payment provider
 * @param planId The subscription plan ID
 * @param paymentDetails Provider-specific payment details
 * @returns The verification result
 */
export async function verifyPayment(
  provider: PaymentProvider,
  planId: string,
  paymentDetails: any
): Promise<PaymentVerification> {
  try {
    // Get the user's session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      throw new Error('User not authenticated');
    }
    
    // Call the Supabase Edge Function to verify the payment
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        provider,
        planId,
        ...paymentDetails,
      },
      method: 'POST',
      path: '/verify-payment',
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });
    
    if (error) {
      console.error('Error verifying payment:', error);
      throw new Error(error.message || 'Failed to verify payment');
    }
    
    return data;
  } catch (error) {
    console.error('Error in verifyPayment:', error);
    throw error;
  }
}

/**
 * Get all subscription plans from the database
 */
export async function getSubscriptionPlans() {
  try {
    const { data, error } = await supabase
      .from('subscription_plans')
      .select('*')
      .order('price', { ascending: true });
    
    if (error) {
      console.error('Error fetching subscription plans:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getSubscriptionPlans:', error);
    throw error;
  }
}

/**
 * Get the user's active subscription
 * @param userId The user's ID
 */
export async function getUserSubscription(userId: string) {
  try {
    const { data, error } = await supabase
      .from('user_subscriptions')
      .select(`
        *,
        subscription_plans:plan_id (*)
      `)
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "No rows returned" error
      console.error('Error fetching user subscription:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserSubscription:', error);
    // Return null instead of throwing if no subscription found
    if (error.code === 'PGRST116') {
      return null;
    }
    throw error;
  }
}

/**
 * Get the user's payment history
 * @param userId The user's ID
 */
export async function getUserPaymentHistory(userId: string) {
  try {
    const { data, error } = await supabase
      .from('payment_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching payment history:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error in getUserPaymentHistory:', error);
    throw error;
  }
}
