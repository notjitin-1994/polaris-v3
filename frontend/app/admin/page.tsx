'use client';

import { Suspense, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  FileText,
  Activity,
  TrendingUp,
  Shield,
  DollarSign,
  Database,
  AlertCircle,
  Clock,
  BarChart3,
  Bell,
} from 'lucide-react';
import { GlassCard } from '@/components/ui/GlassCard';
import { StandardHeader } from '@/components/layout/StandardHeader';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Admin Dashboard Overview Page
 * Displays system-wide metrics, user statistics, and quick actions
 * Styled to match SmartSlate Polaris v3 brand guidelines
 */

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalBlueprints: number;
  blueprintsToday: number;
}

function SystemMetricsContent() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/admin/metrics');
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchMetrics();
  }, []);

  if (loading) {
    return <LoadingSkeleton />;
  }

  const stats = [
    {
      title: 'Total Users',
      value: metrics?.totalUsers.toLocaleString() || '0',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      gradient: 'from-cyan-500/20 to-cyan-600/20',
      iconColor: 'text-cyan-400',
      glowColor: 'shadow-cyan-500/20',
    },
    {
      title: 'Active Users (30d)',
      value: metrics?.activeUsers.toLocaleString() || '0',
      change: '+8.2%',
      trend: 'up',
      icon: Activity,
      gradient: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400',
      glowColor: 'shadow-green-500/20',
    },
    {
      title: 'Total Blueprints',
      value: metrics?.totalBlueprints.toLocaleString() || '0',
      change: '+23.1%',
      trend: 'up',
      icon: FileText,
      gradient: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400',
      glowColor: 'shadow-purple-500/20',
    },
    {
      title: 'Blueprints Today',
      value: metrics?.blueprintsToday.toLocaleString() || '0',
      change: '-5.4%',
      trend: 'down',
      icon: TrendingUp,
      gradient: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-400',
      glowColor: 'shadow-orange-500/20',
    },
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <GlassCard
              className={`group cursor-default transition-all duration-300 hover:${stat.glowColor}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/60">{stat.title}</p>
                  <p className="mt-2 text-3xl font-bold text-white">{stat.value}</p>
                  <p className="mt-2 flex items-center text-xs text-white/50">
                    <span className={stat.trend === 'up' ? 'text-green-400' : 'text-red-400'}>
                      {stat.change}
                    </span>
                    <span className="ml-1">from last month</span>
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${stat.gradient} transition-transform duration-300 group-hover:scale-110`}
                >
                  <Icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        );
      })}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <GlassCard key={i}>
          <div className="animate-pulse">
            <div className="h-4 w-24 rounded bg-white/10" />
            <div className="mt-2 h-8 w-16 rounded bg-white/10" />
            <div className="mt-2 h-3 w-32 rounded bg-white/10" />
          </div>
        </GlassCard>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const { user } = useAuth();

  const quickActions = [
    {
      title: 'User Management',
      description: 'View, edit, and manage user accounts and permissions',
      icon: Users,
      href: '/admin/users',
      gradient: 'from-cyan-500/20 to-cyan-600/20',
      iconColor: 'text-cyan-400',
      glowColor: 'hover:shadow-cyan-500/20',
    },
    {
      title: 'Cost Monitoring',
      description: 'Track API costs, usage patterns, and budget alerts',
      icon: DollarSign,
      href: '/admin/costs',
      gradient: 'from-green-500/20 to-green-600/20',
      iconColor: 'text-green-400',
      glowColor: 'hover:shadow-green-500/20',
    },
    {
      title: 'Database Health',
      description: 'Monitor database performance and optimization',
      icon: Database,
      href: '/admin/database',
      gradient: 'from-purple-500/20 to-purple-600/20',
      iconColor: 'text-purple-400',
      glowColor: 'hover:shadow-purple-500/20',
    },
    {
      title: 'Reports',
      description: 'Generate and download system reports',
      icon: BarChart3,
      href: '/admin/reports',
      gradient: 'from-orange-500/20 to-orange-600/20',
      iconColor: 'text-orange-400',
      glowColor: 'hover:shadow-orange-500/20',
    },
    {
      title: 'System Alerts',
      description: 'View and configure system alerts and notifications',
      icon: Bell,
      href: '/admin/alerts',
      gradient: 'from-red-500/20 to-red-600/20',
      iconColor: 'text-red-400',
      glowColor: 'hover:shadow-red-500/20',
    },
    {
      title: 'Activity Logs',
      description: 'Review system activity and audit logs',
      icon: Clock,
      href: '/admin/logs',
      gradient: 'from-indigo-500/20 to-indigo-600/20',
      iconColor: 'text-indigo-400',
      glowColor: 'hover:shadow-indigo-500/20',
    },
  ];

  const systemStatus = [
    { name: 'API Services', status: 'Operational', color: 'bg-green-500' },
    { name: 'Database', status: 'Operational', color: 'bg-green-500' },
    { name: 'AI Services', status: 'Degraded Performance', color: 'bg-yellow-500' },
    { name: 'Storage', status: 'Operational', color: 'bg-green-500' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}
      <StandardHeader
        title="Admin Dashboard"
        subtitle="System overview and management console"
        showDecorativeLine={false}
        sticky={false}
        showDarkModeToggle={false}
        showUserAvatar={false}
        size="compact"
        user={user}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-heading text-5xl font-bold tracking-tight text-white sm:text-6xl md:text-7xl">
              <span>Admin </span>
              <span className="text-primary">Control Center</span>
            </h1>
            <p className="mt-4 text-xl text-white/70">
              Monitor, manage, and optimize your SmartSlate Polaris platform
            </p>
          </motion.div>

          {/* System Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Suspense fallback={<LoadingSkeleton />}>
              <SystemMetricsContent />
            </Suspense>
          </motion.div>

          {/* Quick Actions Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <h2 className="mb-6 text-2xl font-bold text-white">Quick Actions</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <motion.div
                    key={action.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                  >
                    <GlassCard
                      className={`group cursor-pointer transition-all duration-300 ${action.glowColor} hover:scale-[1.02]`}
                      onClick={() => (window.location.href = action.href)}
                    >
                      <div className="flex items-start space-x-4">
                        <div
                          className={`flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${action.gradient} transition-transform duration-300 group-hover:scale-110`}
                        >
                          <Icon className={`h-6 w-6 ${action.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                          <p className="mt-1 text-sm text-white/60">{action.description}</p>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="mb-6 text-2xl font-bold text-white">System Status</h2>
            <GlassCard>
              <div className="space-y-4">
                {systemStatus.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + index * 0.1 }}
                    className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${service.color}`} />
                      <span className="font-medium text-white">{service.name}</span>
                    </div>
                    <span className="text-sm text-white/60">{service.status}</span>
                  </motion.div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
