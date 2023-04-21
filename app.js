/*      ABOUT THIS PROJECT:
    In this project we want to create a site for audience to subcribe to My Newsletter
    We gonna have 3 html-files which are: 
    + signup.html: For audience to add their infomations
    + success.html: Return when the Subscribing was successed
    + fail.html: Return when not successed
    
    Our main Javascript- File is app.js:
    + Use express to create our own server (app)
    + app.get() creates routes: return signup.html on homepage
    + app.post() takes user-inputs from form-post in html
    + app.listen() lets our server runs on some port   
    + User-inputs was read by body-parser and saved in req.body(.nameInHTML)
    + We create a JSON object from these inputs and then send it through API to Mailchimp to create a Subcribe-list       
    https://mailchimp.com/developer/marketing/api/lists/        */

const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("node:https");

//Extra module to save API-Key
const key = require(__dirname + "/api_key.js");

const app = express();
app.use(express.static("public")); //giup doc relative url trong Folder 'public'
app.use(bodyParser.urlencoded({ extended: true }));

//-----------------------------------------------------
//      SEND HTML FILE TO ENTER NAME& INFOS
//-----------------------------------------------------
app.get("/", function (req, res) {
  res.sendFile(__dirname + "/signup.html");
});

//-----------------------------------------------------
//      INFOS FROM POST(HTML), CREATE JSON
//      AND SEND TO MAILCHIMP THROUGH API
//-----------------------------------------------------
app.post("/", function (req, res) {
  const firstName = req.body.fName;
  const lastName = req.body.lName;
  const email = req.body.email;

  // https://mailchimp.com/developer/marketing/api/list-member-activity-feed/
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName,
          LNAME: lastName,
        },
      },
    ],
  };

  const jsonData = JSON.stringify(data);

  //-------------- PARAMETERS FOR https.request() -------------
  // https://mailchimp.com/developer/marketing/docs/fundamentals/
  const url = "https://us21.api.mailchimp.com/3.0/lists/e2adcc1aa9"; //API-Endpoint/lists/list_id
  const api_Key = key.apiKey();
  const options = {
    method: "POST", //got to be STRING!!!!
    auth: api_Key + "-us21",
  };

  var request = https.request(url, options, function (response) {
    response.on("data", function () {
      console.log("statusCode:", response.statusCode);
      //console.log("headers:", response.headers);
      if (response.statusCode === 200) {
        res.sendFile(__dirname + "/success.html");
      } else {
        res.sendFile(__dirname + "/fail.html");
      }
    });
  });

  request.on("error", function (e) {
    console.error(e);
  });

  request.write(jsonData);
  request.end();
});

app.post("/fail", function (req, res) {
  res.redirect("/");
});

app.listen(3000, function () {
  console.log("Running on Port 3000");
});

