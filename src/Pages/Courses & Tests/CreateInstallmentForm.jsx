import { Form, InputNumber, message, Select } from "antd";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux"; // Import Redux hooks
import { getAllSubscriptions } from "../../redux/slices/subscriptionSlice"; // Adjust the path accordingly

const CreateInstallmentForm = ({ courseId, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const dispatch = useDispatch();

  // Redux state to get subscriptions
  const { subscriptions, loading: subscriptionsLoading } = useSelector(
    (state) => state.subscription
  );

  // Filter the subscription for the specific courseId
  const filteredSubscription = subscriptions?.find(
    (subscription) => subscription?.course._id === courseId
  );


  console.log("filteredSubcriptions" , filteredSubscription);

 

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
            label="Plan Type"
            name="planType"
            rules={[{ required: true, message: "Please select a plan type" }]}
          >
            <Select placeholder="Select Plan Type">
              {filteredSubscription?.validities?.map((validity, index) => (
                <Select.Option
                  key={index}
                  value={`${validity.validity} months`}
                >
                  {`${validity.validity} months, ₹ ${validity.price}`}
                </Select.Option>
              ))}
              <Select.Option value="custom">Custom</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Number of Installments"
            name="numberOfInstallments"
            rules={[
              {
                required: true,
                message: "Please enter the number of installments",
              },
            ]}
          >
            <InputNumber min={1} placeholder="Enter number of installments" />
          </Form.Item>
        </Form>
      ) : (
        <p>No subscription available for this course.</p>
      )}
    </>
  );
};

export default CreateInstallmentForm;
