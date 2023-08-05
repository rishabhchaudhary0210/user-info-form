
// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-storage.js";
//   import "/firebase/firestore";


// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: "AIzaSyAcWlGljmtLhXdZkUcnngLCVhiyaCyyfWc",
  authDomain: "user-info-form-888ab.firebaseapp.com",
  projectId: "user-info-form-888ab",
  storageBucket: "user-info-form-888ab.appspot.com",
  messagingSenderId: "194155569399",
  appId: "1:194155569399:web:99075f11cb5707bd2633f2",
  measurementId: "G-9D3TPLESQV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);


//   const db = await firebase.firestore();
const db = getFirestore(app);
const storage = getStorage(app);
// const storageRef = ref(storage);

const form = document.querySelector("form");
const uploadFire = document.querySelector(".uploadFire");
const uploadLocal = document.querySelector(".uploadLocal");

const button = document.querySelector(".btn");
const photo = document.querySelector("#photo");

// const parentContainer = JSON.parse(localStorage.getItem("parentKey"));

const userObject = {
  // uid:"",
  uname: "",
  phone: "",
  email: "",
  dob: "",
  photo: ""
};



form?.addEventListener("change", (e) => {
  let ele = e.target;
  userObject[ele.name] = ele.value;
})

form?.addEventListener("submit", (event)=>{
})

let file;
const profilePhoto = document.querySelector("#profile-photo");
photo?.addEventListener("change", (e) => {
  file = e.target.files[0];
  profilePhoto.src = URL.createObjectURL(e.target.files[0]);
  userObject.photo = file.name;
})

uploadFire?.addEventListener("click", () => sendData());
async function sendData() {
  try {
    const docRef = await addDoc(collection(db, "users"), userObject);
    if (userObject.photo !== "") {
      const imageUploding = await uploadImage(docRef.id);
    }
    console.log("Document written with ID: ", docRef.id);
    // localStorage.setItem("dbStorageID", docRef.id);
    // console.log(userObject);

  } catch (e) {
    console.error("Error adding document: ", e);
  }
}

uploadLocal?.addEventListener("click", () => sendLocal());
function sendLocal() {
  // const arr = Object.keys(userObject);
  const {photo, ...obj} = userObject;
  let id = localStorage.getItem("id") ? Number(localStorage.getItem("id")) : 100;
  localStorage.setItem(id+1, JSON.stringify(obj));
  localStorage.setItem("id", id+1);
}

async function uploadImage(id) {
  const storageRef = ref(storage, 'images/' + file.name);
  const uploadTask = uploadBytesResumable(storageRef, file);
  uploadTask.on('state_changed',
    (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      switch (snapshot.state) {
        case 'paused':
          console.log('Upload is paused');
          break;
        case 'running':
          console.log('Upload is running');
          break;
      }
    },
    (error) => {
      console.log(error);
    },
    async () => {
      // Upload completed successfully, now we can get the download URL
      await getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
        console.log('File available at', downloadURL);
        userObject.photo = downloadURL;
        await updateDoc(doc(db, "users", id), {
          photo: downloadURL
        })
      });
    }
  );
}


const localBtn = document.querySelector('.localBtn');
const localDisplay = document.querySelector('.localDisplay');
localBtn?.addEventListener('click',()=>{
  
  for(var i=0; i<localStorage.length; i++){
    let key = Number(localStorage.key(i));
    if(localStorage.key(i) == key){
      let localObj = JSON.parse(localStorage.getItem(key));
      console.log(localObj);       
      let ele = document.createElement('div');
      ele.innerHTML = 
      ` 
      <div>
        <ul>
          <li>Name:  ${localObj.uname}</li>
          <li>Phone:  ${localObj.phone}</li>
          <li>Email:  ${localObj.email}</li>
          <li>D.O.B.  ${localObj.dob}</li>
        </ul>
        <button class="editBtn">Edit</button>
        <button class="delBtn">Delete</button>
      </div>
        <hr>`
      localDisplay?.appendChild(ele);
    }
  }


})

const fireBtn = document.querySelector('.fireBtn');
const fireDisplay = document.querySelector('.fireDisplay');
fireBtn?.addEventListener("click", async (e) => {
  const querySnapshot = await getDocs(collection(db, "users"));
  querySnapshot.forEach(async (doc) => {
    console.log(doc.id, doc.data());
    const {uname, phone, email, dob, photo} = await doc.data();
    let ele = document.createElement('div');
    ele.innerHTML = 
    ` 
    <img class="profileImg" src=${photo} alt=${uname}>
    <div>
<ul>
    <li>Name:  ${uname}</li>
    <li>Phone:  ${phone}</li>
    <li>Email:  ${email}</li>
    <li>D.O.B.  ${dob}</li>
    </ul>
    <button class="editBtn">Edit</button>
        <button class="delBtn">Delete</button>
    </div>
      <hr>`
    fireDisplay?.appendChild(ele);
  });

})
