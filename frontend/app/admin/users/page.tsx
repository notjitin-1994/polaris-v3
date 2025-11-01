'use client';

import { Suspense } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield } from 'lucide-react';
import { UserManagementTable } from '@/components/admin/users/UserManagementTable';
import { useAuth } from '@/contexts/AuthContext';

export default function UsersPage() {
  const { user } = useAuth();

  return (
    <div className="relative min-h-screen w-full bg-[#020C1B] text-[rgb(224,224,224)]">
      {/* Header */}

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="flex items-center space-x-4"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20">
              <Users className="h-8 w-8 text-cyan-400" />
            </div>
            <div>
              <h1 className="font-heading text-4xl font-bold tracking-tight text-white sm:text-5xl">
                <span>User </span>
                <span className="text-primary">Management</span>
              </h1>
              <p className="mt-2 text-lg text-white/70">
                Comprehensive user administration and analytics
              </p>
            </div>
          </motion.div>

          {/* User Management Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Suspense
              fallback={
                <div className="flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 p-12">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-cyan-500 border-t-transparent" />
                    <p className="text-white/60">Loading users...</p>
                  </div>
                </div>
              }
            >
              <UserManagementTable />
            </Suspense>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
