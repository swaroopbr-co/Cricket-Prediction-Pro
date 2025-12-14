import { getMyPredictions } from '@/actions/prediction';

type Prediction = Awaited<ReturnType<typeof getMyPredictions>>[number];

export const dynamic = 'force-dynamic';

export default async function MyPredictionsPage() {
    const predictions = await getMyPredictions();

    return (
        <div>
            <h1 className="heading-gradient mb-8 text-2xl font-bold">My Predictions</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {predictions.map((p: Prediction) => {
                    if (!p.match) return null;

                    const isCorrectToss = p.match.tossWinner === p.tossPick;
                    const isCorrectMatch = p.match.matchWinner === p.matchPick;

                    const isCompleted = p.match.status === 'COMPLETED';

                    return (
                        <div key={p.id} className="relative overflow-hidden rounded-xl border border-white/5 bg-[#1a1b1f] p-6 shadow-lg">
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500">{p.match.tournament.name}</span>
                                <span className="text-xs text-gray-400">{new Date(p.match.date).toLocaleDateString()}</span>
                            </div>

                            <div className="mb-6 text-center">
                                <div className="flex items-center justify-center gap-3 text-lg font-bold text-white">
                                    <span>{p.match.teamA}</span>
                                    <span className="text-[var(--primary)]">VS</span>
                                    <span>{p.match.teamB}</span>
                                </div>
                            </div>

                            <div className="space-y-4 text-sm">
                                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                                    <span className="text-gray-400">Your Toss Pick:</span>
                                    <span className={`font-bold ${isCompleted && p.match.tossWinner ? (isCorrectToss ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                                        {p.tossPick || '-'}
                                        {isCompleted && p.match.tossWinner && (isCorrectToss ? ' (+10)' : ' (0)')}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                                    <span className="text-gray-400">Your Match Pick:</span>
                                    <span className={`font-bold ${isCompleted && p.match.matchWinner ? (isCorrectMatch ? 'text-green-400' : 'text-red-400') : 'text-white'}`}>
                                        {p.matchPick || '-'}
                                        {isCompleted && p.match.matchWinner && (isCorrectMatch ? ' (+20)' : ' (0)')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-between border-t border-white/5 pt-4">
                                <span className="text-gray-400">Points Earned:</span>
                                <span className="font-bold text-[var(--primary)] text-lg">{p.points}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {predictions.length === 0 && (
                <div className="text-center text-gray-400 py-12">
                    You haven't made any predictions yet.
                </div>
            )}
        </div>
    );
}
