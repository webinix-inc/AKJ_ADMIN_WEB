import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Modal,
  Button,
  Form,
  Input,
  Select,
  Spin,
  InputNumber,
  Switch,
  notification,
  message,
  Timeline,
  Card,
  Tag,
  Drawer,
  Row,
  Col,
  Tooltip
} from "antd";
import { HiPlus } from "react-icons/hi";
import { IoClose, IoEyeOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { AiOutlineEdit, AiOutlineDelete } from "react-icons/ai";
import HOC from "../../Component/HOC/HOC";
import {
  createSubscription,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription,
} from "../../redux/slices/subscriptionSlice";
import { fetchCourses } from "../../redux/slices/courseSlice";
import CreateInstallmentButton from "../Courses & Tests/CreateInstallmentButton";
import api from "../../api/axios";
import "./Plans.css";

const GST_OPTIONS = [0, 5, 12, 18];
const INTERNET_HANDLING_OPTIONS = [0, 1, 1.5, 2, 2.5];

const Plans = () => {
  const dispatch = useDispatch();
  const { subscriptions, loading: loadingSubscriptions } = useSelector(
    (state) => state.subscription
  );
  const { courses, loading: loadingCourses } = useSelector(
    (state) => state.courses
  );

  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [form] = Form.useForm();
  const [currentSubscription, setCurrentSubscription] = useState(null);
  const [validities, setValidities] = useState([
    { validity: null, price: null, discount: null },
  ]);
  const [features, setFeatures] = useState([
    { name: "", enabled: true, description: "" },
  ]);
  const [isPlanSaved, setIsPlanSaved] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [installments, setInstallments] = useState([]);
  const [loadingInstallments, setLoadingInstallments] = useState(false);
  const [isTimelineModalVisible, setIsTimelineModalVisible] = useState(false);
  const [selectedInstallment, setSelectedInstallment] = useState(null);
  const [isEditPlanSaved, setIsEditPlanSaved] = useState(false);
  const [isEditingAllowed, setIsEditingAllowed] = useState(false);

  useEffect(() => {
    dispatch(getAllSubscriptions())
      .unwrap()
      .catch((error) => {
        notification.error({
          message: "Error",
          description: error.message || "Failed to fetch subscriptions",
        });
      });

    dispatch(fetchCourses())
      .unwrap()
      .catch((error) => {
        notification.error({
          message: "Error",
          description: error.message || "Failed to fetch courses",
        });
      });
  }, [dispatch]);

  const showAddModal = () => {
    setIsAddModalVisible(true);
    form.resetFields();
    setValidities([{ validity: null, price: null, discount: null }]);
    setFeatures([{ name: "", enabled: true, description: "" }]);
    setIsPlanSaved(false);
  };

  const showEditModal = (subscription) => {
    setCurrentSubscription(subscription);
    setSelectedCourseId(subscription?.course?._id);
    form.setFieldsValue({
      ...subscription,
      course: subscription?.course?._id,
    });
    setValidities(
      subscription.validities || [
        { validity: null, price: null, discount: null },
      ]
    );
    setFeatures(
      subscription.features || [{ name: "", enabled: true, description: "" }]
    );
    setIsEditModalVisible(true);
    setIsEditPlanSaved(true); // Assuming existing plan is saved initially
    setIsEditingAllowed(false);
  };

  const handleCancel = () => {
    setIsAddModalVisible(false);
    setIsEditModalVisible(false);
    setIsPlanSaved(false);
    form.resetFields();
    setValidities([{ validity: null, price: null, discount: null }]);
    setFeatures([{ name: "", enabled: true, description: "" }]);
  };

  const handleSavePlan = async (values) => {
    const subscriptionData = {
      ...values,
      validities,
      features,
    };

    try {
      await dispatch(createSubscription(subscriptionData)).unwrap();

      notification.success({
        message: "Success",
        description: "Subscription plan added successfully",
      });

      setIsPlanSaved(true);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to add subscription plan",
      });
    }
  };

  const handleEditPlan = async (values) => {
    try {
      await dispatch(
        updateSubscription({
          id: currentSubscription._id,
          updateData: { ...values, validities, features },
        })
      ).unwrap();
      notification.success({
        message: "Success",
        description: "Subscription plan updated successfully",
      });
      setIsEditPlanSaved(true);
      setIsEditingAllowed(false);
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to update subscription plan",
      });
      setIsEditPlanSaved(false);
      setIsEditingAllowed(true);
    }
  };

  const handleInstallmentSubmit = useCallback(async (installmentData) => {
    try {
      const response = await api.post(
        "/admin/create-installment",
        installmentData
      );

      if (response.status === 201 || response.status === 200) {
        message.success("Installment plan set successfully");
      } else {
        message.error(
          response.data.message || "Failed to set installment plan"
        );
      }
    } catch (error) {
      message.error(
        error.response?.data?.message || "Error setting installment plan"
      );
    }
  }, []);

  const handleDeletePlan = (id) => {
    Modal.confirm({
      title: "Delete Plan",
      icon: <IoClose className="text-red-500" size={24} />,
      content: "Are you sure you want to delete this plan? This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "Cancel",
      centered: true,
      maskClosable: true,
      onOk: async () => {
        try {
          await dispatch(deleteSubscription(id)).unwrap();
          notification.success({
            message: "Success",
            description: "Subscription plan deleted successfully",
          });
        } catch (error) {
          notification.error({
            message: "Error",
            description: error.message || "Failed to delete subscription plan",
          });
        }
      },
    });
  };

  const handleValidityChange = (index, key, value) => {
    setValidities((prevValidities) =>
      prevValidities.map((item, idx) =>
        idx === index ? { ...item, [key]: value } : item
      )
    );
  };

  const addValidityField = () => {
    setValidities([
      ...validities,
      { validity: null, price: null, discount: null },
    ]);
  };

  const removeValidityField = (index) => {
    const newValidities = validities.filter((_, i) => i !== index);
    setValidities(newValidities);
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value;
    setFeatures(newFeatures);
  };

  const addFeatureField = () => {
    setFeatures([...features, { name: "", enabled: true, description: "" }]);
  };

  const removeFeatureField = (index) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };

  const handleGetInstallments = async (courseId) => {
    setLoadingInstallments(true);
    try {
      const response = await api.get(`/admin/installments/${courseId}`);
      if (response.status === 200) {
        setInstallments(response.data.data);
      } else {
        message.error(
          response.data.message || "Failed to retrieve installment plan"
        );
      }
    } catch (error) {
      message.error("Error retrieving installment plan");
    } finally {
      setLoadingInstallments(false);
    }
  };

  const showViewPlanModal = async (plan) => {
    setSelectedPlan(plan);
    setIsViewModalVisible(true);
    if (plan?.course?._id) {
      await handleGetInstallments(plan.course._id);
    }
  };

  const closeViewPlanModal = () => {
    setIsViewModalVisible(false);
    setSelectedPlan(null);
    setInstallments([]);
  };

  const showInstallmentTimeline = (installment) => {
    setSelectedInstallment(installment);
    setIsTimelineModalVisible(true);
  };

  const closeInstallmentTimelineModal = () => {
    setIsTimelineModalVisible(false);
    setSelectedInstallment(null);
  };

  if (loadingSubscriptions || loadingCourses) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="plans-container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Subscription Plans</h2>
          <p className="text-gray-400">Manage your course subscriptions and pricing tiers</p>
        </div>
        <Button
          type="primary"
          icon={<HiPlus />}
          onClick={showAddModal}
          size="large"
          className="dark-btn-primary"
        >
          Create New Plan
        </Button>
      </div>

      <Row gutter={[24, 24]}>
        {subscriptions?.map((plan) => (
          <Col xs={24} md={12} lg={8} key={plan._id}>
            <div className="glass-card">
              <button
                className="view-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  showViewPlanModal(plan);
                }}
              >
                <Tooltip title="View Details">
                  <IoEyeOutline size={18} />
                </Tooltip>
              </button>

              <div className="card-header">
                <h3 className="plan-title">{plan.name}</h3>
                <span className="course-title">{plan.course?.title || 'Unknown Course'}</span>
              </div>

              <div className="card-body">
                <div className="mb-4">
                  <div className="section-label">Validities</div>
                  <div className="flex flex-wrap">
                    {plan.validities.map((v, idx) => (
                      <div key={idx} className="validity-tag">
                        {v.validity} Months (₹{v.price})
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="section-label">Features</div>
                  <ul className="features-list">
                    {plan.features?.slice(0, 4).map((feature, featureIndex) => (
                      <li key={featureIndex} className="feature-item">
                        <IoCheckmarkCircleOutline className="feature-icon" />
                        {feature.name}
                      </li>
                    ))}
                    {plan.features?.length > 4 && (
                      <li className="text-xs text-gray-500 italic pl-6">
                        +{plan.features.length - 4} more features...
                      </li>
                    )}
                  </ul>
                </div>
              </div>

              <div className="card-footer">
                <Button
                  block
                  className="dark-btn-primary"
                  icon={<AiOutlineEdit />}
                  onClick={() => showEditModal(plan)}
                >
                  Edit
                </Button>
                <Button
                  block
                  className="dark-btn-danger"
                  icon={<AiOutlineDelete />}
                  onClick={() => handleDeletePlan(plan._id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          </Col>
        ))}
        {(!subscriptions || subscriptions.length === 0) && (
          <div className="flex flex-col items-center justify-center w-full py-20 text-gray-500">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-semibold">No Plans Found</h3>
            <p>Create a new subscription plan to get started.</p>
          </div>
        )}
      </Row>

      {/* View Plan Modal */}
      <Drawer
        title="Plan Details"
        visible={isViewModalVisible}
        onClose={closeViewPlanModal}
        width={500}
        footer={null}
        className="dark-drawer"
      >
        {selectedPlan && (
          <div className="text-white space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-1">{selectedPlan.name}</h2>
              <p className="text-blue-400 font-medium">{selectedPlan?.course?.title}</p>
            </div>

            <div className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700">
              <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Pricing Logic</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">GST:</span>
                  <span>{selectedPlan.gst}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Internet Handling:</span>
                  <span>{selectedPlan.internetHandling}%</span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Validities</h4>
              <div className="space-y-2">
                {selectedPlan.validities.map((validity, index) => (
                  <div key={index} className="flex justify-between items-center bg-[#2a2a2a] p-3 rounded border border-gray-700">
                    <span className="font-semibold">{validity.validity} Months</span>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-400">
                        ₹{Math.floor(validity.price * (1 - validity.discount / 100))}
                      </div>
                      {validity.discount > 0 && (
                        <div className="text-xs text-gray-500">
                          <span className="line-through mr-1">₹{validity.price}</span>
                          <span className="text-red-400">({validity.discount}% OFF)</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Features</h4>
              <ul className="space-y-2">
                {selectedPlan.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-gray-300">
                    <IoCheckmarkCircleOutline className="text-blue-500 mr-2 mt-1 flex-shrink-0" />
                    {feature.name}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-gray-400 text-xs uppercase font-bold mb-3 tracking-wider">Installments</h4>
              {loadingInstallments ? (
                <div className="flex justify-center py-4"><Spin /></div>
              ) : installments.length > 0 ? (
                <div className="space-y-2">
                  {installments.map((installment, index) => (
                    <div key={index} className="bg-[#1f1f1f] p-3 rounded border border-gray-800 flex justify-between items-center">
                      <div>
                        <p className="font-medium text-white">{installment.planType}</p>
                        <p className="text-xs text-gray-400">{installment.numberOfInstallments} payments</p>
                      </div>
                      <Button size="small" type="link" onClick={() => showInstallmentTimeline(installment)}>
                        View Schedule
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 italic">No installment plans configured.</p>
              )}
            </div>
          </div>
        )}
      </Drawer>

      {/* Installment Timeline Modal */}
      <InstallmentTimelineModal
        visible={isTimelineModalVisible}
        onCancel={closeInstallmentTimelineModal}
        installment={selectedInstallment}
      />

      {/* Add Subscription Modal */}
      <Modal
        title="Create New Plan"
        visible={isAddModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
        className="dark-modal"
      >
        <Form form={form} layout="vertical" onFinish={handleSavePlan}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Course"
                name="course"
                rules={[{ required: true, message: "Please select a course!" }]}
              >
                <Select
                  onChange={(value) => setSelectedCourseId(value)}
                  placeholder="Select a course"
                  disabled={isPlanSaved}
                  className="dark-select"
                >
                  {courses?.map((course) => (
                    <Select.Option key={course._id} value={course._id}>
                      {course.title}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Plan Name"
                name="name"
                rules={[{ required: true, message: "Please input the plan name!" }]}
              >
                <Input placeholder="e.g. Premium Plan" disabled={isPlanSaved} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Validities" className="mb-6">
            <div className="form-section-container">
              {validities.map((validity, index) => (
                <Row key={index} gutter={12} className="mb-3 items-center">
                  <Col span={6}>
                    <Form.Item className="mb-0">
                      <InputNumber
                        value={validity.validity}
                        min={1}
                        max={99}
                        placeholder="Months"
                        style={{ width: '100%' }}
                        disabled={isPlanSaved}
                        onChange={(value) => handleValidityChange(index, "validity", value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item className="mb-0">
                      <InputNumber
                        value={validity.price}
                        placeholder="Price (₹)"
                        style={{ width: '100%' }}
                        disabled={isPlanSaved}
                        onChange={(value) => handleValidityChange(index, "price", value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={7}>
                    <Form.Item className="mb-0">
                      <InputNumber
                        value={validity.discount}
                        min={0}
                        max={100}
                        placeholder="Disc %"
                        style={{ width: '100%' }}
                        disabled={isPlanSaved}
                        onChange={(value) => handleValidityChange(index, "discount", value)}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={4}>
                    <Button
                      type="text"
                      danger
                      onClick={() => removeValidityField(index)}
                      disabled={isPlanSaved}
                      icon={<IoClose size={20} />}
                      className="flex items-center justify-center hover:bg-red-500/10 rounded-full w-8 h-8"
                    />
                  </Col>
                </Row>
              ))}
              <Button type="dashed" block onClick={addValidityField} disabled={isPlanSaved} icon={<HiPlus />}>
                Add Validity Option
              </Button>
            </div>
          </Form.Item>

          <Form.Item label="Features" className="mb-6">
            <div className="form-section-container">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-3 mb-3 items-center">
                  <Input
                    value={feature.name}
                    onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                    placeholder="Feature Description"
                    disabled={isPlanSaved}
                    className="flex-1"
                  />
                  <Switch
                    checked={feature.enabled}
                    onChange={(checked) => handleFeatureChange(index, "enabled", checked)}
                    disabled={isPlanSaved}
                    size="small"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<IoClose size={18} />}
                    onClick={() => removeFeatureField(index)}
                    disabled={isPlanSaved}
                    className="flex items-center justify-center hover:bg-red-500/10 rounded-full w-8 h-8"
                  />
                </div>
              ))}
              <Button type="dashed" block onClick={addFeatureField} disabled={isPlanSaved} icon={<HiPlus />}>
                Add Feature
              </Button>
            </div>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="GST (%)"
                name="gst"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select placeholder="Select %" disabled={isPlanSaved}>
                  {GST_OPTIONS.map((option) => (
                    <Select.Option key={option} value={option}>{option}%</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Internet Handling (%)"
                name="internetHandling"
                rules={[{ required: true, message: "Required" }]}
              >
                <Select placeholder="Select %" disabled={isPlanSaved}>
                  {INTERNET_HANDLING_OPTIONS.map((option) => (
                    <Select.Option key={option} value={option}>{option}%</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-4 justify-end pt-4 border-t border-gray-700 mt-4">
            {!isPlanSaved ? (
              <Button type="primary" htmlType="submit" size="large" className="dark-btn-primary px-8">
                Save Plan
              </Button>
            ) : (
              <CreateInstallmentButton
                courseId={selectedCourseId}
                onSubmit={handleInstallmentSubmit}
                isPlanSaved={isPlanSaved}
                setIsPlanSaved={setIsPlanSaved}
                handleCancel={handleCancel}
              />
            )}
          </div>
        </Form>
      </Modal>

      {/* Edit Subscription Modal */}
      <Drawer
        title="Edit Plan"
        visible={isEditModalVisible}
        onClose={() => {
          handleCancel();
          setIsEditPlanSaved(false);
          setIsEditingAllowed(false);
        }}
        width={600}
        className="dark-drawer"
      >
        <Form form={form} layout="vertical" onFinish={handleEditPlan}>
          <Form.Item
            label="Course"
            name="course"
            rules={[{ required: true, message: "Please select a course!" }]}
          >
            <Select
              placeholder="Select a course"
              onChange={(value) => setSelectedCourseId(value)}
              value={selectedCourseId}
              disabled={!isEditingAllowed}
            >
              {courses?.map((course) => (
                <Select.Option
                  key={course._id}
                  value={course._id}
                >
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Plan Name"
            name="name"
            rules={[{ required: true, message: "Please input the plan name!" }]}
          >
            <Input disabled={!isEditingAllowed} />
          </Form.Item>

          <Form.Item label="Validities">
            <div className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700">
              {validities.map((validity, index) => (
                <Row key={index} gutter={8} className="mb-2">
                  <Col span={6}>
                    <InputNumber
                      value={validity.validity}
                      min={1} max={99}
                      placeholder="Months"
                      style={{ width: '100%' }}
                      disabled={!isEditingAllowed}
                      onChange={(value) => handleValidityChange(index, "validity", value)}
                    />
                  </Col>
                  <Col span={7}>
                    <InputNumber
                      value={validity.price}
                      placeholder="Price"
                      style={{ width: '100%' }}
                      disabled={!isEditingAllowed}
                      onChange={(value) => handleValidityChange(index, "price", value)}
                    />
                  </Col>
                  <Col span={7}>
                    <InputNumber
                      value={validity.discount}
                      min={0} max={100}
                      placeholder="Disc %"
                      style={{ width: '100%' }}
                      disabled={!isEditingAllowed}
                      onChange={(value) => handleValidityChange(index, "discount", value)}
                    />
                  </Col>
                  <Col span={4}>
                    <Button danger type="text" icon={<IoClose />} onClick={() => removeValidityField(index)} disabled={isEditPlanSaved} />
                  </Col>
                </Row>
              ))}
              <Button type="dashed" block onClick={addValidityField} disabled={isEditPlanSaved}>+ Add Validity</Button>
            </div>
          </Form.Item>

          <Form.Item label="Features">
            <div className="bg-[#2a2a2a] p-4 rounded-lg border border-gray-700">
              {features.map((feature, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={feature.name}
                    onChange={(e) => handleFeatureChange(index, "name", e.target.value)}
                    disabled={!isEditingAllowed}
                  />
                  <Switch
                    checked={feature.enabled}
                    onChange={(val) => handleFeatureChange(index, "enabled", val)}
                    disabled={!isEditingAllowed}
                    size="small"
                    className="mt-1"
                  />
                  <Button danger type="text" icon={<IoClose />} onClick={() => removeFeatureField(index)} disabled={isEditPlanSaved} />
                </div>
              ))}
              <Button type="dashed" block onClick={addFeatureField} disabled={isEditPlanSaved}>+ Add Feature</Button>
            </div>
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="GST (%)" name="gst">
                <Select disabled={!isEditingAllowed}>
                  {GST_OPTIONS.map((o) => <Select.Option key={o} value={o}>{o}%</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Internet Handling (%)" name="internetHandling">
                <Select disabled={!isEditingAllowed}>
                  {INTERNET_HANDLING_OPTIONS.map((o) => <Select.Option key={o} value={o}>{o}%</Select.Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <div className="flex gap-3 justify-end mt-4 pt-4 border-t border-gray-700">
            {!isEditingAllowed && !isEditPlanSaved ? (
              <Button onClick={() => setIsEditingAllowed(true)}>Enable Editing</Button>
            ) : (
              <Button type="primary" htmlType="submit" disabled={isEditPlanSaved}>Update Plan</Button>
            )}

            <CreateInstallmentButton
              courseId={selectedCourseId}
              onSubmit={handleInstallmentSubmit}
              isPlanSaved={isEditPlanSaved}
              setIsPlanSaved={setIsEditPlanSaved}
              handleCancel={handleCancel}
            />
          </div>
        </Form>
      </Drawer>
    </div>
  );
};

const InstallmentTimelineModal = ({ visible, onCancel, installment }) => {
  if (!installment) return null;

  return (
    <Modal
      title={`${installment.planType} Installment Timeline`}
      visible={visible}
      onCancel={onCancel}
      footer={<Button onClick={onCancel}>Close</Button>}
      centered
      className="dark-modal"
    >
      <div className="bg-[#1f1f1f] p-4 rounded-lg">
        <Timeline>
          {installment.installments.map((inst, index) => (
            <Timeline.Item key={index} color="blue">
              <div className="text-white">
                <strong className="text-blue-400">Installment {index + 1}:</strong> ₹
                {Math.floor(inst.amount)}
              </div>
              <div className="text-gray-400 text-xs">Due Date: {inst.dueDate}</div>
            </Timeline.Item>
          ))}
        </Timeline>
      </div>
    </Modal>
  );
};

export default HOC(Plans);
