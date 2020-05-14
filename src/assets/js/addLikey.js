import axios from "axios";

const addLikey = document.getElementById("jsAddLikey");
const likeyNumber = document.getElementById("jsLikeyNumber");

const increaseNumber = () => {
    likeyNumber.innerHTML = parseInt(likeyNumber.innerHTML, 10) + 1;
};
const decreaseNumber = () => {
    likeyNumber.innerHTML = parseInt(likeyNumber.innerHTML, 10) - 1;
}


const sendLikeyInfo = async data => {

    try{

        const videoId = window.location.href.split("/videos/")[1];
        console.log(videoId);


        if(data=="like"){
            increaseNumber();
        }else if(data=="unlike"){
            decreaseNumber();
        }else{
          throw "Value Error";
        }
    
      const response = await axios({
        url: `/api/${videoId}/likey`,
        method: "POST",
        data: {
          data
        }
      });
    
    } catch(error){
        console.log(error);
    }
  
};

const handleClick = event => {
  event.preventDefault();

  if ( document.getElementById("isLikey").classList.contains('far') ){
    document.getElementById("isLikey").classList.remove('far');
    document.getElementById("isLikey").classList.add('fas');
      sendLikeyInfo("like");

  }else{
    document.getElementById("isLikey").classList.remove('fas');
    document.getElementById("isLikey").classList.add('far');
      sendLikeyInfo("unlike");
  }


  

//   const commentInput = addLikey.querySelector("input");
//   const comment = commentInput.value;

//   commentInput.value = "";
};

function init() {
    jsAddLikey.addEventListener("click", handleClick);
}

if (addLikey) {
  init();
}
