/* eslint-disable no-underscore-dangle */
import routes from "../routes";
import Video from "../models/Video";
import Comment from "../models/Comment";
import User from "../models/User";
import Likey from "../models/Likey";
import aws from "aws-sdk";
import { s3 } from "../middlewares";
import {spawn} from "child_process";
import rmrf from "spawn-rmrf";
import fs from "fs";
// import rimraf from "rimraf";
// import axios from "axios";
// import fetch from "node-fetch";
// import saveAs from "file-saver";
// import jsdom from "jsdom";
// Home

export const home = async (req, res) => {
  try {
    const videos = await Video.find({}).sort({ _id: -1 })
    // console.log(videos)
    res.render("home", { pageTitle: "Home", videos });
  } catch (error) {
    // console.log("home");
    console.log(error);
    res.render("home", { pageTitle: "Home", videos: [] });
  }
};

// Search

export const search = async (req, res) => {
  const {
    query: { term: searchingBy }
  } = req;
  let videos = [];
  try {
    videos = await Video.find({
      title: { $regex: searchingBy, $options: "i" }
    });
  } catch (error) {
    console.log("search");
    console.log(error);
  }
  res.render("search", { pageTitle: "Search", searchingBy, videos });
};

// Video Detail

export const videoDetail = async (req, res) => {
  const {
    params: { id },
    user
  } = req;

  try {
    const video = await Video.findById(id);
    
    const current_video_comments = await Comment.find({
      video: id
    });

    const current_video_likeys = await Likey.find({
      video: id
    });
    let expressed = (await Likey.findOne({video: id, creator:user._id})) ? true : false;

    res.render("videoDetail", { pageTitle: video.title, video, expressed, current_video_likeys, user, current_video_comments });
  } catch (error) {
    console.log(error);
    res.redirect(routes.home);
  }
};


// Upload
export const getUpload = (req, res) =>
  res.render("upload", { pageTitle: "Upload" });

export const postUpload = async (req, res) => {

  const {
    body: { title, description },
    file: { location } // path,  aws사용할떄는 path가 아니라 location임.
  } = req;

  try {
    const newVideo = await Video.create({
      fileUrl: location,
      title,
      description,
      creator: req.user._id
    });

    res.redirect(routes.videoDetail(newVideo.id));

  } catch (error) {
    console.log(error);
    res.redirect(`/videos${routes.upload}`);
  }
};

// Edit Video

export const getEditVideo = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const video = await Video.findById(id);
    // console.log(String(video.creator));
    // console.log(req.user.id);
    if (String(video.creator) !== String(id)) {
      throw Error();
    } else {
      res.render("editVideo", { pageTitle: `Edit ${video.title}`, video });
    }
  } catch (error) {
    console.log("getEditVideo");
    res.redirect(routes.home);
  }
};

export const postEditVideo = async (req, res) => {
  const {
    params: { id },
    body: { title, description }
  } = req;
  try {
    await Video.findOneAndUpdate({ _id: id }, { title, description });
    res.redirect(routes.videoDetail(id));
  } catch (error) {
    console.log("postEditVideo");
    res.redirect(routes.home);
  }
};

// Delete Video

export const deleteVideo = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {

  const video = await Video.findById(id)
  const url = video.fileUrl.split('/')
  const delFileName = url[url.length - 1]
  const params = {
    Bucket: `${process.env.BUCKET_NAME}/video`,
    Key: delFileName
  }
  await s3.deleteObject(params, function(err, data) {
    if (err) {
      console.log('aws video delete error')
      console.log(err, err.stack)
      res.redirect(routes.home)
    } else {
      console.log('aws video delete success' + data)
    }
  })

    if (String(video.creator) !== String(req.user._id)) {
      throw Error();
    } else {

      // On delete cascade
      await Comment.remove({ video: id }, (err) => {if(err){throw Error();}});
      await Likey.remove({ video: id }, (err) => {if(err){throw Error();}});
      await Video.findOneAndRemove({ _id: id });
    }
  } catch (error) {
    console.log("deleteVideo");
    console.log(error);
  }
  res.redirect(routes.home);
};

