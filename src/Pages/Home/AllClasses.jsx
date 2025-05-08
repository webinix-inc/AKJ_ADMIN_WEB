import React, { useEffect, useState } from 'react';
import { IoMdClose } from 'react-icons/io';
import { GoBook } from 'react-icons/go';
import { LuClock } from 'react-icons/lu';
import { BiUser } from 'react-icons/bi';
import api from '../../api/axios';

const AllClasses = ({ handleClose, handleshow }) => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch live classes when component mounts
    useEffect(() => {
        const fetchLiveClasses = async () => {
            try {
                const response = await api.get('/api/live-classes');
                setLiveClasses(response.data);
            } catch (error) {
                console.error('Error fetching live classes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchLiveClasses();
    }, []);

    return (
        <div className="bg-[#141414] p-6 rounded-lg shadow-md max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                    <h6 className="text-xl text-white font-bold">All Classes</h6>
                    <select className="border rounded-md px-2 py-1 focus:outline-none focus:ring focus:ring-blue-200">
                        <option value="">Show course classes (by me)</option>
                    </select>
                </div>
                <IoMdClose  size={24} className="cursor-pointer text-white" onClick={handleClose} />
            </div>

            {loading ? (
                <div className="text-center">Loading classes...</div>
            ) : (
                <div className="space-y-6">
                    {liveClasses.map((classItem, index) => (
                        <div key={index} className="p-4 bg-gray-100 rounded-md shadow-sm">
                            <h4 className="text-lg font-semibold mb-2">{classItem.date}</h4>
                            <div className="space-y-4">
                                {classItem.classes.map((cls, clsIndex) => (
                                    <div key={clsIndex} className="bg-white p-4 rounded-md shadow flex justify-between">
                                        <div>
                                            <h6 className="text-lg font-medium">{cls.title}</h6>
                                            <p className="text-blue-500 text-sm">Live Class</p>
                                        </div>
                                        <div className="flex items-center space-x-4 text-gray-600">
                                            <span className="flex items-center space-x-1">
                                                <GoBook className="text-xl" />
                                                <span>{cls.coursesCount} Courses</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <LuClock className="text-xl" />
                                                <span>{cls.time}</span>
                                            </span>
                                            <span className="flex items-center space-x-1">
                                                <BiUser className="text-xl" />
                                                <span>{cls.academy}</span>
                                            </span>
                                            <button className="text-blue-600 hover:underline">Edit</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="flex justify-end mt-6">
                <button
                    onClick={handleshow}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring focus:ring-blue-300"
                >
                    Create Live Class
                </button>
            </div>
        </div>
    );
};

export default AllClasses;
