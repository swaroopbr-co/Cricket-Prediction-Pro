import { createPoll, getPolls, deletePoll } from '@/actions/poll';
import { prisma } from '@/lib/prisma';
import { Trash } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function AdminPollsPage() {
    const polls = await getPolls(true);
    const tournaments = await prisma.tournament.findMany({ select: { id: true, name: true } });

    async function handleCreate(formData: FormData) {
        'use server';
        const question = formData.get('question') as string;
        const tournamentId = formData.get('tournamentId') as string;
        // Parse options from comma separated string or multiple inputs?
        // Let's assume text area with lines for simplicity
        const optionsText = formData.get('options') as string;
        const options = optionsText.split('\n').filter(s => s.trim() !== '');

        await createPoll(question, options, tournamentId === 'none' ? undefined : tournamentId);
    }

    return (
        <div>
            <h1 className="heading-gradient mb-6 text-2xl font-bold">Community Polls</h1>

            <div className="glass mb-8 p-6 rounded-xl">
                <h2 className="text-lg font-bold mb-4">Create New Poll</h2>
                <form action={handleCreate} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <input name="question" placeholder="Question (e.g. Who will win IPL 2026?)" required className="col-span-2 p-3 rounded bg-[var(--surface)] border border-white/10" />
                        <select name="tournamentId" className="p-3 rounded bg-[var(--surface)] border border-white/10">
                            <option value="none">General Poll (No Tournament)</option>
                            {tournaments.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                    </div>
                    <textarea
                        name="options"
                        placeholder="Options (one per line)&#10;Mumbai Indians&#10;CSK&#10;RCB"
                        required
                        rows={4}
                        className="w-full p-3 rounded bg-[var(--surface)] border border-white/10"
                    />
                    <button className="btn-primary w-full md:w-auto">Launch Poll</button>
                </form>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {polls.map((poll: any) => (
                    <div key={poll.id} className="glass p-6 rounded-xl relative group">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h3 className="text-xl font-bold">{poll.question}</h3>
                                {poll.tournament && <span className="text-xs text-[var(--secondary)]">{poll.tournament.name}</span>}
                            </div>
                            <form action={async () => {
                                'use server';
                                await deletePoll(poll.id);
                            }}>
                                <button className="text-red-400 hover:text-red-300"><Trash size={16} /></button>
                            </form>
                        </div>

                        <div className="space-y-2">
                            {poll.options.map((opt: any) => (
                                <div key={opt.id} className="flex justify-between text-sm bg-white/5 p-2 rounded">
                                    <span>{opt.text}</span>
                                    <span className="font-bold">{opt._count.votes} votes</span>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
