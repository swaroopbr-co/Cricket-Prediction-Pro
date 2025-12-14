'use client';

import { approveRoomMember, rejectRoomMember } from '@/actions/room';
import { UserCheck, UserX } from 'lucide-react';
import { useTransition } from 'react';

export function RoomMembersList({ pendingMembers, roomId }: { pendingMembers: any[], roomId: string }) {
    const [isPending, startTransition] = useTransition();

    if (pendingMembers.length === 0) return null;

    return (
        <div className="glass p-6 rounded-xl mb-8 border border-yellow-500/30 bg-yellow-900/10">
            <h3 className="text-lg font-bold text-yellow-200 mb-4 flex items-center gap-2">
                <span>⚠️</span> Pending Requests ({pendingMembers.length})
            </h3>
            <div className="space-y-3">
                {pendingMembers.map((member) => (
                    <div key={member.userId} className="flex justify-between items-center bg-black/20 p-3 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-xs font-bold">
                                {member.user.username[0].toUpperCase()}
                            </div>
                            <span className="font-medium">{member.user.username}</span>
                        </div>
                        <div className="flex gap-2">
                            <button
                                disabled={isPending}
                                onClick={() => startTransition(() => approveRoomMember(roomId, member.userId))}
                                className="p-2 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors"
                            >
                                <UserCheck size={18} />
                            </button>
                            <button
                                disabled={isPending}
                                onClick={() => startTransition(() => rejectRoomMember(roomId, member.userId))}
                                className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors"
                            >
                                <UserX size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
