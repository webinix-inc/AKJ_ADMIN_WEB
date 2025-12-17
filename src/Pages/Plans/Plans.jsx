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
} from "antd";
import { HiPlus } from "react-icons/hi";
import { IoClose } from "react-icons/io5";
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
import CreateInstallmentForm from "../Courses & Tests/CreateInstallmentForm";

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
  const [isInstallmentModalVisible, setInstallmentModalVisible] =
    useState(false);
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
  };

  const showEditModal = (subscription) => {
    setCurrentSubscription(subscription);
    setSelectedCourseId(subscription?.course?._id);
    form.setFieldsValue({
      ...subscription, // This spreads other values which may be needed
      course: subscription?.course?._id,
    }); // Ensure this matches the value field of Select.Option}); // Pre-fill form for editing
    setValidities(
      subscription.validities || [
        { validity: null, price: null, discount: null },
      ]
    );
    setFeatures(
      subscription.features || [{ name: "", enabled: true, description: "" }]
    );
    console.log(selectedCourseId);
    setIsEditModalVisible(true);
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
      // Save the plan without causing a component-wide re-render
      await dispatch(createSubscription(subscriptionData)).unwrap();

      notification.success({
        message: "Success",
        description: "Subscription plan added successfully",
      });

      // Set the plan as saved to enable further actions like installment creation
      setIsPlanSaved(true);

      // Do NOT reset or refetch data here unless necessary
      // Keep modal open and allow user to create installments
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
      setIsEditPlanSaved(true); // Set the plan as saved
      setIsEditingAllowed(false);
      // handleCancel();
    } catch (error) {
      notification.error({
        message: "Error",
        description: error.message || "Failed to update subscription plan",
      });
      setIsEditPlanSaved(false); // Reset the save state on error
      setIsEditingAllowed(true);
    }
  };

  const handleInstallmentSubmit = useCallback(async (installmentData) => {
    try {
      // Make the API call to create the installment plan
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
      console.log(error.response.data.message);
      message.error(
        error.response.data.message || "Error setting installment plan"
      );
    }
  }, []);

  const handleDeletePlan = (id) => {
    Modal.confirm({
      title: "Are you sure you want to delete this plan?",
      icon: <IoClose className="text-red-500" size={24} />,
      content: "This action cannot be undone.",
      okText: "Yes, Delete",
      okType: "danger",
      cancelText: "No, Cancel",
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
      onCancel() {
        console.log("Delete action cancelled");
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
    ]); // Add a new validity object
  };

  const removeValidityField = (index) => {
    const newValidities = validities.filter((_, i) => i !== index);
    setValidities(newValidities);
  };

  const handleFeatureChange = (index, field, value) => {
    const newFeatures = [...features];
    newFeatures[index][field] = value; // Update specific field in feature object
    setFeatures(newFeatures);
  };

  const addFeatureField = () => {
    setFeatures([...features, { name: "", enabled: true, description: "" }]); // Add a new feature object
  };

  const removeFeatureField = (index) => {
    const newFeatures = features.filter((_, i) => i !== index);
    setFeatures(newFeatures);
  };
  const handleGetInstallments = async (courseId) => {
    console.log("here is the couseID we got :", courseId);
    setLoadingInstallments(true);
    try {
      const response = await api.get(`/admin/installments/${courseId}`);
      console.log(
        "here is the data response we get for installments :",
        response
      );
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
    await handleGetInstallments(plan.course._id); // Fetch installments for the selected plan's course ID
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

  if (loadingSubscriptions || loadingCourses) return <Spin />;

  console.log("here are the subscriptions :", subscriptions);

  return (
    <div className="plans-container p-6 text-white">
      <div className="flex justify-between mb-4">
        <h2 className="text-xl font-semibold">Subscription Plans</h2>
        <Button
          type="primary"
          icon={<HiPlus size={20} />}
          onClick={showAddModal}
          className="bg-blue-500"
        >
          Add Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subscriptions?.map((plan) => (
          <div
            key={plan._id}
            className="p-6 border rounded-lg shadow-md bg-white text-black relative flex flex-col justify-between"
            onClick={() => showEditModal(plan)}
            style={{ minHeight: "250px" }} // Optional: Set a minimum height for cards to standardize height
          >
            {/* View Plan Button at Top Right */}
            <Button
              type="link"
              className="absolute top-2 right-2 text-blue-500"
              onClick={(e) => {
                if (e && typeof e.stopPropagation === 'function') {
                  e.stopPropagation();
                }
                showViewPlanModal(plan);
              }}
            >
              View Plan
            </Button>
            {/* Card Content */}
            <div>
              {/* Heading Section */}
              <h2 className="text-lg font-bold text-black-900 text-center mb-2">
                {plan.name}
              </h2>
              <h3 className="text-lg font-bold text-blue-800 text-center mb-2">
                {plan.course?.title}
              </h3>

              {/* Validities Section */}
              <div className="text-center text-brown-600 font-semibold mb-4">
                Plans: {plan.validities.map((v) => `${v.validity}`).join(" / ")}{" "}
                Months
              </div>

              {/* Features Section */}
              <div className="mt-4">
                <ul className="list-disc pl-5">
                  {plan.features?.map((feature, featureIndex) => (
                    <li
                      key={featureIndex}
                      className="text-black font-medium mb-2"
                    >
                      {feature.name}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Buttons Section at the Bottom */}
            <div className="flex justify-between items-center mt-4 pt-4 w-full">
              <Button
                type="primary"
                onClick={(e) => {
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                  showEditModal(plan);
                }}
              >
                Edit Plan
              </Button>
              <Button
                danger
                onClick={(e) => {
                  if (e && typeof e.stopPropagation === 'function') {
                    e.stopPropagation();
                  }
                  handleDeletePlan(plan._id);
                }}
              >
                Delete Plan
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* View Plan Modal */}
      <Drawer
        title="Plan Details"
        visible={isViewModalVisible}
        // onCancel={closeViewPlanModal}
        onClose={closeViewPlanModal}
        footer={[
          <Button key="close" onClick={closeViewPlanModal}>
            Close
          </Button>,
        ]}
      >
        {selectedPlan && (
          <>
            <h3 className="text-lg font-bold mb-2">
              Plan Name: {selectedPlan.name}
            </h3>
            <p>
              <strong>Course:</strong> {selectedPlan.course.title}
            </p>
            <p>
              <strong>Validities:</strong>
            </p>
            <ul className="list-disc pl-5">
              {selectedPlan.validities.map((validity, index) => (
                <li key={index}>
                  {validity.validity} months - ₹
                  <span>
                    {/* {validity.price - validity.discount}{" "} */}
                    {validity.price * (1 - validity.discount / 100)}{" "}
                    <span className="line-through">₹{validity.price}</span>
                  </span>
                </li>
              ))}
            </ul>
            <p>
              <strong>Features:</strong>
            </p>
            <ul className="list-disc pl-5">
              {selectedPlan.features.map((feature, index) => (
                <li key={index}>{feature.name}</li>
              ))}
            </ul>
            <p>
              <strong>GST (%):</strong> {selectedPlan.gst}%
            </p>
            <p>
              <strong>Internet Handling Charges (%):</strong>{" "}
              {selectedPlan.internetHandling}%
            </p>
            {/* Installments Section */}
            <p>
              <strong>Installments:</strong>
            </p>
            {loadingInstallments ? (
              <Spin />
            ) : installments.length > 0 ? (
              <ul className="list-disc pl-5">
                {installments.map((installment, index) => (
                  <li key={index}>
                    {installment.planType}: {installment.numberOfInstallments}{" "}
                    installments - ₹{Math.floor(installment.totalAmount)}
                    <Button
                      type="link"
                      onClick={() => showInstallmentTimeline(installment)}
                    >
                      View Installment
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No installments available for this plan.</p>
            )}
          </>
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
        title="Add New Plan"
        visible={isAddModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form form={form} layout="vertical" onFinish={handleSavePlan}>
          {/* Course Selection */}
          <Form.Item
            label="Course"
            name="course"
            rules={[{ required: true, message: "Please select a course!" }]}
          >
            <Select
              onChange={(value) => setSelectedCourseId(value)}
              placeholder="Select a course"
              disabled={isPlanSaved} // Disable field if plan is saved
            >
              {courses?.map((course) => (
                <Select.Option key={course._id} value={course._id}>
                  {course.title}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Plan Name */}
          <Form.Item
            label="Plan Name"
            name="name"
            rules={[{ required: true, message: "Please input the plan name!" }]}
          >
            <Input type="text" disabled={isPlanSaved} />
          </Form.Item>

          {/* Dynamic Validities */}
          <Form.Item label="Validities">
            {validities.map((validity, index) => (
              <div key={index} className="flex mb-2">
                <InputNumber
                  value={validity.validity}
                  min={1}
                  max={99}
                  placeholder="Validity (months)"
                  style={{ marginLeft: 8, width: 200 }}
                  disabled={isPlanSaved} // Disable input if plan is saved
                  formatter={(value) => {
                    const num = Number(value);
                    if (isNaN(num)) return "";
                    return Math.min(Math.max(num, 1), 99).toString();
                  }}
                  parser={(value) => {
                    const num = Number(value);
                    if (isNaN(num)) return 1; // default to min value
                    return Math.min(Math.max(num, 1), 99);
                  }}
                  onChange={(value) =>
                    handleValidityChange(index, "validity", value)
                  }
                />

                <InputNumber
                  value={validity.price}
                  type="number"
                  onChange={(value) =>
                    handleValidityChange(index, "price", value)
                  }
                  placeholder="₹ Marked Price"
                  style={{ marginLeft: 8, width: 200 }}
                  disabled={isPlanSaved} // Disable input if plan is saved
                />
                <InputNumber
                  value={validity.discount}
                  min={0}
                  max={100}
                  placeholder="% Discount"
                  style={{ marginLeft: 8, width: 200 }}
                  disabled={isPlanSaved}
                  formatter={(value) => {
                    // remove anything except numbers
                    const num = Number(value);
                    if (isNaN(num)) return "";
                    return Math.min(Math.max(num, 0), 100).toString();
                  }}
                  parser={(value) => {
                    const num = Number(value);
                    if (isNaN(num)) return 0;
                    return Math.min(Math.max(num, 0), 100);
                  }}
                  onChange={(value) => {
                    handleValidityChange(index, "discount", value);
                  }}
                />

                <Button
                  type="danger"
                  onClick={() => removeValidityField(index)}
                  style={{ marginLeft: 8 }}
                  disabled={isPlanSaved} // Disable button if plan is saved
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addValidityField}
              disabled={isPlanSaved} // Disable button if plan is saved
            >
              Add Validity
            </Button>
          </Form.Item>

          {/* Dynamic Features */}
          <Form.Item label="Features">
            {features.map((feature, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  value={feature.name}
                  type="text"
                  onChange={(e) =>
                    handleFeatureChange(index, "name", e.target.value)
                  }
                  placeholder="Feature Name"
                  style={{ flex: 1 }}
                  disabled={isPlanSaved} // Disable input if plan is saved
                />
                <Switch
                  checked={feature.enabled}
                  onChange={(checked) =>
                    handleFeatureChange(index, "enabled", checked)
                  }
                  style={{ marginLeft: 8 }}
                  disabled={isPlanSaved} // Disable switch if plan is saved
                />
                <Button
                  type="danger"
                  onClick={() => removeFeatureField(index)}
                  style={{ marginLeft: 8 }}
                  disabled={isPlanSaved} // Disable button if plan is saved
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addFeatureField}
              disabled={isPlanSaved} // Disable button if plan is saved
            >
              Add Feature
            </Button>
          </Form.Item>

          {/* GST Percentage */}
          <Form.Item
            label="GST (%)"
            name="gst"
            rules={[
              { required: true, message: "Please enter GST percentage!" },
            ]}
          >
            <Select
              placeholder="Select GST (%)"
              disabled={isPlanSaved}
              allowClear
            >
              {GST_OPTIONS.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}%
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Internet Handling Charges Percentage */}
          <Form.Item
            label="Internet Handling Charges (%)"
            name="internetHandling"
            rules={[
              {
                required: true,
                message: "Please enter Internet Handling Charges percentage!",
              },
            ]}
          >
            <Select
              placeholder="Select Internet Handling (%)"
              disabled={isPlanSaved}
              allowClear
            >
              {INTERNET_HANDLING_OPTIONS.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}%
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Save Button */}
          {/* <Form.Item className="flex justify-end">
            <Button type="primary" htmlType="submit" disabled={isPlanSaved}>
              Save Plan
            </Button>
          </Form.Item>

          <Form.Item>
            <CreateInstallmentButton
              courseId={selectedCourseId}
              onSubmit={handleInstallmentSubmit}
              isPlanSaved={isPlanSaved}
              setIsPlanSaved={setIsPlanSaved}
              handleCancel={handleCancel}
            />
          </Form.Item> */}
          <div className="flex gap-4 justify-start">
            <Form.Item className="mb-0">
              <Button type="primary" htmlType="submit" disabled={isPlanSaved}>
                Save Plan
              </Button>
            </Form.Item>

            <Form.Item className="mb-0">
              <CreateInstallmentButton
                courseId={selectedCourseId}
                onSubmit={handleInstallmentSubmit}
                isPlanSaved={isPlanSaved}
                setIsPlanSaved={setIsPlanSaved}
                handleCancel={handleCancel}
              />
            </Form.Item>
          </div>
        </Form>
      </Modal>

      {/* Edit Subscription Modal */}
      <Drawer
        title="Edit Plan"
        visible={isEditModalVisible}
        // onCancel={() => {
        //   handleCancel();
        //   setIsEditPlanSaved(false); // Reset save state when modal is closed
        //   setIsEditingAllowed(false); // Re-enable editing when modal is closed
        // }}
        onClose={() => {
          handleCancel();
          setIsEditPlanSaved(false); // Reset save state when modal is closed
          setIsEditingAllowed(false); // Re-enable editing when modal is closed
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEditPlan}>
          <Form.Item
            label="Course"
            name="course"
            rules={[{ required: true, message: "Please select a course!" }]}
            disabled={!isEditingAllowed}
          >
            <Select
              placeholder="Select a course"
              onChange={(value) => setSelectedCourseId(value)}
              value={selectedCourseId}
              disabled={!isEditingAllowed}
            >
              {courses?.map((course) => (
                <Select.Option
                  onclick={() => setSelectedCourseId(course._id)}
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

          {/* Dynamic Validities */}
          <Form.Item label="Validities">
            {validities.map((validity, index) => (
              <div key={index} className="flex mb-2">
                {/* <Input
                  value={validity.validityType}
                  onChange={(e) =>
                    handleValidityChange(index, "validityType", e.target.value)
                  }
                  placeholder="Validity Type"
                  style={{ flex: 1 }}
                /> */}
                <InputNumber
                  value={validity.validity}
                  min={1}
                  max={99}
                  placeholder="Validity (months)"
                  style={{ marginLeft: 8, width: 200 }}
                  disabled={!isEditingAllowed}
                  formatter={(value) => {
                    const num = Number(value);
                    if (isNaN(num)) return "";
                    return Math.min(Math.max(num, 1), 99).toString();
                  }}
                  parser={(value) => {
                    const num = Number(value);
                    if (isNaN(num)) return 1; // default to min value
                    return Math.min(Math.max(num, 1), 99);
                  }}
                  onChange={(value) =>
                    handleValidityChange(index, "validity", value)
                  }
                />
                <InputNumber
                  value={validity.price}
                  onChange={(value) =>
                    handleValidityChange(index, "price", value)
                  }
                  placeholder="₹ Price"
                  style={{ marginLeft: 8 }}
                  disabled={!isEditingAllowed}
                />
                <InputNumber
                  value={validity.discount}
                  onChange={(value) =>
                    handleValidityChange(index, "discount", value)
                  }
                  placeholder="Discount (%)"
                  style={{ marginLeft: 8 }}
                  disabled={!isEditingAllowed}
                />
                <Button
                  type="danger"
                  onClick={() => removeValidityField(index)}
                  style={{ marginLeft: 8 }}
                  disabled={isEditPlanSaved}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addValidityField}
              disabled={isEditPlanSaved}
            >
              Add Validity
            </Button>
          </Form.Item>

          {/* Dynamic Features */}
          <Form.Item label="Features">
            {features.map((feature, index) => (
              <div key={index} className="flex mb-2">
                <Input
                  value={feature.name}
                  onChange={(e) =>
                    handleFeatureChange(index, "name", e.target.value)
                  }
                  placeholder="Feature Name"
                  style={{ flex: 1 }}
                  disabled={!isEditingAllowed}
                />
                <Switch
                  checked={feature.enabled}
                  onChange={(checked) =>
                    handleFeatureChange(index, "enabled", checked)
                  }
                  style={{ marginLeft: 8 }}
                  disabled={!isEditingAllowed}
                />
                <Button
                  type="danger"
                  onClick={() => removeFeatureField(index)}
                  style={{ marginLeft: 8 }}
                  disabled={isEditPlanSaved}
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addFeatureField}
              disabled={isEditPlanSaved}
            >
              Add Feature
            </Button>
          </Form.Item>

          {/* GST Percentage */}
          <Form.Item
            label="GST (%)"
            name="gst"
            rules={[{ required: true, message: "Please select GST percentage!" }]}
          >
            <Select
              placeholder="Select GST (%)"
              disabled={!isEditingAllowed}
              allowClear
            >
              {GST_OPTIONS.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}%
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Internet Handling Charges Percentage */}
          <Form.Item
            label="Internet Handling Charges (%)"
            name="internetHandling"
            rules={[
              {
                required: true,
                message: "Please select Internet Handling Charges percentage!",
              },
            ]}
          >
            <Select
              placeholder="Select Internet Handling (%)"
              disabled={!isEditingAllowed}
              allowClear
            >
              {INTERNET_HANDLING_OPTIONS.map((option) => (
                <Select.Option key={option} value={option}>
                  {option}%
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Button to enable re-editing */}
          {/* <Button
            type="primary"
            onClick={() => setIsEditingAllowed(true)}
            disabled={isEditPlanSaved && !isEditingAllowed}
          >
            Edit Again
          </Button> */}

          {/* Save and Create Installment Button */}
          {/* <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="w-full"
              disabled={isEditPlanSaved}
            >
              Update Plan
            </Button>
          </Form.Item> */}

          {/* Buttons side by side */}
          <Form.Item>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "10px",
              }}
            >
              <Button
                type="default"
                onClick={() => setIsEditingAllowed(true)}
                disabled={isEditPlanSaved && !isEditingAllowed}
                style={{ flex: 1 }}
              >
                Edit Again
              </Button>

              <Button
                type="primary"
                htmlType="submit"
                disabled={isEditPlanSaved}
                style={{ flex: 1 }}
              >
                Update Plan
              </Button>
            </div>
          </Form.Item>

          <Form.Item>
            <CreateInstallmentButton
              courseId={selectedCourseId}
              onSubmit={handleInstallmentSubmit}
              isPlanSaved={isEditPlanSaved}
              setIsPlanSaved={setIsEditPlanSaved}
              handleCancel={handleCancel}
            />
          </Form.Item>
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
    >
      <Card>
        <Timeline>
          {installment.installments.map((inst, index) => (
            <Timeline.Item key={index} color="blue">
              <div>
                <strong>Installment {index + 1}:</strong> ₹
                {Math.floor(inst.amount)}
              </div>
              <div>Due Date: {inst.dueDate}</div>
            </Timeline.Item>
          ))}
        </Timeline>
      </Card>
    </Modal>
  );
};

export default HOC(Plans);
