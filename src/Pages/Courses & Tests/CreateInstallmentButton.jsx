import { Button, Modal, InputNumber, message } from "antd";
import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import api from "../../api/axios";

// Explicit styles for high visibility in Dark Mode
const darkInputStyle = {
  backgroundColor: "#262626",
  color: "white",
  border: "1px solid #404040",
  width: "100%",
  borderRadius: "6px"
};

const CreateInstallmentButton = ({
  courseId,
  onSubmit,
  isPlanSaved,
  handleCancel,
}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  // We keep a state of "configs" which maps validities to installment counts
  const [validityConfigs, setValidityConfigs] = useState([]);

  const { subscriptions, loading: subscriptionsLoading } = useSelector(
    (state) => state.subscription
  );

  const filteredSubscription = subscriptions?.find(
    (subscription) => subscription?.course?._id === courseId || subscription?.course === courseId
  );

  const initializeConfigs = useCallback(async () => {
    if (!courseId || !filteredSubscription) return;

    try {
      // 1. Fetch existing installments
      const response = await api.get(`/admin/installments/${courseId}`);
      const existingInstallments = response?.data?.data || [];

      // 2. Map Validities to Config Objects
      const configs = filteredSubscription.validities.map((validity) => {
        const planTypeStr = `${validity.validity} months`;

        // Find if we already have an installment plan for this validity
        const existing = existingInstallments.find(
          (ex) => ex.planType?.toLowerCase() === planTypeStr.toLowerCase()
        );

        return {
          validityId: validity._id,
          validityMonths: validity.validity,
          planType: planTypeStr,
          price: validity.price,
          discount: validity.discount,
          // Pre-fill existing count, or default to 1
          numberOfInstallments: existing ? existing.numberOfInstallments : 1,
        };
      });

      setValidityConfigs(configs);

    } catch (error) {
      console.error("Failed to load installments", error);
      message.error("Failed to sync existing installments");
    }
  }, [courseId, filteredSubscription]);

  const showModal = () => {
    setVisible(true);
    initializeConfigs();
  };

  const hideModal = () => setVisible(false);

  // Handle Input Change for a specific row
  const handleConfigChange = (index, value) => {
    const updated = [...validityConfigs];
    updated[index].numberOfInstallments = value;
    setValidityConfigs(updated);
  };

  const handleFormSubmit = async () => {
    setLoading(true);
    try {
      // Loop through configs and submit them
      for (let config of validityConfigs) {
        const price = config.price || 0;
        const discount = config.discount || 0;

        const payload = {
          courseId,
          planType: config.planType,
          validityId: config.validityId,
          numberOfInstallments: config.numberOfInstallments,
          price,
          discount
        };

        await onSubmit(payload);
      }

      hideModal();
      handleCancel();
      message.success("Installment plans updated successfully!");
    } catch (error) {
      console.error(error);
      message.error("Failed to update installment plans");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button type="primary" onClick={showModal} disabled={!isPlanSaved}>
        Create/Edit Installments
      </Button>
      <Modal
        title={<span style={{ color: "white" }}>Configure Installments</span>}
        visible={visible}
        onCancel={hideModal}
        onOk={handleFormSubmit}
        confirmLoading={loading}
        className="dark-modal"
        width={600}
        destroyOnClose
      >
        {subscriptionsLoading ? (
          <p style={{ color: "white" }}>Loading subscription data...</p>
        ) : !filteredSubscription ? (
          <p style={{ color: "white" }}>No subscription found for this course.</p>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {validityConfigs.length === 0 && <p style={{ color: "#888" }}>No validities found.</p>}

            {validityConfigs.map((config, index) => {
              // Calculate Preview Numbers Inside Render
              const basePrice = config.price || 0;
              const discount = config.discount || 0;
              // GST/Handling at Subscription Level
              const gst = filteredSubscription?.gst || 0;
              const handling = filteredSubscription?.internetHandling || 0;

              const discountedPrice = basePrice * (1 - discount / 100);
              // GST and Handling are typically calculated on the discounted price
              const gstAmount = (discountedPrice * gst) / 100;
              const handlingAmount = (discountedPrice * handling) / 100;

              const finalPrice = Math.floor(discountedPrice + gstAmount + handlingAmount);
              const installments = config.numberOfInstallments || 1;
              const perInstallment = Math.ceil(finalPrice / installments);

              return (
                <div key={index} className="mb-4 p-4 rounded-lg border border-gray-700 bg-[#1f1f1f]">
                  {/* Header: Validity Name & Price */}
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="block font-medium text-lg" style={{ color: "white" }}>
                        {config.planType} - <span className="text-green-400">₹{finalPrice}</span>
                      </span>
                      <span className="text-xs text-gray-500">
                        Base: ₹{basePrice} | Disc: {discount}% | GST: {gst}% | Handling: {handling}%
                      </span>
                    </div>
                  </div>

                  {/* Input: Number of Installments */}
                  <div className="flex flex-col gap-2">
                    <label style={{ color: "#aaa", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      Number of Installments
                    </label>
                    <InputNumber
                      min={1}
                      max={24}
                      value={config.numberOfInstallments}
                      onChange={(val) => handleConfigChange(index, val)}
                      style={darkInputStyle}
                      className="dark-input-number-text"
                    />

                    {/* Price Preview Box */}
                    <div className="mt-2 text-sm bg-[#262626] p-2 rounded border border-gray-700">
                      <div className="flex justify-between text-gray-300">
                        <span>Total Payable:</span>
                        <span className="text-green-400 font-bold">₹{finalPrice}</span>
                      </div>
                      <div className="flex justify-between text-gray-300 mt-1">
                        <span>Per Installment ({installments}):</span>
                        <span className="text-blue-400 font-bold">₹{perInstallment}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </>
  );
};

export default CreateInstallmentButton;
