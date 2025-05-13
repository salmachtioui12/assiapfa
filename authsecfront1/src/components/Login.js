import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';


const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:1217/api/v1';

const Login = ({ setToken }) => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const parseJwt = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const storeTokens = (token, refreshToken) => {
    setToken(token);
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const redirectUser = (decoded, name = '') => {
    const role = decoded?.role;
    if (role === 'MANAGER') {
      setMessage(`Bienvenue ${name || 'Manager'} ! Redirection...`);
      setTimeout(() => navigate('/homecompany'), 1500);
    } else if  (role === 'ADMIN') {
      setMessage(`Bienvenue Admin ${name} ! Redirection...`);
      setTimeout(() => navigate('/admin'), 1500);
    }
    else {
      setMessage(`Welcome ${name || 'User'}! Redirecting...`);
      setTimeout(() => navigate('/home'), 1500);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/authenticate`, formData);
      const { access_token, refresh_token } = response.data;



      if (access_token && refresh_token) {
        storeTokens(access_token, refresh_token);
        const decoded = parseJwt(access_token);
        localStorage.setItem('userId', decoded?.userId);
        redirectUser(decoded, decoded?.name || decoded?.sub || '');
      } else {
        console.error("Tokens not found in Google login response", response.data);
        setMessage("Erreur: tokens manquants dans la réponse Google.");
      }


    } catch (error) {
      const err = error.response?.data?.message || error.response?.data?.error || 'Login failed';
      setMessage(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Login</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.inputContainer}>
          <label style={styles.label}>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ ...styles.input, ...(errors.email && styles.inputError) }}
            required
          />
          {errors.email && <span style={styles.errorText}>{errors.email}</span>}
        </div>

        <div style={styles.inputContainer}>
          <label style={styles.label}>Password</label>
          <div style={styles.passwordInputWrapper}>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              style={{ ...styles.input, ...(errors.password && styles.inputError) }}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={styles.showPasswordButton}
            >
              {showPassword ? '🙈' : '👁️'}
            </button>
          </div>
          {errors.password && <span style={styles.errorText}>{errors.password}</span>}
        </div>

        <button type="submit" disabled={isLoading} style={styles.button}>
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '1rem' }}>
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            console.log("Google Credential Response:", credentialResponse);
            const idToken = credentialResponse.credential;

            try {
              const response = await axios.post(`${API_BASE_URL}/auth/google`, { idToken });
              console.log("Backend Response:", response.data);
              const { access_token, refresh_token } = response.data;

              storeTokens(access_token, refresh_token);
              const decoded = parseJwt(access_token);
              localStorage.setItem('userId', decoded.userId);
              redirectUser(decoded, decoded.name || decoded.sub || '');
            } catch (error) {
              setMessage('Erreur lors de la connexion Google');
              console.error(error);
            }
          }}
          onError={() => {
            setMessage('Échec de la connexion Google');
          }}
        />
      </div>


      <div style={styles.registerLinkContainer}>
        <p style={styles.registerText}>Don't have an account?</p>
        <button onClick={() => navigate('/register')} style={styles.textButton}>
          Register
        </button>
      </div>

      {message && (
        <div
          style={{
            ...styles.message,
            ...(message.toLowerCase().includes('fail') || message.toLowerCase().includes('invalid')
              ? styles.error
              : styles.success),
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '400px',
    margin: '2rem auto',
    padding: '2rem',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    fontFamily: "'Inter', sans-serif",
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontSize: '1.75rem',
    fontWeight: '600',
    color: '#1a1a1a',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  inputContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.875rem',
    fontWeight: '500',
  },
  input: {
    padding: '0.75rem 1rem',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    fontSize: '0.9375rem',
  },
  inputError: {
    borderColor: '#ff4d4f',
  },
  passwordInputWrapper: {
    position: 'relative',
  },
  showPasswordButton: {
    position: 'absolute',
    right: '10px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  button: {
    padding: '0.75rem',
    backgroundColor: '#1976d2',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
  registerLinkContainer: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  registerText: {
    marginBottom: '0.25rem',
    fontSize: '0.875rem',
  },
  textButton: {
    background: 'none',
    border: 'none',
    color: '#1976d2',
    cursor: 'pointer',
    textDecoration: 'underline',
    fontSize: '0.875rem',
  },
  message: {
    marginTop: '1rem',
    padding: '0.75rem',
    borderRadius: '6px',
    textAlign: 'center',
    fontSize: '0.875rem',
  },
  success: {
    backgroundColor: '#f6ffed',
    color: '#52c41a',
    border: '1px solid #b7eb8f',
  },
  error: {
    backgroundColor: '#fff2f0',
    color: '#ff4d4f',
    border: '1px solid #ffccc7',
  },
  errorText: {
    color: '#ff4d4f',
    fontSize: '0.75rem',
  },
};

export default Login;
