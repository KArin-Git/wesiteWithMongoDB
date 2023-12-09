/*********************************************************************************
Assignment 5
* I declare that this assignment is my own work in accordance with Seneca Academic Policy.
* No part of this assignment has been copied manually or electronically from any other source
* (including web sites) or distributed to other students.
*
* Name: Bussarin Apichitchon
* Student ID: 11 94 75 226
* Email: bapichitchon@myseneca.ca
* Section: NBB
* Date: Oct 2023
* Published URL: https://wild-colt-fashion.cyclic.app
********************************************************************************/
const legoData = require("./modules/legoSets");
const path = require("path");

const express = require('express');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

// Middleware for handling form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
  res.render("home")
});

app.get('/about', (req, res) => {
  res.render("about");
});

app.get("/lego/sets", async (req,res)=>{

  let sets = [];

  try{    
    if(req.query.theme){
      sets = await legoData.getSetsByTheme(req.query.theme);
    }else{
      sets = await legoData.getAllSets();
    }

    res.render("sets", {sets})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
  
});

app.get("/lego/sets/:num", async (req,res)=>{
  try{
    let set = await legoData.getSetByNum(req.params.num);
    res.render("set", {set})
  }catch(err){
    res.status(404).render("404", {message: err});
  }
});

// GET route for serving the "/lego/addSet" view
app.get('/lego/addSet', async (req, res) => {
    try {
      // Make a request to getAllThemes() function (to be added later in legoSets.js)
      const themes = await legoData.getAllThemes();
  
      // Render the "addSet" view with themes
      res.render('addSet', { themes: themes });
    } catch (err) {
      // Handle errors, for example, render a 500 view with an error message
      res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

// POST route for processing the form data from "/lego/addSet"
app.post('/lego/addSet', async (req, res) => {
    try {
      // Make a request to addSet(setData) function (to be added later in legoSets.js)
      await legoData.addSet(req.body);
  
      // Redirect the user to the "/lego/sets" route upon success
      res.redirect('/lego/sets');
    } catch (err) {
      // Handle errors, for example, render a 500 view with an error message
      res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

// GET route for serving the "/lego/editSet" view
app.get('/lego/editSet/:num', async (req, res) => {
    try {
      // Make a request to getSetByNum(setNum) function with the value from the num route parameter
      const setNum = req.params.num;
      const set = await legoData.getSetByNum(setNum);
  
      // Make a request to getAllThemes() function to retrieve an array of theme data
      const themes = await legoData.getAllThemes();
  
      // Render the "edit" view with theme data and set data
      res.render('editSet', { themes: themes, set: set });
    } catch (err) {
      // Handle errors, for example, render a 404 view with an error message
      res.status(404).render('404', { message: err });
    }
});

// POST route for processing the form data from "/lego/editSet"
app.post('/lego/editSet', async (req, res) => {
    try {
      // Make a request to editSet(set_num, setData) function (to be added later in legoSets.js module)
      const setNum = req.body.set_num;
      const setData = req.body;
      await legoData.editSet(setNum, setData);
  
      // Redirect the user to the "/lego/sets" route upon success
      res.redirect('/lego/sets');
    } catch (err) {
      // Handle errors, for example, render a 500 view with an error message
      res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.get('/lego/deleteSet/:num', async (req, res) => {
    try {
      const setNum = req.params.num;
  
      // Call the deleteSet function to delete the set with the provided set_num
      await legoData.deleteSet(setNum);
  
      // Redirect the user to the "/lego/sets" route upon successful deletion
      res.redirect('/lego/sets');
    } catch (err) {
      // If an error occurs, render the "500" view with an appropriate message
      res.status(500).render('500', { message: `I'm sorry, but we have encountered the following error: ${err}` });
    }
});

app.use((req, res, next) => {
  res.status(404).render("404", {message: "I'm sorry, we're unable to find what you're looking for"});
});

legoData.initialize().then(()=>{
  app.listen(HTTP_PORT, () => { console.log(`server listening on: ${HTTP_PORT}`) });
});
