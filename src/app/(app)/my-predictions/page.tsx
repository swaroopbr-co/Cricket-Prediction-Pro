import { getMyPredictions } from '@/actions/prediction';
import { MyPredictionsView } from '@/components/user/MyPredictionsView';

export const dynamic = 'force-dynamic';

export default async function MyPredictionsPage() {
    const predictions = await getMyPredictions();

    return <MyPredictionsView initialPredictions={predictions} />;
}
