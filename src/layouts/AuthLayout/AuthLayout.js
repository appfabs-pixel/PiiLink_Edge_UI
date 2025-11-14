import React, { useState } from 'react';
import axios from 'axios';
import './AuthLayout.scss';
import Logo from '../../assests/images/logo-collapsed.svg';

const AuthLayout = ({ onLoginSuccess }) => {
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

 
  const REQUIRED_EMAIL = "admin@gmail.com";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
     
      if (email.trim() !== REQUIRED_EMAIL) {
        setError(`Invalid email.`);
        setLoading(false);
        return; 
      }
      
    
      const loginRes = await axios.post("/v1/auth/userpass/login/admin", {
        password: password.trim(),
      });

      const vaultToken = loginRes.data?.auth?.client_token;
      if (!vaultToken) {
        throw new Error("Failed to get Vault client token");
      }

      
      const jwtRes = await axios.get("/v1/identity/oidc/token/admin", {
        headers: { 'X-Vault-Token': vaultToken }
      });

      const edgexToken = jwtRes.data?.data?.token;
      if (!edgexToken) {
        throw new Error("Failed to get EdgeX JWT");
      }
      
      localStorage.setItem("edgeXToken", edgexToken);
      console.log(" EdgeX JWT stored successfully!");

      if (onLoginSuccess) onLoginSuccess();
      
    } catch (err) {
      console.error("Login failed:", err);
      
      if (err.response?.status === 400 || err.response?.status === 401)
        setError("Invalid Vault password. Please try again.");
      else setError("Authentication error or server unreachable.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='app-login-wrapper'>
  
      <div className='app-login-start'>
        <div className='app-login-content'>
          <img src={Logo} alt='Pie Device' />
          <h2>Pie Device</h2>
          <p>The most popular Device Management system</p>
        </div>
      </div>

     
      <div className='app-login-end'>
        <div className='app-login-form'>
          <div className='app-login-form-desc'>
            <h3>Hello Admin!</h3>
            <p>Welcome Back</p>
          </div>

          <div className='app-form-card'>
            <form onSubmit={handleLogin}>
              
              
              <div className='form-control-item'>
                <input
                  type='email'
                  className='form-control'
                  placeholder='Email Address'
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className='form-control-item'>
                <input
                  type='password'
                  className='form-control'
                  placeholder=' Admin Password' 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)} 
                  required
                />
              </div>

              {error && <p style={{ color: 'red' }}>{error}</p>}

              <div className='form-control-item'>
                <button
                  type='submit'
                  className='btn-secondary btn-lg'
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;