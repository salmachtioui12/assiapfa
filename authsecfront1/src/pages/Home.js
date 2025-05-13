/*import React, { useEffect, useState } from 'react';
import axios from 'axios';
import OfferCard from '../components/Offre/OfferCard';
import './styles/Home.css';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';
import NotificationDropdown from '../components/NotificationDropdown';

const DEFAULT_PROFILE_PICTURE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const Home = ({ searchLocation, searchStageType, setSearchLocation, onAddFavorite }) => {
  const [offers, setOffers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const userId = parseInt(localStorage.getItem("userId"));
  const navigate = useNavigate();

  // Vérifie l'authentification
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    } else {
      setIsReady(true);
    }
  }, [navigate]);

  // Récupère les offres
  const fetchOffers = (location = '', stageType = '') => {
    const token = localStorage.getItem('accessToken');
    let endpoint = 'http://localhost:1217/api/v1/student/offers';

    const params = new URLSearchParams();
    if (location) params.append('location', location);
    if (stageType) params.append('stageType', stageType);

    if (params.toString()) {
      endpoint += `?${params.toString()}`;
    }

    axios.get(endpoint, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    })
        .then(response => setOffers(response.data))
        .catch(error => console.error('Erreur lors de la récupération des offres:', error));
  };

  // Chargement initial des offres
  useEffect(() => {
    if (isReady) {
      fetchOffers();
    }
  }, [isReady]);

  // Rafraîchit les offres en fonction des filtres
  useEffect(() => {
    if (isReady) {
      fetchOffers(searchLocation, searchStageType);
    }
  }, [searchLocation, searchStageType, isReady]);

  // Récupération du profil et photo de profil
  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const profileResponse = await axios.get("http://localhost:1217/api/v1/profiles/my-profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const userProfile = profileResponse.data;
        setProfile(userProfile);

        try {
          const pictureResponse = await axios.get("http://localhost:1217/api/v1/profiles/profile-picture", {
            headers: { Authorization: `Bearer ${token}` },
            responseType: 'blob',
          });
          const imageUrl = URL.createObjectURL(pictureResponse.data);
          setProfilePictureUrl(imageUrl);
        } catch (error) {
          console.warn("Aucune photo trouvée, utilisation image par défaut.");
          setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
        }

      } catch (error) {
        console.error("Erreur de chargement du profil:", error);
        setProfile(null);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleImageClick = () => {
    if (profile) {
      navigate("/profile/view");
    } else {
      navigate("/profile/create");
    }
  };

  return (
      <div className="home-container">
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1rem'
        }}>
          {!loadingProfile && (
              <div onClick={handleImageClick} style={{ cursor: "pointer", display: "flex", alignItems: "center" }}>
                <img
                    src={profilePictureUrl}
                    alt="Avatar utilisateur"
                    style={{
                      borderRadius: "50%",
                      width: "50px",
                      height: "50px",
                      objectFit: "cover",
                      border: "2px solid #ccc",
                      marginRight: "10px"
                    }}
                />
                <span>
              {profile ? profile.fullName || "Mon profil" : "Créer profil"}
            </span>
              </div>
          )}

          {userId && <NotificationDropdown userId={userId} />}
        </div>

        <p className="offers-header">{`You have ${offers.length} offers`}</p>

        {offers.map((offer, index) => (
            <OfferCard
                key={index}
                offer={offer}
                onAddFavorite={onAddFavorite}
            />
        ))}

        <Footer />
      </div>
  );
};

export default Home;*/



import React, { useEffect, useState } from 'react';
import OfferCard from '../components/Offre/OfferCard';
import './styles/Home.css';
import api from '../components/api';
import { useNavigate } from 'react-router-dom';
import Footer from '../layout/Footer';

const DEFAULT_PROFILE_PICTURE = "https://cdn-icons-png.flaticon.com/512/847/847969.png";

const Home = ({ searchLocation, searchStageType, setSearchLocation, onAddFavorite }) => {
  const [offers, setOffers] = useState([]);
  const [isReady, setIsReady] = useState(false);
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(DEFAULT_PROFILE_PICTURE);
  const [loadingProfile, setLoadingProfile] = useState(true);

  const navigate = useNavigate();

  // Vérifie l'authentification
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      navigate('/login');
    } else {
      setIsReady(true);
    }
  }, [navigate]);

  // Récupère les offres
  const fetchOffers = (location = '', stageType = '') => {
  let endpoint = '/student/offers';

  const params = new URLSearchParams();
  if (location || stageType) {
    const keyword = location || stageType;
    params.append('keyword', keyword);
  }

  if (params.toString()) {
    endpoint += `?${params.toString()}`;
  }

  api.get(endpoint)
    .then(response => setOffers(response.data))
    .catch(error => console.error('Erreur lors de la récupération des offres:', error));
};


  // Chargement initial des offres
  useEffect(() => {
    if (isReady) {
      fetchOffers();
    }
  }, [isReady]);

  // Rafraîchit les offres en fonction des filtres
  useEffect(() => {
    if (isReady) {
      fetchOffers(searchLocation, searchStageType);
    }
  }, [searchLocation, searchStageType, isReady]);

  // Récupération du profil et photo de profil
  useEffect(() => {
    const fetchProfile = async () => {
  try {
    const profileResponse = await api.get("/profiles/my-profile");
    const userProfile = profileResponse.data;
    setProfile(userProfile);

    try {
      const pictureResponse = await api.get("/profiles/profile-picture", {
        responseType: 'blob',
      });
      const imageUrl = URL.createObjectURL(pictureResponse.data);
      setProfilePictureUrl(imageUrl);
    } catch (error) {
      console.warn("Aucune photo trouvée, utilisation image par défaut.");
      setProfilePictureUrl(DEFAULT_PROFILE_PICTURE);
    }

  } catch (error) {
    console.error("Erreur de chargement du profil:", error);
    setProfile(null);
  } finally {
    setLoadingProfile(false);
  }
};


    fetchProfile();
  }, [navigate]);

  const handleImageClick = () => {
    if (profile) {
      navigate("/profile/view");
    } else {
      navigate("/profile/create");
    }
  };

  return (
    <div className="home-container">
      {!loadingProfile && (
        <div onClick={handleImageClick} style={{ cursor: "pointer", textAlign: "center", marginBottom: "30px" }}>
          <img
            src={profilePictureUrl}
            alt="Avatar utilisateur"
            style={{
              borderRadius: "50%",
              width: "120px",
              height: "120px",
              objectFit: "cover",
              border: "2px solid #ccc"
            }}
          />
          <p style={{ marginTop: "10px" }}>
            {profile ? "Bienvenue dans votre espace étudiant !" : "Créez votre profil pour commencer"}
          </p>
        </div>
      )}

      <p className="offers-header">{`You have ${offers.length} offers`}</p>
      <button
        onClick={() => navigate("/my-applications")}
        style={{
          padding: "10px 20px",
          backgroundColor: "#4CAF50",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
          marginBottom: "20px"
        }}
      >
        Mes Postulations
      </button>


      {offers.map((offer, index) => (
        <OfferCard
          key={index}
          offer={offer}
          onAddFavorite={onAddFavorite}
        />
      ))}

      <Footer />
    </div>
  );
};

export default Home;
