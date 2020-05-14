/* eslint-disable no-underscore-dangle */
/* eslint-disable consistent-return */
/* eslint-disable camelcase */
/* eslint-disable no-unused-vars */
import path from "path";
import passport from "passport";
import routes from "../routes";
import User from "../models/User";
import Video from "../models/Video";
import Likey from "../models/Likey";

export const getJoin = (req, res) => {
  res.render("join", { pageTitle: "join" });
};
export const postJoin = async (req, res, next) => {
  const {
    body: { name, email, password, password2 }
  } = req;
  if (password !== password2) {
    req.flash("error", "Passwords don't match");
    res.status(400);
    res.render("join", { pageTitle: "Join" });
  } else {
    try {

      if( await User.findOne({email}) ){
        req.flash("error", "This email already existed.");
        console.log("이미 같은 이메일이 존재합니다.");
        res.status(400);
        throw ValueError();
      }


      const user = await User({
        name,
        email
      });
      await User.register(user, password);
      next();
    } catch (error) {
      console.log(error);
      res.redirect(routes.home);
    }
  }
};

export const getLogin = (req, res) => {
  res.render("login", { pageTitle: "login" });
};

export const postLogin = passport.authenticate("local", {
  failureRedirect: routes.login,
  successRedirect: routes.home,
  successFalsh: "Welcome",
  failureFlash: "Can't log in. Check email or password"
});

export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);
  if(user){
    console.log(user)
    res.render("userDetail", { pageTitle: "User Detail", user });
  }else{
    res.redirect(routes.home);
  }
};

export const logout = (req, res) => {
  req.flash("info", "Logged out, see you later");
  req.logout();
  res.redirect(routes.home);
};
export const users = (req, res) => {
  res.render("users", { pageTitle: "users" });
};
export const userDetail = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const user = await User.findById(id).populate("videos");

    const user_video_likeys = await Likey.find({creator: user._id});

    // console.log(user);
    res.render("userDetail", { pageTitle: "User Detail", user, user_video_likeys });
  } catch (error) {
    console.log(error);
    req.flash("error", "User not found");
    res.redirect(routes.home);
  }
};

export const getEditProfile = async (req, res) => {
  const id = req.user._id;
  try{
    const user = await User.findById(id);
    res.render("editProfile", { pageTitle: "Edit Profile", user });
  }catch(error){
    console.log(error);
    res.redirect(routes.home);
  }
  
};
export const postEditProfile = async (req, res) => {
  const {
    body: { name, email },
    user
  } = req;
  try {
    await User.findByIdAndUpdate(user._id, {
      name,
      email
      // // aws사용할떄는 path가 아니라 location임.
      // avatarUrl: file ? file.location : req.user.avatarUrl
    });
    req.flash("success", "Profile updated, Please login again.");
    res.redirect(routes.me);

  } catch (error) {
    req.flash("error", "Can't update profile");
    console.log(error);
    res.render("editProfile", { pageTitle: "Edit Profile" });
  }
};

export const getChangePassword = (req, res) => {
  res.render("changePassword", { pageTitle: "changePassword" });
};
export const postChangePassword = async (req, res) => {
  const {
    body: { oldPassword, newPassword, newPassword2 }
  } = req;

  try {
    if (newPassword !== newPassword2) {
      req.flash("error", "Passwords don't match");
      res.status(400);
      res.redirect(`/users${routes.changePassword}`);
      return;
    }
    const user = await User.findById(req.user._id);
    await user.changePassword(oldPassword, newPassword);
    res.redirect(routes.me);
  } catch (error) {
    console.log(error);
    req.flash("error", "Can't change password");
    res.status(400);
    res.redirect(`/users${routes.changePassword}`);
  }
};

export const postAddLikey = async (req, res) => {
  const {
    params: { id },
    body: { data },
    user
  } = req;

  try {
    const video = await Video.findById(id);

    const likeys = await Likey.findOne({
        video: id,
        creator: user._id
    });
    let already_expressed = likeys ? true : false;
    

    if(already_expressed){
      // 이미 좋아요 했었으므로 data만 변경
      // console.log("이미 좋아요 했었음")
      await Likey.findOneAndRemove({_id: likeys._id});
      
  
    }else{
      // console.log("좋아요 처음 누르는 거임")

      const newLikey = await Likey.create({
        isFavorite: data,
        creator: user._id,
        video: video._id,
        creator: user._id
      });
      newLikey.save();
    }

  } catch (error) {
    console.log(error);
    res.status(400);
  } finally {
    res.end();
  }
}

