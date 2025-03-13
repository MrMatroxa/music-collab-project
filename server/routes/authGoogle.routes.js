const express = require("express");
const router = express.Router();
const axios = require("axios");
const qs = require("qs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

// GET route for Google auth redirect URL
router.get("/auth/google", async (req, res, next) => {
  try {
    const googleAuthURL = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=${process.env.GOOGLE_REDIRECT_URIS}&response_type=code&scope=profile%20email&access_type=offline`;
    res.redirect(googleAuthURL);
  } catch (error) {
    next(error);
    res.status(500).send("Internal Server Error");
  }
});

// POST route for retrieving Google auth token
router.post("/auth/google", async (req, res, next) => {
  const { code } = req.body;
  if (!code) {
    return res.status(404).json("code not found");
  }

  try {
    const getAccessToken = await axios.post(
      "https://www.googleapis.com/oauth2/v4/token",
      qs.stringify({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: process.env.GOOGLE_REDIRECT_URIS,
        grant_type: "authorization_code",
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const { access_token } = getAccessToken.data;

    const getUserInfo = await axios.get(
      "https://www.googleapis.com/oauth2/v3/userinfo",
      {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }
    );

    const user = getUserInfo.data;
    if (!user) {
      return res.status(401).json("Unauthorized");
    }

    const { name, picture, email } = getUserInfo.data;
    const foundUsers = await User.find({
      $or: [{ googleId: email }, { email: email }],
    });

    if (foundUsers.length) {
      const [foundUser] = foundUsers;
      const { _id, avatar, name } = foundUser;
      const payload = {
        _id,
        name,
        avatar,
      };

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });

      // Send the token as the response
      res.status(200).json({ authToken: authToken });
      return;
    }

    const createdUser = await User.create({
      name: email.replace(/[^a-zA-Z0-9]/g, "_"),
      googleID: email,
      email: email,
      avatar: picture,
    });

    const { _id, avatar } = createdUser;
    const payload = { _id, name, avatar };
    const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
      algorithm: "HS256",
      expiresIn: "6h",
    });

    // Send the token as the response
    res.status(200).json({ authToken: authToken });
  } catch (error) {
    console.error("google auth error: ", error);
    next(error);
  }
});

module.exports = router;
