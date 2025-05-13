
import React, { useState, useEffect } from 'react';
import OfferCard from '../components/Offre/OfferCard';
import api from '../components/api'; 

const Favorites = () => {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    api.get('/student/favorites')
      .then(response => {
        setFavorites(response.data);
      })
      .catch(error => {
        console.error("Erreur lors de la récupération des favoris:", error);
      });
  }, []);


   const removeFavorite = (offerId) => {
    api.delete(`/student/favorites/remove/${offerId}`)
      .then(() => {
        setFavorites(prev => prev.filter(offer => offer.id !== offerId));
      })
      .catch(error => {
        console.error("Erreur lors de la suppression du favori:", error);
      });
  };


  return (
    <div className="favorites-container">
      <h2>Your Favorites</h2>
      {favorites.length === 0 && <p>You have no favorite offers yet.</p>}

      {favorites.map((offer, index) => (
        <div key={index} style={{ position: "relative", marginBottom: "20px" }}>
          <OfferCard
            offer={offer}
            title={offer.title}
            sector={offer.sector}
            type={offer.stage_type}
            duration={offer.duration}
            details={offer}
          />
          <button
            onClick={() => removeFavorite(offer.id)}
            style={{
              position: "absolute",
              top: 10,
              right: 10,
              backgroundColor: "red",
              color: "white",
              border: "none",
              padding: "5px 10px",
              borderRadius: "5px",
              cursor: "pointer"
            }}
          >
            Remove
          </button>
        </div>
      ))}
    </div>
  );
};

export default Favorites;

