import dotenv from "dotenv";

import mongoose from "mongoose";

dotenv.config();

/* 
mongoDB lab을 사용할때는 유저만들고, 비번설정하고, connect눌러서 ip등록보다는 보안에 모든 ip허용해주고
url복사해서 환경변수로 등록해준다.
샌드박스를 골라서 Free로 사용하며, 데이터등록후 collection을 확인해 보면 데이터가 등록되어있다.
#11.3 볼것.
*/
mongoose.connect(
  process.env.PRODUCTION ? process.env.MONGO_URL_PROD : process.env.MONGO_URL,
  {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  }
);

const db = mongoose.connection;

const handleOpen = () => {
  console.log("✅   Connected to DB");
};
const handleError = error => {
  console.log(`❌   Error on DB, ${error}`);
};

db.once("open", handleOpen);
db.on("errro", handleError);
