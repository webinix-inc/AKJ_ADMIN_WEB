import React from 'react';
import { Row, Col } from 'antd';
import { Link } from 'react-router-dom';
import {
  CreditCardOutlined,
  PictureOutlined,
  MessageOutlined,
  BellOutlined,
  MailOutlined,
  LockOutlined,
  VideoCameraOutlined,
  LinkOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import HOC from '../../Component/HOC/HOC';
import './SelfService.css'; // Import the new CSS

const menuItems = [
  { to: "/selfservice/manage-coupons", icon: <CreditCardOutlined />, title: "Manage Coupons", desc: "Create & edit discount codes" },
  { to: "/selfservice/managebanners", icon: <PictureOutlined />, title: "Manage Banners", desc: "Update homepage banners" },
  { to: "/selfservice/clientTestimonial", icon: <MessageOutlined />, title: "Client Testimonials", desc: "Manage user feedback" },
  { to: "/notification", icon: <BellOutlined />, title: "Notifications", desc: "Send push notifications" },
  { to: "/enquries", icon: <MailOutlined />, title: "Enquiries", desc: "View student enquiries" },
  { to: "/achiever", icon: <TrophyOutlined />, title: "Add Achiever", desc: "Showcase top students" },
  { to: "/marketing-video", icon: <VideoCameraOutlined />, title: "Home Video", desc: "Manage intro video" },
  { to: "/important-link", icon: <LinkOutlined />, title: "Important Links", desc: "Helper links for students" },
  { to: "/selfservice/course-access", icon: <LockOutlined />, title: "Manage Course Access", desc: "Grant/Revoke access" },
];

const SelfService = () => (
  <div className="self-service-container">
    <div className="page-header">
      <div>
        <h1 className="page-title">Self Service Dashboard</h1>
        <p className="page-subtitle">Manage your application content, marketing, and user interactions.</p>
      </div>
    </div>

    <Row gutter={[24, 24]}>
      {menuItems.map(({ to, icon, title, desc }) => (
        <Col key={to} xs={24} sm={12} lg={8} xl={6}>
          <Link to={to} style={{ textDecoration: 'none' }}>
            <div className="glass-card hover:border-blue-500/50 group h-full flex flex-col items-center text-center justify-center p-6">
              <div className="text-4xl mb-4 text-blue-400 group-hover:text-blue-300 transition-colors bg-blue-500/10 p-4 rounded-full">
                {icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm">{desc}</p>
            </div>
          </Link>
        </Col>
      ))}
    </Row>
  </div>
);

export default HOC(SelfService);
