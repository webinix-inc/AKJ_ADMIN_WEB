import { Form, InputNumber, message, Select } from "antd";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { getAllSubscriptions } from "../../redux/slices/subscriptionSlice"; // Adjust the path accordingly

const CreateInstallmentForm = ({ courseId, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Fetch subscriptions for this specific course on mount
  useEffect(() => {
    if (courseId) {
      dispatch(getAllSubscriptions(courseId));
    }
  }, [dispatch, courseId]);

  // Redux state to get subscriptions
  const { subscriptions, loading: subscriptionsLoading } = useSelector(
    (state) => state.subscription
  );

  // Since API now filters by courseId, the first result (or specifically matching one) is what we need.
  // Ideally, 'subscriptions' array will only contain relevant subscriptions.
  // We can still do a safe find just in case, or if multiple plans exist for the course.
  const filteredSubscription = subscriptions?.find(
    (subscription) => subscription?.course?._id === courseId || subscription?.course === courseId
  );

  console.log("filteredSubcriptions", filteredSubscription);



  const handleFormSubmit = async (values) => {
    setLoading(true);

    // Find the selected validity to get the associated discount
    const selectedValidity = filteredSubscription?.validities?.find(
      (validity) => `${validity.validity} months` === values.planType
    );

    const price = selectedValidity?.price || 0; // Default to 0 if no discount is found
    try {
      const payload = {
        courseId, // Get courseId from props
        planType: values.planType,
        validityId: selectedValidity?._id, // 🔥 UPDATED: Send ID if available
        numberOfInstallments: values.numberOfInstallments,
        price,
      };

      await onSubmit(payload); // Call the API or Redux action to submit the form
      form.resetFields();
    } catch (error) {
      message.error("Failed to set installment plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {subscriptionsLoading ? (
        <p>Loading subscriptions...</p>
      ) : filteredSubscription ? (
        <Form form={form} onFinish={handleFormSubmit}>
          <Form.Item
            label={<span className="font-medium" style={{ color: "white" }}>Plan Type</span>}
            name="planType"
            rules={[{ required: true, message: "Please select a plan type" }]}
          >
            <Select
              placeholder="Select Plan Type"
              className="dark-select w-full"
              dropdownClassName="dark-select-dropdown"
              suffixIcon={<span className="text-gray-500">▼</span>}
              style={{ backgroundColor: "transparent", color: "white" }}
            >
              {filteredSubscription?.validities?.map((validity, index) => (
                <Select.Option
                  key={index}
                  value={`${validity.validity} months`}
                >
                  <div className="flex justify-between w-full">
                    <span style={{ color: "white" }}>{validity.validity} Months</span>
                    <span className="text-green-400">₹{validity.price}</span>
                  </div>
                </Select.Option>
              ))}
              <Select.Option value="custom"><span style={{ color: "white" }}>Custom</span></Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={<span className="font-medium" style={{ color: "white" }}>Number of Installments</span>}
            name="numberOfInstallments"
            rules={[
              {
                required: true,
                message: "Please enter the number of installments",
              },
            ]}
          >
            <InputNumber
              min={1}
              placeholder="Enter number of installments"
              className="dark-input w-full"
              style={{
                width: "100%",
                backgroundColor: "#262626",
                color: "white",
                borderColor: "#404040"
              }}
            />
          </Form.Item>
        </Form>
      ) : (
        <p>No subscription available for this course.</p>
      )}
    </>
  );
};

export default CreateInstallmentForm;
