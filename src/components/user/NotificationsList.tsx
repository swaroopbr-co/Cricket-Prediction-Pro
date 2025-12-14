'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, X, Info, AlertTriangle, CheckCircle } from 'lucide-react';
import clsx from 'clsx';
import { markNotificationRead } from '@/actions/notification';

export function NotificationsList({ notifications }: { notifications: any[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleMarkRead = async (id: string) => {
        await markNotificationRead(id);
    };

    return (
        <div className="relative z-50">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="group flex flex-col items-center rounded-lg p-2 text-gray-400 hover:bg-[var(--glass-bg)] hover:text-white md:flex-row md:gap-3 md:p-3 transition-colors relative"
            >
                <span className="text-2xl md:text-base group-hover:text-yellow-400 relative">
                    <Bell />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </span>
                <span className="text-xs md:text-base hidden md:block">Notifications</span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-[#0f1014] shadow-2xl"
                        >
                            <div className="p-4 border-b border-white/5 flex justify-between items-center bg-white/5">
                                <h3 className="font-bold text-white text-lg">Notifications</h3>
                                <button onClick={() => setIsOpen(false)} className="rounded-full p-1 hover:bg-white/10 transition">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="overflow-y-auto p-4 space-y-3 max-h-[60vh] scrollbar-hide">
                                {notifications.length === 0 ? (
                                    <div className="text-center p-12 text-gray-500">
                                        <Bell size={48} className="mx-auto mb-4 opacity-20" />
                                        <p>No new notifications</p>
                                    </div>
                                ) : (
                                    notifications.map(n => (
                                        <motion.div
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            key={n.id}
                                            className={clsx(
                                                "p-4 rounded-xl border transition-all relative group",
                                                n.isRead
                                                    ? "bg-white/5 border-transparent text-gray-400"
                                                    : "bg-[var(--surface)] border-[var(--primary)]/30 text-white shadow-[0_4px_12px_rgba(0,0,0,0.2)]"
                                            )}
                                        >
                                            <div className="flex gap-4">
                                                <div className="mt-1">
                                                    {n.type === 'WARNING' || n.type === 'URGENT' ? <AlertTriangle size={20} className="text-yellow-500" /> :
                                                        n.type === 'SUCCESS' ? <CheckCircle size={20} className="text-green-500" /> :
                                                            <Info size={20} className="text-blue-500" />}
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-bold mb-1">{n.title}</h4>
                                                    <p className="text-sm opacity-80 leading-relaxed">{n.message}</p>
                                                    <p className="text-[10px] mt-3 text-gray-500 uppercase tracking-widest">{new Date(n.createdAt).toLocaleString()}</p>
                                                </div>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleMarkRead(n.id);
                                                        }}
                                                        className="absolute top-3 right-3 text-[var(--primary)] hover:scale-110 transition-transform"
                                                        title="Mark as Read"
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
