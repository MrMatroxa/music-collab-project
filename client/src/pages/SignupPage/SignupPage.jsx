import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/auth.service";
import { Container, Paper, Typography, TextField, Button, Box } from "@mui/material";

function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [errorMessage, setErrorMessage] = useState(undefined);

  const navigate = useNavigate();

  const handleEmail = (e) => setEmail(e.target.value);
  const handlePassword = (e) => setPassword(e.target.value);
  const handleName = (e) => setName(e.target.value);

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    const requestBody = { email, password, name };

    authService
      .signup(requestBody)
      .then((response) => {
        navigate("/login");
      })
      .catch((error) => {
        const errorDescription = error.response.data.message;
        setErrorMessage(errorDescription);
      });
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
          Sign Up
        </Typography>
        
        <Box component="form" onSubmit={handleSignupSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
          
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            value={name}
            onChange={handleName}
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
            Sign Up
          </Button>
        </Box>
        
        <Typography variant="body2" sx={{ mt: 2 }}>
          Already have an account? <Link to="/login" style={{ color: 'rgb(251, 165, 24)' }}>Login</Link>
        </Typography>
      </Paper>
    </Container>
  );
}

export default SignupPage;