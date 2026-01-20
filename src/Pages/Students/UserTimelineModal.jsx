import React, { useEffect, useState } from "react"; // Force rebuild
import { Modal, Timeline, Tag, Spin, Alert, Typography, Descriptions } from "antd";
import { CheckCircleFilled, ClockCircleOutlined, SyncOutlined } from "@ant-design/icons";
import api from "../../api/axios";

const { Text, Title } = Typography;

const UserTimelineModal = ({ visible, onCancel, userId, courseId, courseTitle }) => {
    const [loading, setLoading] = useState(false);
    const [timelineData, setTimelineData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (visible && userId && courseId) {
            fetchTimeline();
        } else {
            setTimelineData(null);
            setError(null);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [visible, userId, courseId]);

    const fetchTimeline = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await api.get(`/admin/installments/${courseId}/user/${userId}/timeline`);
            if (response.data) {
                setTimelineData(response.data);
            }
        } catch (err) {
            console.error("Error fetching timeline:", err);
            setError(err.response?.data?.message || "Failed to load installment timeline.");
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (isPaid, dueDate) => {
        if (isPaid) return <Tag color="success" icon={<CheckCircleFilled />}>Paid</Tag>;

        const isOverdue = new Date(dueDate) < new Date();
        if (isOverdue) return <Tag color="error" icon={<ClockCircleOutlined />}>Overdue</Tag>;

        return <Tag color="processing" icon={<SyncOutlined />}>Pending</Tag>;
    };

    return (
        <Modal
            title={
                <div>
                    <Title level={5} style={{ margin: 0, color: '#fff' }}>Installment Timeline</Title>
                    {courseTitle && <Text style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.65)' }}>{courseTitle}</Text>}
                </div>
            }
            visible={visible}
            onCancel={onCancel}
            footer={null}
            width={600}
            centered
            className="dark-modal"
        >
            {loading ? (
                <div className="flex justify-center py-8">
                    <Spin size="large" tip="Loading timeline..." />
                </div>
            ) : error ? (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    className="my-4"
                />
            ) : timelineData && timelineData.timeline ? (
                <div className="py-4">
                    <div className="mb-6 bg-white/5 p-4 rounded-lg border border-gray-700">
                        <Descriptions column={2} size="small">
                            <Descriptions.Item label={<span className="text-gray-400">Total Amount</span>}>
                                <Text strong className="text-white">₹{timelineData.totalAmount}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<span className="text-gray-400">Plan Type</span>}>
                                <Text className="text-blue-400">{timelineData.timeline[0]?.planType || "Standard"}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<span className="text-gray-400">Paid Amount</span>}>
                                <Text type="success">₹{timelineData.paidAmount}</Text>
                            </Descriptions.Item>
                            <Descriptions.Item label={<span className="text-gray-400">Remaining</span>}>
                                {timelineData.remainingAmount > 0 ? (
                                    <Text type="danger">₹{timelineData.remainingAmount}</Text>
                                ) : (
                                    <Tag color="green">Fully Paid</Tag>
                                )}
                            </Descriptions.Item>
                        </Descriptions>
                    </div>

                    <Timeline mode="left" className="mt-4 px-4">
                        {timelineData.timeline.map((item, index) => (
                            <Timeline.Item
                                key={index}
                                color={item.isPaid ? "green" : new Date(item.dueDate) < new Date() ? "red" : "blue"}
                                dot={item.isPaid ? <CheckCircleFilled style={{ fontSize: '16px' }} /> : null}
                            >
                                <div className="flex justify-between items-start mb-1">
                                    <div>
                                        <Text strong className="text-white block">Installment {item.installmentIndex !== undefined ? item.installmentIndex + 1 : index + 1}</Text>
                                        <Text className="text-xs text-gray-400">
                                            Due: {item.dueDate ? new Date(item.dueDate).toLocaleDateString() : "N/A"}
                                        </Text>
                                    </div>
                                    <div className="text-right">
                                        <Text strong className="block text-white">₹{item.amount}</Text>
                                        {getStatusTag(item.isPaid, item.dueDate)}
                                    </div>
                                </div>
                                {item.paidOn && (
                                    <div className="text-xs text-green-500 mt-1">
                                        Paid on: {new Date(item.paidOn).toLocaleDateString()}
                                    </div>
                                )}
                            </Timeline.Item>
                        ))}
                    </Timeline>
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">
                    No timeline data available for this course.
                </div>
            )}
        </Modal>
    );
};

export default UserTimelineModal;
