import axios from 'axios';

export const registerUserInBackend = async (auth0UserData: any) => {
  try {
    const response = await axios.post('http://localhost:3002/users/register', {
      nickname: auth0UserData.nickname, // O el campo que utilices
      email: auth0UserData.email,
      auth0Id: auth0UserData.sub,
    });
    return response.data;
  } catch (error) {
    console.error("Error registering user in backend:", error);
  }
};