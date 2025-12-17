import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUpcomingClasses } from '../../redux/slices/liveClassSlice';
import LiveClassCard from './LiveClassCard';

const UpcomingLiveClasses = () => {
    const dispatch = useDispatch();
    const { upcomingClasses, loading, error } = useSelector(state => state.liveClasses);

    useEffect(() => {
        dispatch(fetchUpcomingClasses());
    }, [dispatch]);

    // Check if loading
    if (loading) {
        return (
            <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                <p className="ml-3 text-gray-300">Loading upcoming classes...</p>
            </div>
        );
    }

    // Check if there's an error and only render the error message
    if (error) {
        return (
            <div className="text-center py-8">
                <div className="text-red-400 text-lg mb-2">⚠️ Error Loading Classes</div>
                <p className="text-gray-400 text-sm">{error.message || 'Unknown error occurred'}</p>
            </div>
        );
    }

    // Render upcoming classes or a message if none are found
    return (
        <div>
            <div className='w-full flex flex-col gap-4'>
            {upcomingClasses.length > 0 ? (
                upcomingClasses.map(liveClass => (
                    <LiveClassCard key={liveClass._id} liveClass={liveClass} liveLink={liveClass.liveLink} />
                ))
            ) : (
                <div className="text-center py-8">
                    <div className="text-4xl mb-4">📅</div>
                    <p className="text-gray-400 text-lg">No upcoming classes</p>
                    <p className="text-gray-500 text-sm mt-2">Create a new live class to get started</p>
                </div>
            )}
            </div>
        </div>
    );
};


export default UpcomingLiveClasses;
