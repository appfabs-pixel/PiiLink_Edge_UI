import React, { useEffect, useState } from "react";
import ListView from "../../components/ListVIew";
import TableView from "../../components/TableView";
import Modal from "../../components/Modal";

import {
  getAllDeviceProfiles,
  addDeviceProfile,
  updateDeviceProfile,
} from "../../services/edgexApi";

import { v4 as uuidv4 } from "uuid";
import yaml from "js-yaml";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DeviceIcon from "../../assests/images/HardDrives.svg";
import TableTopActions from "../../components/TableTopActions";
import "./DeviceProfile.scss";

import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { yaml as yamlLang } from "@codemirror/lang-yaml";
import { oneDark } from "@codemirror/theme-one-dark";

const DeviceProfile = () => {
  const [deviceProfiles, setDeviceProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState(null);
  const [isListView, setIsListView] = useState(true);


const fetchDeviceProfiles = async () => {
  try {
    setLoading(true);
    const response = await getAllDeviceProfiles();
    console.log("Profiles API Response:", response.data);

    const profiles =
      response.data?.profiles ||
      response.data?.data?.profiles ||
      response.data?.response?.profiles ||
      [];

    setDeviceProfiles(
      profiles.map((p, idx) => ({
        id: p.id || idx + 1,
        name: p.name,
        description: p.description || "",
        manufacturer: p.manufacturer || "",
        model: p.model || "",
        labels: Array.isArray(p.labels) ? p.labels.join(", ") : "",
        raw: p,
      }))
    );
  } catch (error) {
    console.error("Fetch Device Profiles Error:", error);
    toast.error("Failed to fetch device profiles");
    setDeviceProfiles([]);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchDeviceProfiles();
  }, []);

  // Selection logic
  const handleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Add/Edit modal open
  const handleAdd = () => {
    setEditingProfile(null);
    setIsModalOpen(true);
  };

  const handleEdit = () => {
    if (selectedIds.length !== 1) {
      toast.warning("Please select one profile to edit.");
      return;
    }
    const profile = deviceProfiles.find((p) => p.id === selectedIds[0]);
    setEditingProfile(profile);
    setIsModalOpen(true);
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    toast.warning("Delete feature is disabled for profiles in this version.");
  };


  const handleSave = async (formData, isUpdate) => {
    try {
      let parsedProfile;
      try {
        parsedProfile = JSON.parse(formData.profileContent);
      } catch (jsonErr) {
        try {
          parsedProfile = yaml.load(formData.profileContent);
        } catch (yamlErr) {
          toast.error("Invalid JSON or YAML format.");
          return;
        }
      }


      const payload = [
        {
          apiVersion: "v3",
          requestId: uuidv4(),
          profile: parsedProfile,
        },
      ];

      if (isUpdate) {
    
        await updateDeviceProfile(payload);
        toast.success("Device profile updated successfully!");
      } else {
        
        await addDeviceProfile(payload);
        toast.success("Device profile added successfully!");
      }

      await fetchDeviceProfiles();
      setIsModalOpen(false);
      setEditingProfile(null);
      setSelectedIds([]);
    } catch (error) {
      console.error("Save Error:", error);
      toast.error("Failed to save device profile.");
    }
  };
 



  const listData = deviceProfiles.map((p) => ({
    id: p.id,
    name: p.name,
    type: p.model,
    crontab: p.manufacturer,
    labels: p.labels,
    description: p.description,
  }));

 
  const TABLE_HEAD = [
    "ID",
    "Profile Name",
    "Description",
    "Manufacturer",
    "Model",
    "Labels",
  ];
  const tableData = deviceProfiles.map((p) => ({
    ID: p.id,
    "Profile Name": p.name,
    Description: p.description,
    Manufacturer: p.manufacturer,
    Model: p.model,
    Labels: p.labels,
  }));

  return (
    <div>
      <div className="device-summary-actions">
      
        <div className="device-left-summary">
          <button type="button" className="no-btn btn-without-border" onClick={handleAdd}>
            <span>Add</span>
          </button>
          <button
            type="button"
            className="no-btn btn-without-border"
            onClick={handleEdit}
            disabled={selectedIds.length !== 1}
          >
            <span>Edit</span>
          </button>
          <button
            type="button"
            className="no-btn btn-without-border"
            onClick={handleDelete}
            disabled={selectedIds.length === 0}
          >
            <span>Delete</span>
          </button>
        </div>

        <div className="device-more-actions">
          <TableTopActions
            isListView={isListView}
            handleView={(isList) => setIsListView(isList)}
          />
        </div>
      </div>

      <div className="device-summary-body">
    
        {loading ? (
          <p>Loading...</p>
        ) : deviceProfiles.length === 0 ? (
          <p>No device profiles found.</p>
        ) : isListView ? (
          <ListView
            data={listData}
            icon={DeviceIcon}
            viewType="deviceProfile"
            selectedIds={selectedIds}
            onRowClick={handleSelect}
            showStatus={false}
          />
        ) : (
          <TableView
            th={TABLE_HEAD}
            data={tableData}
            showCommand={false}
            selectedIds={selectedIds}
            onRowClick={handleSelect}
          />
        )}
      </div>

      {isModalOpen && (
        <Modal
          title={editingProfile ? "Edit Device Profile" : "Add Device Profile"}
          onClose={() => {
            setIsModalOpen(false);
            setEditingProfile(null);
          }}
        >
          <ProfileForm
            profile={editingProfile}
            onCancel={() => {
              setIsModalOpen(false);
              setEditingProfile(null);
            }}
            onSave={(data) => handleSave(data, !!editingProfile)}
          />
        </Modal>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};


function ProfileForm({ profile, onCancel, onSave }) {
  const [profileContent, setProfileContent] = useState("");

  useEffect(() => {
    if (profile) {
     
      setProfileContent(JSON.stringify(profile.raw, null, 2));
    } else {
      setProfileContent("");
    }
  }, [profile]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ profileContent }, !!profile);
  };

  return (
    <form onSubmit={handleSubmit}>
      <label className="label">Device Profile (JSON or YAML)</label>

      <CodeMirror
        value={profileContent}
        height="400px"
        extensions={[json(), yamlLang()]}
        theme={oneDark}
        onChange={(value) => setProfileContent(value)}
      />

      <div className="form-actions" style={{ marginTop: "20px" }}>
        <button type="submit" className="btn-secondary">
          {profile ? "Update" : "Add"}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default DeviceProfile;