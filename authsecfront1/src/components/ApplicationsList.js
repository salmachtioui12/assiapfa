import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import api from '../components/api';

const ApplicationsList = () => {
  const { offerId } = useParams();
  const [applications, setApplications] = useState([]);
  const token = localStorage.getItem("accessToken");
  const sanitize = (str) => str.replace(/[^a-zA-Z0-9]/g, "_");


  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/applications/${offerId}`);
      setApplications(res.data);
    } catch (err) {
      console.error("Erreur récupération candidatures :", err);
    }
  };


  const handleViewCv = async (filename) => {
    try {
      const response = await api.get(`/pdf/download/${encodeURIComponent(filename)}`, {
        responseType: 'blob',
      });
      const file = new Blob([response.data], { type: 'application/pdf' });
      const fileURL = URL.createObjectURL(file);
      window.open(fileURL, '_blank');
    } catch (error) {
      console.error("Erreur lors de l'ouverture du CV :", error);
    }
  };

  

  const handleDecision = async (appId, decision) => {
    try {
      await api.post(`/applications/applications/${appId}/${decision}`);
      fetchApplications();
    } catch (err) {
      console.error(`Erreur lors de l'action ${decision}`, err);
    }
  };
  

  useEffect(() => {
    fetchApplications();
  }, [offerId]);

  return (
    <div>
      <h2>Candidatures pour l'offre {offerId}</h2>
      {applications.map(app => (
        <div key={app.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          {app.offer && app.student && app.student.user && (
  <button
    onClick={() =>
      handleViewCv(
        `${sanitize(app.offer.title)}_${sanitize(app.student.user.lastname)}_${sanitize(app.student.user.firstname)}.pdf`
      )
    }
  >
    📄 Voir le CV
  </button>
)}

          <p><strong>Status :</strong> {app.status}</p>
          <button onClick={() => handleDecision(app.id, 'accept')}>✅ Accepter</button>
          <button onClick={() => handleDecision(app.id, 'reject')}>❌ Refuser</button>
        </div>
      ))}
    </div>
  );
};

export default ApplicationsList;
