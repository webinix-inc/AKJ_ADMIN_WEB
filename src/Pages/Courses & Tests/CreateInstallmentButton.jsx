import { Button, Modal, Form, InputNumber, message, Select } from "antd";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

const CreateInstallmentButton = ({
  courseId,
  onSubmit,
  isPlanSaved,
  handleCancel,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [installmentPlans, setInstallmentPlans] = useState([
    { planType: "", numberOfInstallments: 1 },
  ]);
  const dispatch = useDispatch();

  const { subscriptions, loading: subscriptionsLoading } = useSelector(
    (state) => state.subscription
  );
  const filteredSubscription = subscriptions?.find(
    (subscription) => subscription?.course?._id === courseId
  );

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);

  const handleAddPlanField = () => {
    setInstallmentPlans([
      ...installmentPlans,
      { planType: "", numberOfInstallments: 1 },
    ]);
  };

  const handleRemovePlanField = (index) => {
    setInstallmentPlans(installmentPlans.filter((_, i) => i !== index));
  };

  const handleChange = (index, field, value) => {
    const updatedPlans = [...installmentPlans];
    updatedPlans[index][field] = value;
    setInstallmentPlans(updatedPlans);
  };

  const handleFormSubmit = async () => {
    setLoading(true);

    try {
      for (let plan of installmentPlans) {
        const selectedValidity = filteredSubscription?.validities?.find(
          (validity) => `${validity.validity} months` === plan.planType
        );
        const price = selectedValidity?.price || 0;
        const discount = selectedValidity?.discount || 0;

        // console.log("CreateInstallmentButton price", price);
        // console.log("CreateInstallmentButton discont % ", discount);
        const payload = {
          courseId,
          planType: plan.planType,
          numberOfInstallments: plan.numberOfInstallments,
          price,
          discount,
        };

        await onSubmit(payload);
      }

      form.resetFields();
      hideModal();
      handleCancel();
      message.success("All installment plans added successfully!");
    } catch (error) {
      message.error("Failed to set installment plans");
    } finally {
      setLoading(false);
    }
  };

  const selectedPlanTypes = installmentPlans
    .map((plan) => plan.planType)
    .filter(Boolean);

  return (
    <>
      <Button type="primary" onClick={showModal} disabled={!isPlanSaved}>
        Create Installment Plans
      </Button>
      <Modal
        title="Set Custom Installments"
        visible={visible}
        onCancel={hideModal}
        onOk={handleFormSubmit}
        confirmLoading={loading}
      >
        {subscriptionsLoading ? (
          <p>Loading subscriptions...</p>
        ) : filteredSubscription ? (
          <Form form={form} layout="vertical">
            {installmentPlans.map((plan, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "16px",
                  border: "1px solid #f0f0f0",
                  padding: "16px",
                }}
              >
                <Form.Item
                  label={`Plan Type for Plan ${index + 1}`}
                  rules={[
                    { required: true, message: "Please select a plan type" },
                  ]}
                >
                  <Select
                    placeholder="Select Plan Type"
                    value={plan.planType}
                    onChange={(value) => handleChange(index, "planType", value)}
                  >
                    {filteredSubscription?.validities?.map((validity, i) => (
                      <Select.Option
                        key={i}
                        value={`${validity.validity} months`}
                        disabled={selectedPlanTypes.includes(
                          `${validity.validity} months`
                        )}
                      >
                        {`${validity.validity} months, ₹ ${
                          validity.price * (1 - validity.discount / 100)
                        }`}
                        {/* {`${validity.validity} months, ₹ ${
                          validity.price - validity.discount
                        }`} */}
                      </Select.Option>
                    ))}
                    <Select.Option
                      value="custom"
                      disabled={selectedPlanTypes.includes("custom")}
                    >
                      Custom
                    </Select.Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  label={`Number of Installments for Plan ${index + 1}`}
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
                    value={plan.numberOfInstallments}
                    onChange={(value) =>
                      handleChange(index, "numberOfInstallments", value)
                    }
                  />
                </Form.Item>

                <Button
                  type="danger"
                  onClick={() => handleRemovePlanField(index)}
                  style={{ marginTop: "8px" }}
                  disabled={installmentPlans.length === 1}
                >
                  Remove Plan
                </Button>
              </div>
            ))}
            <Button
              type="dashed"
              onClick={handleAddPlanField}
              style={{ width: "100%" }}
            >
              Add Another Installment Plan
            </Button>
          </Form>
        ) : (
          <p>No subscription available for this course.</p>
        )}
      </Modal>
    </>
  );
};

export default CreateInstallmentButton;
