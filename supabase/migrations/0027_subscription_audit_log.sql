-- Migration: Create subscription_audit_log table
-- Description: Comprehensive audit logging for all subscription operations
-- Version: 1.0.0
-- Date: 2025-10-30

-- Create the subscription_audit_log table
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,

    -- Operation details
    action VARCHAR(50) NOT NULL CHECK (action IN (
        'create_subscription',
        'activate_subscription',
        'cancel_subscription',
        'pause_subscription',
        'resume_subscription',
        'upgrade_subscription',
        'downgrade_subscription',
        'payment_processed',
        'payment_failed',
        'refund_processed',
        'webhook_received',
        'status_change'
    )),

    -- Subscription identifiers
    subscription_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    razorpay_payment_id VARCHAR(100),
    razorpay_invoice_id VARCHAR(100),

    -- Previous and new states
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_tier VARCHAR(50),
    new_tier VARCHAR(50),

    -- Transaction details
    transaction_id VARCHAR(100),
    amount_cents INTEGER,  -- Amount in cents (for consistency)
    currency VARCHAR(3) DEFAULT 'INR',

    -- Request metadata
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(100),

    -- Detailed operation data (JSON)
    details JSONB DEFAULT '{}',

    -- Status of the audit operation
    audit_status VARCHAR(20) DEFAULT 'completed' CHECK (audit_status IN (
        'pending',
        'in_progress',
        'completed',
        'failed',
        'rolled_back'
    )),

    -- Error information if operation failed
    error_code VARCHAR(100),
    error_message TEXT,

    -- Timing information
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER,

    -- Metadata
    source VARCHAR(50) DEFAULT 'api' CHECK (source IN (
        'api',
        'webhook',
        'admin_panel',
        'system',
        'migration'
    )),

    -- System generated fields
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE public.subscription_audit_log IS 'Comprehensive audit log for all subscription operations and changes';
COMMENT ON COLUMN public.subscription_audit_log.id IS 'Unique identifier for the audit entry';
COMMENT ON COLUMN public.subscription_audit_log.user_id IS 'Reference to the user who performed the action';
COMMENT ON COLUMN public.subscription_audit_log.action IS 'Type of operation performed on the subscription';
COMMENT ON COLUMN public.subscription_audit_log.subscription_id IS 'Internal subscription identifier';
COMMENT ON COLUMN public.subscription_audit_log.razorpay_subscription_id IS 'Razorpay subscription ID';
COMMENT ON COLUMN public.subscription_audit_log.previous_status IS 'Status before the operation';
COMMENT ON COLUMN public.subscription_audit_log.new_status IS 'Status after the operation';
COMMENT ON COLUMN public.subscription_audit_log.details IS 'Additional operation details stored as JSON';
COMMENT ON COLUMN public.subscription_audit_log.audit_status IS 'Status of the audit operation itself';
COMMENT ON COLUMN public.subscription_audit_log.source IS 'Source system that triggered the operation';

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_user_id ON public.subscription_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_action ON public.subscription_audit_log(action);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_subscription_id ON public.subscription_audit_log(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_razorpay_subscription_id ON public.subscription_audit_log(razorpay_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_created_at ON public.subscription_audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_user_created ON public.subscription_audit_log(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_status ON public.subscription_audit_log(audit_status);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_transaction_id ON public.subscription_audit_log(transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_webhook_events ON public.subscription_audit_log(action, source) WHERE source = 'webhook';

-- Create partial indexes for common queries
CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_failed_operations
ON public.subscription_audit_log(user_id, created_at DESC)
WHERE audit_status = 'failed';

CREATE INDEX IF NOT EXISTS idx_subscription_audit_log_recent_activity
ON public.subscription_audit_log(user_id, action, created_at DESC)
WHERE created_at > NOW() - INTERVAL '30 days';

-- Add a trigger to automatically update the updated_at field
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_subscription_audit_log_updated_at
    BEFORE UPDATE ON public.subscription_audit_log
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;

-- Create RLS policies

-- 1. Users can only see their own audit logs
CREATE POLICY "Users can view their own subscription audit logs"
ON public.subscription_audit_log
    FOR SELECT
    USING (user_id = auth.uid());

-- 2. Users can insert their own audit logs (for system-generated entries)
CREATE POLICY "Users can insert their own subscription audit logs"
ON public.subscription_audit_log
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 3. Users cannot update audit logs (read-only for users)
CREATE POLICY "Users cannot update subscription audit logs"
ON public.subscription_audit_log
    FOR UPDATE
    USING (false);

-- 4. Users cannot delete audit logs
CREATE POLICY "Users cannot delete subscription audit logs"
ON public.subscription_audit_log
    FOR DELETE
    USING (false);

-- 5. Service role can manage all audit logs (for system operations)
CREATE POLICY "Service role can manage all subscription audit logs"
ON public.subscription_audit_log
    FOR ALL
    USING (pg_has_role(current_setting('app.settings.current_user_id'), 'service_role'));

-- Grant necessary permissions
GRANT SELECT, INSERT ON public.subscription_audit_log TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_audit_log TO service_role;

-- Create function to log subscription operations (for use in application code)
CREATE OR REPLACE FUNCTION log_subscription_operation(
    p_user_id UUID,
    p_action VARCHAR(50),
    p_subscription_id VARCHAR(100) DEFAULT NULL,
    p_razorpay_subscription_id VARCHAR(100) DEFAULT NULL,
    p_razorpay_payment_id VARCHAR(100) DEFAULT NULL,
    p_previous_status VARCHAR(50) DEFAULT NULL,
    p_new_status VARCHAR(50) DEFAULT NULL,
    p_previous_tier VARCHAR(50) DEFAULT NULL,
    p_new_tier VARCHAR(50) DEFAULT NULL,
    p_transaction_id VARCHAR(100) DEFAULT NULL,
    p_amount_cents INTEGER DEFAULT NULL,
    p_currency VARCHAR(3) DEFAULT 'INR',
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL,
    p_request_id VARCHAR(100) DEFAULT NULL,
    p_details JSONB DEFAULT '{}',
    p_source VARCHAR(50) DEFAULT 'api',
    p_error_code VARCHAR(100) DEFAULT NULL,
    p_error_message TEXT DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
    v_audit_id UUID;
    v_started_at TIMESTAMP WITH TIME ZONE := NOW();
BEGIN
    INSERT INTO public.subscription_audit_log (
        user_id,
        action,
        subscription_id,
        razorpay_subscription_id,
        razorpay_payment_id,
        previous_status,
        new_status,
        previous_tier,
        new_tier,
        transaction_id,
        amount_cents,
        currency,
        ip_address,
        user_agent,
        request_id,
        details,
        source,
        error_code,
        error_message,
        started_at,
        audit_status
    ) VALUES (
        p_user_id,
        p_action,
        p_subscription_id,
        p_razorpay_subscription_id,
        p_razorpay_payment_id,
        p_previous_status,
        p_new_status,
        p_previous_tier,
        p_new_tier,
        p_transaction_id,
        p_amount_cents,
        p_currency,
        p_ip_address,
        p_user_agent,
        p_request_id,
        p_details,
        p_source,
        p_error_code,
        p_error_message,
        v_started_at,
        CASE
            WHEN p_error_code IS NOT NULL THEN 'failed'
            ELSE 'completed'
        END
    ) RETURNING id INTO v_audit_id;

    -- Calculate duration and update completed_at for successful operations
    IF p_error_code IS NULL THEN
        UPDATE public.subscription_audit_log
        SET
            completed_at = NOW(),
            duration_ms = EXTRACT(EPOCH FROM (NOW() - v_started_at)) * 1000
        WHERE id = v_audit_id;
    END IF;

    RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user's subscription audit history
CREATE OR REPLACE FUNCTION get_user_subscription_audit_history(
    p_user_id UUID,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0,
    p_action_filter VARCHAR(50) DEFAULT NULL,
    p_days_back INTEGER DEFAULT 90
) RETURNS TABLE (
    id UUID,
    action VARCHAR(50),
    subscription_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    previous_status VARCHAR(50),
    new_status VARCHAR(50),
    previous_tier VARCHAR(50),
    new_tier VARCHAR(50),
    amount_cents INTEGER,
    currency VARCHAR(3),
    audit_status VARCHAR(20),
    error_code VARCHAR(100),
    error_message TEXT,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE,
    duration_ms INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        audit.id,
        audit.action,
        audit.subscription_id,
        audit.razorpay_subscription_id,
        audit.previous_status,
        audit.new_status,
        audit.previous_tier,
        audit.new_tier,
        audit.amount_cents,
        audit.currency,
        audit.audit_status,
        audit.error_code,
        audit.error_message,
        audit.details,
        audit.created_at,
        audit.duration_ms
    FROM public.subscription_audit_log audit
    WHERE
        audit.user_id = p_user_id
        AND audit.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
        AND (p_action_filter IS NULL OR audit.action = p_action_filter)
    ORDER BY audit.created_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get subscription operation statistics
CREATE OR REPLACE FUNCTION get_subscription_operation_stats(
    p_days_back INTEGER DEFAULT 30
) RETURNS TABLE (
    action VARCHAR(50),
    total_count BIGINT,
    success_count BIGINT,
    failure_count BIGINT,
    success_rate NUMERIC,
    avg_duration_ms NUMERIC,
    last_occurrence TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        action,
        COUNT(*) as total_count,
        COUNT(*) FILTER (WHERE audit_status = 'completed') as success_count,
        COUNT(*) FILTER (WHERE audit_status = 'failed') as failure_count,
        ROUND(
            (COUNT(*) FILTER (WHERE audit_status = 'completed')::NUMERIC / NULLIF(COUNT(*), 0)) * 100,
            2
        ) as success_rate,
        ROUND(AVG(duration_ms)) as avg_duration_ms,
        MAX(created_at) as last_occurrence
    FROM public.subscription_audit_log
    WHERE created_at >= NOW() - (p_days_back || ' days')::INTERVAL
    GROUP BY action
    ORDER BY total_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Rollback function
CREATE OR REPLACE FUNCTION rollback_subscription_audit_log_migration() RETURNS void AS $$
BEGIN
    -- Drop indexes
    DROP INDEX IF EXISTS idx_subscription_audit_log_webhook_events;
    DROP INDEX IF EXISTS idx_subscription_audit_log_recent_activity;
    DROP INDEX IF EXISTS idx_subscription_audit_log_failed_operations;
    DROP INDEX IF EXISTS idx_subscription_audit_log_transaction_id;
    DROP INDEX IF EXISTS idx_subscription_audit_log_status;
    DROP INDEX IF EXISTS idx_subscription_audit_log_user_created;
    DROP INDEX IF EXISTS idx_subscription_audit_log_created_at;
    DROP INDEX IF EXISTS idx_subscription_audit_log_razorpay_subscription_id;
    DROP INDEX IF EXISTS idx_subscription_audit_log_subscription_id;
    DROP INDEX IF EXISTS idx_subscription_audit_log_action;
    DROP INDEX IF EXISTS idx_subscription_audit_log_user_id;

    -- Drop functions
    DROP FUNCTION IF EXISTS get_subscription_operation_stats;
    DROP FUNCTION IF EXISTS get_user_subscription_audit_history;
    DROP FUNCTION IF EXISTS log_subscription_operation;
    DROP FUNCTION IF EXISTS update_updated_at_column;

    -- Drop trigger
    DROP TRIGGER IF EXISTS update_subscription_audit_log_updated_at ON public.subscription_audit_log;

    -- Drop policies
    DROP POLICY IF EXISTS "Service role can manage all subscription audit logs" ON public.subscription_audit_log;
    DROP POLICY IF EXISTS "Users cannot delete subscription audit logs" ON public.subscription_audit_log;
    DROP POLICY IF EXISTS "Users cannot update subscription audit logs" ON public.subscription_audit_log;
    DROP POLICY IF EXISTS "Users can insert their own subscription audit logs" ON public.subscription_audit_log;
    DROP POLICY IF EXISTS "Users can view their own subscription audit logs" ON public.subscription_audit_log;

    -- Drop table
    DROP TABLE IF EXISTS public.subscription_audit_log;

    RAISE NOTICE 'subscription_audit_log table and related objects have been rolled back';
END;
$$ LANGUAGE plpgsql;