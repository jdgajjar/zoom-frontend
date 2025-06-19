import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Snackbar } from '@mui/material';
import { CSSTransition } from 'react-transition-group';
import '../styles/authentication.css';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#90caf9',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#000000',
      paper: '#1d1d1d',
    },
  },
});

// Ensure compatibility with React 18
const nodeRef = React.createRef();

export default function Authentication() {
  const [username, setUsername] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [name, setName] = React.useState('');
  const [error, setError] = React.useState('');
  const [message, setMessage] = React.useState('');
  const [formState, setFormState] = React.useState(0);
  const [open, setOpen] = React.useState(false);
  const [inProp, setInProp] = React.useState(true);

  const {handleRegister, handleLogin} = React.useContext(AuthContext)
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check for token in localStorage (or sessionStorage)
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [navigate]); // No missing dependencies

  const handleAuth = async () => {
    try {
      if (formState === 0) {
        // Login logic
        await handleLogin(username, password);
        setMessage('Login successful!');
        setOpen(true);
        setUsername('');
        setPassword('');
      } else {
        // Register logic
        await handleRegister(name, username, password);
        // Auto-login after successful registration
        await handleLogin(username, password);
        setMessage('Registration and login successful!');
        setOpen(true);
        setError("");
        setFormState(0);
        setName('');
        setUsername('');
        setPassword('');
      }
      setError('');
    } catch (err) {
      let message = err?.response?.data?.message || err.message || 'An error occurred';
      setError(message);
    }
  };

  const handleFormSwitch = (state) => {
    setInProp(false);
    setTimeout(() => {
      setFormState(state);
      setInProp(true);
    }, 300); // Duration matches CSS transition
  };

  React.useEffect(() => {
    const background = document.querySelector('.animated-background');
    for (let i = 0; i < 50; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 3}s`;
      background.appendChild(particle);
    }
    return () => {
      if (background) {
        while (background.firstChild) {
          background.removeChild(background.firstChild);
        }
      }
    };
  }, []); // No missing dependencies

  return (
    <ThemeProvider theme={darkTheme}>
      <div style={{ position: 'relative', height: '100vh', width: '100vw' }}>
        <div className="animated-background" style={{ position: 'absolute', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 0 }} />
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Paper elevation={6} sx={{ padding: 4, maxWidth: 400, width: '100%' }}>
            <Avatar sx={{ m: 1, bgcolor: 'secondary.main', margin: '0 auto' }}>
              <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5" align="center">
              {formState === 0 ? 'Sign In' : 'Sign Up'}
            </Typography>
            <CSSTransition
              in={inProp}
              timeout={300}
              classNames="form-transition"
              unmountOnExit
              nodeRef={nodeRef}
            >
              <Box component="form" noValidate sx={{ mt: 1 }} ref={nodeRef}>
                {formState === 1 && (
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="name"
                    label="Full Name"
                    name="name"
                    value={name}
                    autoFocus
                    onChange={(e) => setName(e.target.value)}
                  />
                )}
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="username"
                  label="Username"
                  name="username"
                  value={username}
                  autoFocus
                  onChange={(e) => setUsername(e.target.value)}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <Typography color="error">{error}</Typography>}
                <Button
                  type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={handleAuth}
                >
                  {formState === 0 ? 'Login' : 'Register'}
                </Button>
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Button onClick={() => handleFormSwitch(0)} variant={formState === 0 ? 'outlined' : 'text'}>
                    Sign In
                  </Button>
                  <Button onClick={() => handleFormSwitch(1)} variant={formState === 1 ? 'outlined' : 'text'}>
                    Sign Up
                  </Button>
                </Box>
              </Box>
            </CSSTransition>
          </Paper>
        </Box>
        <Snackbar open={open} autoHideDuration={4000} message={message} onClose={() => setOpen(false)} />
      </div>
    </ThemeProvider>
  );
}
