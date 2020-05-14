import passport from "passport";
import User from "./models/User";
import routes from "./routes";

passport.use(User.createStrategy());

passport.serializeUser((user, done) => {
  // 쿠키를주다
  done(null, user);
});

passport.deserializeUser((user, done) => {
  // 쿠키를 해독하다
  done(null, user);
});
