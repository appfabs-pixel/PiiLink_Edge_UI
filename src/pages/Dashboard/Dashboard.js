import React, { useEffect, useState } from "react";
import Title from "../../components/Title";
import Card from "../../components/Card";
import Modal from "../../components/Modal";
import DesktopIcon from "../../assests/images/desktop.svg";
import WifiIcon from "../../assests/images/wife-green.svg";
import NoWifiIcon from "../../assests/images/no-wifi.svg";
import SchedulerIcon from "../../assests/images/scheduler.svg";
import EventIcon from "../../assests/images/events.svg";
import RoutingIcon from "../../assests/images/rerouting.svg";
import {
  getAllDeviceServices,
  getAllDevices,
  getAllDeviceProfiles,
} from "../../services/edgexApi";

import DeviceService from "../MetaData/DeviceService";
import Device from "../MetaData/Device";
import DeviceProfile from "../MetaData/DeviceProfile";
import ProvisionWatcher from "../MetaData/ProvisionWatcher";

const Dashboard = () => {
  const [cardData, setCardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    async function fetchEdgeXData() {
      try {
        
        const [servicesRes, devicesRes, profilesRes] = await Promise.all([
          getAllDeviceServices(), 
          getAllDevices(),        
          getAllDeviceProfiles(), 
        ]);

        const services = servicesRes.data.services || [];
        const devices = devicesRes.data.devices || [];
        const profiles = profilesRes.data.profiles || [];

        setCardData([
          {
            title: "Device Services",
            value: services.length,
            subtitle: "+2 from last week",
            subtitleColor: "green",
            icon: DesktopIcon,
            type: "pillow",
            tab: "deviceService",
          },
          {
            title: "Devices",
            value: devices.length,
            subtitle: "80% Uptime",
            subtitleColor: "green",
            icon: WifiIcon,
            type: "pillow",
            tab: "device",
          },
          {
            title: "Device Profiles",
            value: profiles.length,
            subtitle: "Needs attention",
            subtitleColor: "red",
            icon: NoWifiIcon,
            type: "pillow",
            tab: "deviceProfile",
          },
          {
            title: "Provision Watchers",
            value: 0,
            subtitle: "Check configuration",
            subtitleColor: "gray",
            icon: SchedulerIcon,
            type: "pillow",
            tab: "provisionWatcher",
          },
          {
            title: "Events",
            value: 0,
            subtitle: "+2 from last week",
            subtitleColor: "green",
            icon: EventIcon,
            type: "pillow",
            tab: "events",
          },
          {
            title: "Readings",
            value: 0,
            subtitle: "No reroutings",
            subtitleColor: "gray",
            icon: RoutingIcon,
            type: "text",
            tab: "readings",
          },
        ]);
      } catch (error) {
        console.error("Error fetching EdgeX data:", error);
        setCardData([]);
      } finally {
        setLoading(false);
      }
    }

    fetchEdgeXData();
  }, []);

  const renderContent = () => {
    switch (activeTab) {
      case "deviceService":
        return <DeviceService />;
      case "device":
        return <Device />;
      case "deviceProfile":
        return <DeviceProfile />;
      case "provisionWatcher":
        return <ProvisionWatcher />;
      case "events":
        return <div>Events content</div>;
      case "readings":
        return <div>Readings content</div>;
      default:
        return null;
    }
  };

  return (
    <>
      <Title
        title="Device Management"
        description="Monitor and manage your connected devices"
      />

      {loading ? (
        <p>Loading dashboard data...</p>
      ) : (
        <div className="cards-wrapper">
          {cardData.map((card, index) => (
            <Card
              {...card}
              key={index}
              onClick={() => {
                setActiveTab(card.tab);
                setShowModal(true);
              }}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      )}

      
      {showModal && (
        <Modal
          title={
            cardData.find((c) => c.tab === activeTab)?.title || "Details"
          }
          onClose={() => setShowModal(false)}
        >
          {renderContent()}
        </Modal>
      )}
    </>
  );
};

export default Dashboard;
