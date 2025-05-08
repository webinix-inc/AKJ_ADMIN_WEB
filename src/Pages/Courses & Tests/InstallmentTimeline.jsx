import { Timeline, Card, Tag } from 'antd';

const InstallmentTimeline = ({ installments }) => {
  
  // Group installments by planType
  const groupByPlanType = (installments) => {
    return installments.reduce((groups, installment) => {
      const planType = installment.planType || 'Other'; // Default to 'Other' if no planType
      if (!groups[planType]) {
        groups[planType] = [];
      }
      groups[planType].push(installment.installments);
      return groups;
    }, {});
  };

  const groupedInstallments = groupByPlanType(installments);
  console.log(groupedInstallments);

  return (
    <div style={{ marginTop: 20 }} className='w-full flex flex-wrap gap-[1vw]'>
      {Object.keys(groupedInstallments).map((planType) => (
        <Card key={planType} title={`${planType} Plan`} style={{ marginBottom: '20px' }} className='w-[30%] max-h-fit'>
          <Timeline>
            {groupedInstallments[planType][0]?.map((installment, index) => (
              <Timeline.Item
                key={index}
                color={ 'green'}
              >
                <div>
                  <strong>Installment {index + 1}:</strong> ₹
                  {Math.floor(installment.amount)}
                </div>
                <div>
                  Due Date: {installment.dueDate}
                </div>
                {/* <Tag color={installment.isPaid ? 'green' : 'volcano'}>
                  {installment.isPaid ? 'Paid' : 'Unpaid'}
                </Tag> */}
              </Timeline.Item>
            ))}
          </Timeline>
        </Card>
      ))}
    </div>
  );
};

export default InstallmentTimeline;
