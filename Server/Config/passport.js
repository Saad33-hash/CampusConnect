const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const mongoose = require('mongoose');
const User = require('../Model/User');

module.exports = function (passport) {
  // --- GOOGLE STRATEGY ---
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      googleId: profile.id,
      displayName: profile.displayName,
      email: profile.emails[0].value,
      avatar: profile.photos[0].value
    };
    try {
      let user = await User.findOne({ googleId: profile.id });
      if (user) return done(null, user);
      user = await User.create(newUser);
      done(null, user);
    } catch (err) { console.error(err); }
  }));

  // --- GITHUB STRATEGY ---
  passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: process.env.GITHUB_CALLBACK_URL
  },
  async (accessToken, refreshToken, profile, done) => {
    const newUser = {
      githubId: profile.id,
      displayName: profile.displayName || profile.username,
      // Note: GitHub emails can sometimes be null if private; 
      // we use the username as a fallback or profile URL
      email: profile.emails ? profile.emails[0].value : `${profile.username}@github.com`,
      avatar: profile.photos[0].value
    };
    try {
      let user = await User.findOne({ githubId: profile.id });
      if (user) return done(null, user);
      user = await User.create(newUser);
      done(null, user);
    } catch (err) { console.error(err); }
  }));

  // --- SERIALIZATION (Required for sessions) ---
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err, null);
    }
  });
};