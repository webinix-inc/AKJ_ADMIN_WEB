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
    if (loading) return <p>Loading upcoming classes...</p>;

    // Check if there's an error and only render the error message
    if (error) return <p>{error.message || 'Unknown error'}</p>;

    // Render upcoming classes or a message if none are found
    return (
        <div>
            <div className='w-full flex flex-col gap-4'>
            {upcomingClasses.length > 0 ? (
                upcomingClasses.map(liveClass => (
                    <LiveClassCard key={liveClass._id} liveClass={liveClass} liveLink={liveClass.liveLink} />
                ))
            ) : (
                <p>No upcoming classes found.</p>
            )}
            </div>

        </div>
    );
};


export default UpcomingLiveClasses;
