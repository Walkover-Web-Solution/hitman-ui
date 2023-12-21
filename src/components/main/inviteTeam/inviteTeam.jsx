import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import axios from "axios";
import "./inviteTeam.scss";
import {
  getCurrentOrg,
  getProxyToken,
} from "../../auth/authServiceV2";
import { toast } from "react-toastify";
import GenericModal from "../GenericModal";
import { inviteMembers } from "../../../services/orgApiService";

function InviteTeam() {
  const [users, setUsers] = useState([]);
  const [email, setEmail] = useState("");
  const [name,setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const history = useHistory();
  const inputRef = useRef(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        "https://routes.msg91.com/api/c/getUsers?itemsPerPage=100",
        {
          headers: { proxy_auth_token: getProxyToken() },
        }
      );
      setUsers(response?.data?.data?.data);
    } catch (error) {
      toast.error("Error fetching users: " + error.message);
    }
  };

  useEffect(() => {
    if (showModal) {
      inputRef.current.focus();
    }
  }, [showModal]);

  const handleBack = () => {
    const orgId = getCurrentOrg()?.id;
    history.push(`/orgs/${orgId}/dashboard/endpoint/new`);
  };

  const handleInviteClick = () => setShowModal(true);
  const handleCloseModal = () => setShowModal(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendInvite(e);
    }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    try {
      setLoading(true);
      await inviteMembers(name, email);
      setUsers((prevUsers) => [{ name, email }, ...prevUsers]);
      setName("");
      setEmail("");
      handleCloseModal();
    } catch (error) {
      toast.error("Cannot proceed at the moment. Please try again later");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className={"navbar"}>
        <button className={"backButton"} onClick={handleBack}>
          Dashboard
        </button>
        <h1 className={"title"}>Manage Team</h1>
      </nav>
      <div className={"container"}>
        <button className={"inviteButton"} onClick={handleInviteClick}>
          + Invite Members
        </button>
        <GenericModal
          name ={name}
          email={email}
          validateEmail={validateEmail}
          handleKeyPress={handleKeyPress}
          inputRef={inputRef}
          setEmail={setEmail}
          setName={setName}
          handleSendInvite={handleSendInvite}
          handleCloseModal={handleCloseModal}
          showModal={showModal}
          onHide={handleCloseModal}
          title="Invite Members"
          showInputGroup={true}
          loading={loading}
        />
        <table className={"table"}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.email}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{"Admin"}</td>
                <td>
                  <button
                    className={"editButton"}
                    onClick={() => {
                      /* logic to edit user */
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default InviteTeam;
