import multer from "multer";
import multerS3 from "multer-s3";
import aws from "aws-sdk";
import routes from "./routes";

export const s3 = new aws.S3({
  accessKeyId: process.env.AWS_KEY,
  secretAccessKey: process.env.AWS_PRIVATE_KEY,
  region: process.env.AWS_REGION
});

// const multerVideo = multer({ dest: "uploads/videos/" });
// const multerAvatar = multer({ dest: "uploads/avatars/" });
const multerVideo = multer({
  storage: multerS3({
    s3,
    acl: "public-read",
    bucket: `${process.env.BUCKET_NAME}/video` //  aws의 버킷을 미리 생성해놓은 상태여야함.
    ,
    // 원본파일명으로 파일등록하려면 활성화 (원본으로안하면 colab에서 인식불가?)
    key: (req, file, cb) => {cb(null, Date.now()+file.originalname)},
    limits: { fileSize: 5 * 1024 * 1024 }, // 용량 제한 5MB
  })
});
// const multerAvatar = multer({
//   s3,
//   acl: "public-read",
//   bucket: `${process.env.BUCKET_NAME}/avatar` //  aws의 버킷을 미리 생성해놓은 상태여야함.
// });

export const uploadVideo = multerVideo.single("videoFile");
// export const uploadAvatar = multerAvatar.single("avatar");

export const localsMiddleware = (req, res, next) => {
  res.locals.siteName = "Deeptube";
  res.locals.routes = routes;
  res.locals.loggedUser = req.user || null;
  // console.log(req.user);
  next();
};

export const onlyPublic = (req, res, next) => {
  if (req.user) {
    res.redirect(routes.home);
  } else {
    next();
  }
};

export const onlyPrivate = (req, res, next) => {
  if (req.user) {
    next();
  } else {
    res.redirect(routes.home);
  }
};

