import React from 'react';
import { Row, Col, Card } from 'antd';
import { Link } from 'react-router-dom';
import {
  CreditCardOutlined,
  PictureOutlined,
  MessageOutlined,
  BellOutlined,
  MailOutlined,
  LockOutlined,
} from '@ant-design/icons';
import HOC from '../../Component/HOC/HOC';

const menuItems = [
  { to: "/selfservice/manage-coupons", icon: <CreditCardOutlined />, title: "Manage Coupons" },
  { to: "/selfservice/managebanners", icon: <PictureOutlined />, title: "Manage Banners" },
  { to: "/selfservice/clientTestimonial", icon: <MessageOutlined />, title: "Client Testimonial" },
  { to: "/notification", icon: <BellOutlined />, title: "Notification" },
  { to: "/enquries", icon: <MailOutlined />, title: "Enquiries" },
  { to: "/achiever", icon: <MailOutlined />, title: "Add Achiever" },
  { to: "/marketing-video", icon: <MailOutlined />, title: "Home Video" },
  { to: "/important-link", icon: <MailOutlined />, title: "Important Link" },
  { to: "/selfservice/course-access", icon: <LockOutlined />, title: "Manage Course Access" }, // ✅ New Course Access Card
];

const SelfService = () => (
  <div className="selfservice min-h-screen py-8">
    <Row gutter={[16, 16]} justify="center">
      {menuItems.map(({ to, icon, title }) => (
        <Col key={to} xs={24} sm={12} lg={8} xl={6}>
          <Link to={to} style={{ textDecoration: 'none' }}>
            <Card hoverable>
              <div className="text-3xl mb-4">{icon}</div>
              <Card.Meta title={title} />
            </Card>
          </Link>
        </Col>
      ))}
    </Row>
  </div>
);

export default HOC(SelfService);
