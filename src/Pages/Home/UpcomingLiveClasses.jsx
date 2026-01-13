import React, { useEffect, memo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUpcomingClasses } from '../../redux/slices/liveClassSlice';
import LiveClassCard from './LiveClassCard';

// Simple skeleton - no heavy animations
const SkeletonCard = () => (
    <div className="w-full bg-[#1c1c1c] p-4 rounded-xl border border-gray-800">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-700 rounded-lg"></div>
                <div className="h-5 w-32 bg-gray-700 rounded"></div>
            </div>
            <div className="h-6 w-20 bg-gray-700 rounded-full"></div>
        </div>
        <div className="space-y-3">
            <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
            <div className="h-4 w-1/2 bg-gray-700 rounded"></div>
        </div>
        <div className="flex gap-2 mt-4">
            <div className="h-9 w-24 bg-gray-700 rounded-lg"></div>
            <div className="h-9 w-16 bg-gray-700 rounded-lg"></div>
            <div className="h-9 w-16 bg-gray-700 rounded-lg"></div>
        </div>
    </div>
);

const UpcomingLiveClasses = memo(() => {
    const dispatch = useDispatch();
    const { upcomingClasses, loading, error } = useSelector(state => state.liveClasses);

    useEffect(() => {
        dispatch(fetchUpcomingClasses());
    }, [dispatch]);

    if (loading) {
        return (
            <div className="w-full flex flex-col gap-4">
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-10 px-4">
                <div className="text-3xl mb-4">⚠️</div>
                <h3 className="text-red-400 text-lg font-semibold mb-2">Error Loading Classes</h3>
                <p className="text-gray-400 text-sm text-center max-w-xs">
                    {error.message || 'Something went wrong.'}
                </p>
                <button
                    onClick={() => dispatch(fetchUpcomingClasses())}
                    className="mt-4 px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm font-medium hover:bg-red-500/30"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (!upcomingClasses || upcomingClasses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4">
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-gray-300 text-lg font-semibold mb-2">No Upcoming Classes</h3>
                <p className="text-gray-500 text-sm text-center max-w-xs">
                    Create a new live class to get started
                </p>
            </div>
        );
    }

    return (
        <div className='w-full flex flex-col gap-4'>
            {upcomingClasses.map(liveClass => (
                <LiveClassCard
                    key={liveClass._id}
                    liveClass={liveClass}
                    liveLink={liveClass.liveLink}
                />
            ))}
        </div>
    );
});

UpcomingLiveClasses.displayName = 'UpcomingLiveClasses';

export default UpcomingLiveClasses;
