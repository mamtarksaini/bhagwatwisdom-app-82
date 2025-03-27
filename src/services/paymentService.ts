
import { supabase } from "@/lib/supabase";

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
    // First refresh the session to ensure we have a valid token
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
      console.error('Session refresh error:', refreshError.message);
      // Continue anyway as the session might still be valid
    }
    
    // Check if we have an active session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      throw new Error('Authentication error: ' + sessionError.message);
    }
    
    if (!sessionData?.session) {
      console.error('No active session found');
      throw new Error('User not authenticated');
    }
    
    console.log('Payment service: Creating order with active session for user:', sessionData.session.user.id);
    
    // For PayPal, we'll use test mode by default for this version
    if (provider === 'paypal') {
      console.log('PayPal test mode activated');
      return {
        id: 'test-order-id-' + Date.now(),
        error: 'PayPal in test mode',
        message: 'Using PayPal test mode for development.',
        provider,
        testMode: true
      } as any;
    }
    
    try {
      // Call the Supabase Edge Function to create an order with the fresh token
      const { data: responseData, error: invokeError } = await supabase.functions.invoke('process-payment', {
        body: {
          planId,
          provider,
          action: 'create-order',
        },
        method: 'POST',
        headers: {
          Authorization: `Bearer ${sessionData.session.access_token}`,
        },
      });
      
      if (invokeError) {
        console.error('Error creating payment order:', invokeError);
        
        // For PayPal in development environments, provide a graceful fallback
        if (provider === 'paypal') {
          return {
            error: 'PayPal in test mode',
            message: 'The PayPal integration is running in test mode.',
            provider,
            testMode: true
          } as any;
        }
        
        throw new Error(invokeError.message || 'Failed to create payment order');
      }
      
      // Validate the response data
      if (!responseData) {
        console.error('Empty response data received');
        throw new Error('Invalid response from payment service');
      }
      
      // Check if the response contains an error field (which indicates a configuration issue)
      if (responseData.error === 'PayPal credentials not configured' || 
          (typeof responseData.error === 'string' && responseData.error.includes('PayPal'))) {
        console.log('PayPal test mode activated:', responseData);
        return {
          error: 'PayPal in test mode',
          message: responseData.message || 'Using PayPal test mode for development.',
          provider,
          testMode: true
        } as any;
      }
      
      console.log('Payment order created successfully:', responseData);
      
      return {
        ...responseData,
        provider,
      };
    } catch (error: any) {
      console.error('Error in createPaymentOrder edge function call:', error);
      
      // For PayPal in demo environments, return a structured error
      if (provider === 'paypal') {
        return {
          error: 'PayPal in test mode',
          message: 'Using PayPal test mode for development.',
          provider,
          testMode: true
        } as any;
      }
      
      throw new Error('Payment service is unavailable. Please try again later.');
    }
  } catch (error) {
    console.error('Error in createPaymentOrder:', error);
    
    // For PayPal, always fallback to test mode on error
    if (provider === 'paypal') {
      return {
        error: 'PayPal in test mode',
        message: 'Using PayPal test mode for development.',
        provider,
        testMode: true
      } as any;
    }
    
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
    // Check if we have an active session first
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError.message);
      throw new Error('Authentication error: ' + sessionError.message);
    }
    
    if (!sessionData?.session) {
      console.error('No active session found');
      throw new Error('User not authenticated');
    }
    
    // Call the Supabase Edge Function to verify the payment
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: {
        provider,
        planId,
        action: 'verify-payment',
        ...paymentDetails,
      },
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionData.session.access_token}`,
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
