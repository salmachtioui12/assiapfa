
import React, { useState } from 'react';
import './OfferCard.css';
import axios from 'axios';
import Modal from 'react-modal';
import api from '../api';

const OfferCard = ({ offer, onAddFavorite }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [cvUrl, setCvUrl] = useState('');
  const [loading, setLoading] = useState(false);

  if (!offer || !offer.company) {
    return <div>Loading...</div>;
  }

  const handleSeeMoreClick = () => {
    setShowDetails(!showDetails);
  };

  const handleAddToFavorites = () => {
    api.post(`/student/favorites/${offer.id}`)
    .then(response => {
      setIsFavorite(true);
      alert("Offre ajoutée aux favoris");
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout aux favoris:", error);
    });

  };


  const handleApplyClick = async () => {
    setLoading(true);
    const studentId = localStorage.getItem("studentProfileId");
  
    try {

      
      const res = await api.get(`/pdf/generate-and-store/${studentId}/${offer.id}`);




      console.log("Lien PDF retourné :", res.data);

      const directPdfUrl = res.data; // le lien complet est déjà retourné
      setCvUrl(directPdfUrl);
      setModalIsOpen(true);
    } catch (err) {
      console.error('Erreur de génération du CV :', err);
      alert("Erreur lors de la génération du CV.");
    } finally {
      setLoading(false);
    }
  };
  
  

  const confirmApply = async () => {
    const token = localStorage.getItem('accessToken');
    const studentId = localStorage.getItem('studentProfileId');
    try {
      const filename = `${offer.title}_${studentId}.pdf`;
      await api.post('/applications/apply', {
        studentId,
        offerId: offer.id,
        cvFilename: filename
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert("Candidature envoyée !");
      setModalIsOpen(false);
    } catch (err) {
      console.error('Erreur lors de la postulation :', err);
      alert("Erreur lors de la postulation.");
    }
  };

  //const imageUrl = `/images/${offer.company.picture}`;
  const imageUrl = `http://localhost:1217/images/${offer.company.picture}`;

  return (
    <div className="offer-card">
      <div className="offer-image">
        <img src={imageUrl} alt={offer.company.name} className="company-logo" />
      </div>
      <div className="offer-info">
        <p><strong>Title:</strong> {offer.title}</p>
        <p><strong>Type:</strong> {offer.stageType}</p>
        <p><strong>Duration:</strong> {offer.duration}</p>
        <p><strong>Sector:</strong> {offer.company.sector}</p>

        {showDetails && (
          <div className="offer-details">
            <p><strong>Description:</strong> {offer.description}</p>
            <p><strong>Location:</strong> {offer.location}</p>
          </div>
        )}
      </div>

      <button className="see-more" onClick={handleSeeMoreClick}>
        {showDetails ? "Show less" : "See more"}
      </button>

      {showDetails && !isFavorite && (
        <button className="favorite-btn" onClick={handleAddToFavorites}>
          Add to favorites
        </button>
      )}
      {showDetails && isFavorite && (
        <span className="favorite-tag">Favorited</span>
      )}

      {showDetails && (
        <button className="apply-btn" onClick={handleApplyClick}>
          Postuler
        </button>
      )}

      
      <Modal isOpen={modalIsOpen} onRequestClose={() => setModalIsOpen(false)} contentLabel="CV Preview">
        <h2>Votre CV personnalisé</h2>
        {loading ? (
          <p>Chargement du CV...</p>
        ) : (
          <>
            <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'block', marginBottom: '10px', color: '#007bff' }}>
              Ouvrir dans un nouvel onglet
            </a>
            <iframe src={cvUrl} title="CV PDF" width="100%" height="500px" />
            <button onClick={confirmApply}>Confirmer</button>
            <button onClick={() => setModalIsOpen(false)}>Annuler</button>
          </>
        )}
      </Modal>

    </div>
  );
};

export default OfferCard;