// Register Video View

export const postRegisterView = async (req, res) => {
  const {
    params: { id }
  } = req;
  try {
    const video = await Video.findById(id);
    video.views += 1;
    video.save();
    res.status(200);
  } catch (error) {
    console.log("postRegisterView");
    res.status(400);
  } finally {
    res.end();
  }
};

// Add Comment

export const postAddComment = async (req, res) => {
  const {
    params: { id },
    body: { comment },
    user
  } = req;

  try {
    const video = await Video.findById(id);
    const newComment = await Comment.create({
      text: comment,
      creator: user._id,
      video: video._id
    });
    newComment.save();
    res.redirect(routes.videoDetail(id));
  } catch (error) {
    console.log("postAddComment");
    console.log(error);
    res.status(400);
  } finally {
    res.end();
  }
};

export const local_video_downloader = async (req, res) => {
  // const file = `${__dirname}/upload-folder/dramaticpenguin.MOV`;
  // res.download(file); // Set disposition and send it.
  const {
    params: {title}
  } = req;
  const file = __dirname.slice(0,-17)+title;
  // console.log(req);
  // __dirname ; /home/fullstackmachinelearning/Graduate-Project-DeepTube-/build/controllers
  try{
    
    // await res.sendFile(file);
    // console.log(__dirname);
    // console.log(__dirname+"/"+title);
    // await res.download(__dirname+"/"+title);
    // fs.unlinkSync(__dirname+"/"+title);
    // rimraf(file, () => console.log('remove done'));

    res.download(file , (err) => {
      if (!err) {
        fs.unlink(file, (err) => {
          if(err){console.log(err);}
          else{console.log("Complete.")}
        });
      }
    });

  
  }catch (error) {
    req.flash("error", "Convert failed. Try again.");
    console.log(error);
    res.redirect(routes.home);
  }
}


  // python demo.py  
  // --config config/dataset_name.yaml
  // --driving_video path/to/driving
  // --source_image path/to/source
  // --checkpoint path/to/checkpoint
  // --relative
  // --adapt_scale

export const python_runner = async (req, res) => {

  const {
    body: { select_character },
    params: {id}
  } = req;

  try{

  const video = await Video.findById(id);
  
  // console.log(__dirname);

  ///Users/zereight/Desktop/dev/DeepTube/build/controllers
  
  let s = __dirname;
  let main_path = s.slice(0, -17);
  main_path+= "python_module/demo.py";
  let yaml_path = s.slice(0, -17);
  yaml_path+="python_module/config/vox-256.yaml"
  let tar_path = s.slice(0,-17);
  tar_path+="python_module/pre-trained_checkpoint/vox-cpk.pth.tar";

  const newTitle = `${Date.now()}_${video.title}_converted.mp4`;

  const pyFile = main_path;
  
  // console.log(pyFile)

  const args = [
  "--config", yaml_path // `/Users/zereight/Desktop/dev/DeepTube/src/python_module/config/vox-256.yaml`
  ,
  "--driving_video", `${video.fileUrl}`,
  "--source_image", `https://yu21511816-video-storage.s3.ap-northeast-2.amazonaws.com/faces/${select_character}.jpeg`,
  "--checkpoint", tar_path,
  "--result_video", newTitle,
  "--relative", "--adapt_scale"]

  args.unshift(pyFile);

  const pyprog = await spawn('python3', args);

  pyprog.stdout.on('data', function(data) {
    console.log(`data:${data}`);
  });
  pyprog.stderr.on('data', (data) => {
    console.log(`error:${data}`);
  });
  pyprog.stderr.on('close', () => {

    // res.redirect(routes.download(newTitle));
    res.redirect("/videos/download/"+newTitle);
    console.log("Closed");
  });
  }catch (error) {
    console.log(error);
    res.redirect(routes.videoDetail(id));
  }
  
}