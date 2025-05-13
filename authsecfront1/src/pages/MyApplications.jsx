import React, { useEffect, useState } from 'react';
import api from '../components/api';

const MyApplications = () => {
  const [applications, setApplications] = useState([]);

  useEffect(() => {
    const fetchApplications = async () => {
      const userId = localStorage.getItem("userId"); // ou récupère-le depuis ton auth context

      try {

        // const res = await axios.get(`http://localhost:1217/applications/students/${userId}/applications`, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });

        const res = await api.get(`/applications/students/${userId}/applications`);

        setApplications(res.data);
      } catch (err) {
        console.error("Erreur lors du chargement des candidatures:", err);
      }
    };

    fetchApplications();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Mes Postulations</h2>
      <table className="w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Offre</th>
            <th className="border p-2">Entreprise</th>
            <th className="border p-2">Statut</th>
            <th className="border p-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {applications.map(app => (
            <tr key={app.id}>
              <td className="border p-2">{app.offer?.title}</td>
              <td className="border p-2">{app.offer?.company?.name}</td>
              <td className="border p-2">
                {app.status === "PENDING" && "⏳ En attente"}
                {app.status === "ACCEPTED" && "✅ Acceptée"}
                {app.status === "REJECTED" && "❌ Refusée"}
              </td>
              <td className="border p-2">{new Date(app.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MyApplications;
