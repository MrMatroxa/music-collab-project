import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/auth.context";
import authService from "../../services/auth.service";
import { Container, Paper, Typography, TextField, Button, Box, Divider } from "@mui/material";
import GoogleIcon from '@mui/icons-material/Google';

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(undefined);

  const navigate = useNavigate();

  const { storeToken, authenticateUser } = useContext(AuthContext);

  const handleEmail = (e) => setEmail(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    const requestBody = { email, password };

    authService
      .login(requestBody)
      .then((response) => {
        storeToken(response.data.authToken);
        authenticateUser();
        navigate("/");
      })
      .catch((error) => {
        const errorDescription = error.response.data.message;
        setErrorMessage(errorDescription);
      });
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_SERVER_URL}/api/auth/google`;
  };

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Paper 
        elevation={3} 
        sx={{ 
          p: 4, 
          bgcolor: "background.paper", 
          borderRadius: 2,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)'
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom sx={{ 
          color: 'rgb(251, 165, 24)',
          fontWeight: 'bold',
          mb: 3
        }}>
          Login
        </Typography>
        
        <Box component="form" onSubmit={handleLoginSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            value={email}
            onChange={handleEmail}
            required
            sx={{ bgcolor: 'background.paper' }}
          />
          
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            value={password}
            onChange={handlePassword}
            required
            sx={{ bgcolor: 'background.paper' }}
          />
          
          {errorMessage && (
            <Typography variant="body2" color="error">
              {errorMessage}
            </Typography>
          )}
          
          <Button 
            type="submit" 
            variant="contained" 
            size="large"
            sx={{ 
              mt: 2,
              py: 1.5,
              fontWeight: 'bold',
              bgcolor: 'rgb(251, 165, 24)',
              boxShadow: '0 4px 12px rgba(251, 165, 24, 0.3)',
              '&:hover': {
                bgcolor: 'rgb(249, 203, 67)',
                boxShadow: '0 6px 16px rgba(249, 203, 67, 0.45)',
              }
            }}
          >
            Login
          </Button>
        </Box>

        <Divider sx={{ my: 3 }}>OR</Divider>
        
        <Button 
          variant="outlined" 
          fullWidth
          onClick={handleGoogleLogin}
          startIcon={<GoogleIcon />}
          sx={{ 
            py: 1.5,
            display: 'flex',
            alignItems: 'center',
            borderColor: '#4285F4',
            color: '#4285F4',
            '&:hover': {
              borderColor: '#4285F4',
              backgroundColor: 'rgba(66, 133, 244, 0.04)',
            }
          }}
        >
          Continue with Google
        </Button>
        
        <Typography variant="body2" sx={{ mt: 3 }}>
          Don't have an account yet? <Link to="/signup" style={{ color: 'rgb(251, 165, 24)' }}>Sign Up</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default LoginPage;