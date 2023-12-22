import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useNavigate } from '../../../node_modules/react-router-dom/dist/index';
// import { useLocation } from '../../../node_modules/react-router-dom/dist/index';
import axios from 'axios';
// import { RouteComponentProps } from 'react-router-dom';

// material-ui
import {
  Grid,
  Typography,
  Card
  // Paper
} from '@mui/material';
import { Favorite, FavoriteBorder } from '@mui/icons-material';
import { styled } from '@mui/system';

// import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
// import MoreVertIcon from '@mui/icons-material/MoreVert';
import IconButton from '@mui/material/IconButton';
import CardActions from '@mui/material/CardActions';
import Collapse from '@mui/material/Collapse';
import { CardActionArea } from '@mui/material';

const ExpandMore = styled((props) => {
  const { ...other } = props;
  return <IconButton {...other} />;
})(({ theme }) => ({
  transform: 'rotate(0deg)',
  marginLeft: 'auto',
  transition: theme.transitions.create('transform', {
    duration: theme.transitions.duration.shortest
  })
}));

// ==============================|| DASHBOARD - DEFAULT ||============================== //

const Allvacations = () => {
  const [vacationsArray, setVacationsArray] = useState([]);
  const [userID, setUserID] = useState(null); // Initialize userID state
  const [likedVacations, setLikedVacations] = useState({});
  const [expandedCards, setExpandedCards] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch vacations
    axios
      .get('http://localhost:4000/api/v1/user/getallvacations')
      .then((response) => {
        const vacationsData = response.data;
        const sortedVacations = vacationsData.sort((a, b) => {
          const dateA = new Date(a.start.split('T')[0]);
          const dateB = new Date(b.start.split('T')[0]);
          return dateA.getTime() - dateB.getTime();
        });
        setVacationsArray(sortedVacations);
      })
      .catch((error) => {
        console.log('Error fetching vacations:', error);
      });

    // Fetch likes
    axios
      .get('http://localhost:4000/api/v1/admin/getallLikes')
      .then((response) => {
        const likes = response.data;
        console.log(likes);
      })
      .catch((error) => {
        console.log('Error fetching likes:', error);
      });

    const user_id = localStorage.getItem('user_id');

    // Check if user_id is available
    if (!user_id) {
      navigate('/login');
    } else {
      // Continue with your logic using user_id
      setUserID(user_id);
    }
  }, [navigate]);

  useEffect(() => {
    if (userID) {
      axios
        .get(`http://localhost:4000/api/v1/user/getUserLikes/${userID}`)
        .then((response) => {
          const userLikes = response.data;
          const likedVacationsObj = {};
          userLikes.forEach((like) => {
            likedVacationsObj[like.vacation_id] = true;
          });
          setLikedVacations(likedVacationsObj);
        })
        .catch((error) => {
          console.log('Error fetching user likes:', error);
        });
    } else {
      // console.log('User_id not available');
    }
  }, [userID]);

  const handleLikeClick = async (id) => {
    try {
      if (!userID) {
        console.error('User ID is not defined.');
        return;
      }

      const isLiked = likedVacations[id];

      if (isLiked) {
        const response = await axios.delete(`http://localhost:4000/api/v1/user/removeLikeById/${id}`);
        if (response.status === 200) {
          setLikedVacations((prevLikedVacations) => {
            const updatedLikedVacations = { ...prevLikedVacations };
            delete updatedLikedVacations[id];
            return updatedLikedVacations;
          });
        } else {
          // console.log('Failed to remove like.');
        }
      } else {
        const newLike = {
          user_id: userID,
          vacation_id: id
        };
        await axios.post('http://localhost:4000/api/v1/user/addLike', newLike);
        console.log('Like clicked for vacation ID:', id);
        setLikedVacations((prevLikedVacations) => ({
          ...prevLikedVacations,
          [id]: true
        }));
      }
    } catch (error) {
      console.log('Error:', error);
      // Handle error
    }
  };

  const handleExpandClick = (id) => {
    setExpandedCards((prevExpandedCards) => ({
      ...prevExpandedCards,
      [id]: !prevExpandedCards[id]
    }));
  };

  function formatDateWithoutTime(dateString) {
    const [date] = dateString.split('T');
    return date;
  }

  function handleVacationClick(id) {
    console.log(id);
    navigate(`/vacationDetails?params=${encodeURIComponent(id)}`);
  }

  return (
    <Grid container rowSpacing={4.5} columnSpacing={2.75}>
      <Grid item xs={12} sx={{ mb: 2.25 }}>
        <Typography variant="h5">All Vacations</Typography>
      </Grid>
      <Grid container spacing={3} sx={{ mr: '10px', ml: '10px' }}>
        {vacationsArray.map((vacation) => (
          <Grid key={vacation.id} item xs={12} sm={6} md={4}>
            <Card
              onClick={() => handleVacationClick(vacation.id)}
              elevation={5}
              className="vacation-box"
              sx={{ display: 'flex', flexDirection: 'column', maxHeight: '450px' }}
            >
              <CardActionArea>
                <CardMedia sx={{ height: 140, flexGrow: 1 }} image={vacation.img} alt={vacation.destination} title={vacation.destination} />
                <CardContent sx={{ flexGrow: 1, minHeight: '90px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography gutterBottom variant="h5" component="div">
                      {vacation.destination}
                    </Typography>
                    <div
                      className="like-button"
                      tabIndex="0"
                      role="button"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleLikeClick(vacation.id);
                        }
                      }}
                      onClick={(e) => {
                        e.stopPropagation(); // Stop event propagation
                        handleLikeClick(vacation.id);
                      }}
                    >
                      {likedVacations[vacation.id] ? <Favorite /> : <FavoriteBorder />}
                    </div>
                  </div>
                  <br></br>
                  <Typography className="vacation-dates">
                    Start: {formatDateWithoutTime(vacation.start)} | End: {formatDateWithoutTime(vacation.end)}
                  </Typography>{' '}
                  <Typography variant="h5" className="vacation-price">
                    $ {vacation.price}
                  </Typography>
                </CardContent>
              </CardActionArea>
              <CardActions disableSpacing>
                <ExpandMore
                  expand={expandedCards[vacation.id]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleExpandClick(vacation.id);
                  }}
                  aria-expanded={expandedCards[vacation.id]}
                  aria-label="show more"
                >
                  <ExpandMoreIcon />
                </ExpandMore>
              </CardActions>
              <Collapse in={expandedCards[vacation.id]} timeout="auto" unmountOnExit>
                <CardContent>
                  <Typography gutterBottom variant="h5" component="div">
                    {vacation.description}
                  </Typography>
                  <br></br>
                </CardContent>
              </Collapse>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Grid>
  );
};

export default Allvacations;
