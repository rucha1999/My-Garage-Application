const express = require('express');
const router = express.Router();
const path = require('path');
const data = require('../data');
const { getGarageByOwner, getgarage } = require('../data/garages');
const { checkUser, createUser, getUserByEmail, getUserById, setfavbyid, updateUser } = require('../data/users');
const garageData = data.get;
const { ObjectId } = require('mongodb');


router
  .route('/login')
  .post(async (req, res) => {
    //code here for POST
    const email = req.body.emailInput;
    const password = req.body.passwordInput;
    try {
        if (!email) throw "No email provided";
        if (!password) throw "No password provided";

        // email

        if (typeof(email) != 'string') throw "email not string";
        let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email.trim())) throw "not valid email";
        const emailToSubmit = email.trim().toLowerCase();

        // password

        if (typeof(password) != 'string') throw "Password not string";
        var passTest = /^\S*$/.test(password);
        if (!passTest) throw "Space in password. Not allowed."
        if (password.length < 6) throw "Password less than 6 char long."


        passTest = /(?=.*[A-Z])(?=.*\d)(?=.*\W)/.test(password);
        if (!passTest) throw "Password must have uppercase letter, digit, and special character."

        const loginCheck = await checkUser(emailToSubmit, password);
        if (loginCheck.authenticatedUser == true) {
            const tempUser = await getUserByEmail(emailToSubmit);
            req.session.user = tempUser;
            req.session.email = tempUser.email;
            req.session.user_id = tempUser._id;
            const ownerTest = await getGarageByOwner(tempUser._id.toString());
            if (ownerTest) {
                req.session.isOwner = true;
            }
            res.redirect('/');
        } else {
            res.render('login', {'title': 'Login', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'error': "Invalid email pass combo", 'user_email': req.session.email,})
        }
    }
    catch (e) {
        console.log(e);
        res.status(400).render('login', {'title': 'Login', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'error': e});
    }
  })

router.route('/register').post(async (req, res) => {
    const email = req.body.emailInput;
    const password = req.body.passwordInput;
    const name = req.body.nameInput;

    console.log("start of func");
    try {
        if (!name) throw "No name provided";
        if (!password) throw "No password provided";
        if (!email) throw "No email provided";
        // name
  
        if (typeof(name) != 'string') throw "name not string";
        let nameRegex = /([A-Za-z]+[ ][A-Za-z]+)/;
        if (!nameRegex.test(name.trim())) throw "name not in correct form"

        // email

        if (typeof(email) != 'string') throw "email not string";
        let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
        if (!emailRegex.test(email.trim())) throw "not valid email";
        const emailToSubmit = email.trim().toLowerCase();

        // password

        if (typeof(password) != 'string') throw "Password not string";
        var passTest = /^\S*$/.test(password);
        if (!passTest) throw "Space in password. Not allowed."
        if (password.length < 6) throw "Password less than 6 char long."

        passTest = /(?=.*[A-Z])(?=.*\d)(?=.*\W)/.test(password);
        if (!passTest) throw "Password must have uppercase letter, digit, and special character."
  
        const registerCheck = await createUser(name.trim().toLowerCase(), emailToSubmit, password);
        if (registerCheck) {
            console.log("redirecting to login?");
            res.redirect('/login'); 
        } else {
          res.status(500).send("Internal Server Error");
        }
      }
      catch (e) {
        res.status(400).render('register', {'title': 'Login', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'error': e});
      }
})

router.get('/logout', async (req, res) => {
    req.session.destroy();
    //res.send('Logged out');
    console.log('redirecting to Homepage');
    res.redirect('/'); 
});

router
    .route('/user_profile')
    .get(async (req, res) => {
        if (!req.session.user) {
            res.status(401).redirect('/');
        } else {
            res.render('userProfile', {'title': 'Profile', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'user_email': req.session.email, 'user': req.session.user});
        }
    });

router
    .route('/user_profile/edit')
    .get(async (req, res) => {
        if (!req.session.user) {
            res.status(401).redirect('/');
        } else {
            res.render('userProfileEdit', {'title': 'Profile', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'user_email': req.session.email, 'user': req.session.user});
        }
    })
    .post(async (req, res) => {
        try {
            console.log("body: " + req.body)
            if (!req.session.user) {
              res.status(401).redirect('/');
            } else {
                try {

                    let name = req.body.nameInput;
                    let email = req.body.emailInput;
                    let description = req.body.descriptionInput;
                    let vehicles =  req.body.vehicleInput;

                    if (!name) throw "No name provided";
                    if (typeof(name) != 'string') throw "name not string";
                    let nameRegex = /([A-Za-z]+[ ][A-Za-z]+)/;
                    if (!nameRegex.test(name.trim())) throw "name not in correct form firstname lastname"

                    if (typeof(email) != 'string') throw "email not string";
                    let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
                    if (!emailRegex.test(email.trim())) throw "not valid email";
                    const emailToSubmit = email.trim().toLowerCase();

                    if (description) {
                        if (typeof(description) != 'string') throw "desc not string"
                        if (description.trim().length > 140) throw "desc too long" 
                    }
                    if (vehicles) {
                        if (typeof(vehicles) != 'string') throw "vehicles desc not string"
                        if (vehicles.trim().length > 140) throw "vehicles desc too long" 
                    }
                    let updatedUser = await updateUser(req.session.user._id, req.body.nameInput, req.body.emailInput, req.body.descriptionInput, req.body.vehicleInput);                
                    if (updatedUser) {
                        req.session.user = updatedUser;
                        req.session.email = updatedUser.email;
                        req.session.user_id = updatedUser._id;
                        res.redirect('/users/user_profile');
                    }
                } catch (e) {
                    console.log(e);
                    res.status(404).redirect('/users/user_profile');
                }
                
            }
        }
        catch (e) {
            console.log(e);
        }
    });

router
    .route('/favorite/:garage_id')
    .post(async (req, res) => {
        if (!req.session.user) {
            res.status(401).redirect('/');          
        } else {
            let garage_id = req.params.garage_id;
            let user_id = req.session.user_id
            if (!garage_id) {
                res.status(404).redirect('/');
            } else {
                if(!ObjectId.isValid(garage_id)){
                  res.status(404).redirect('/');
                } else {
                  let garageTemp = await getgarage(garage_id);
                  if(garageTemp){
                    let user = await setfavbyid(garageTemp,user_id)
                    if(user) {
                      req.session.user = user
                      res.redirect("/users/user_profile")    
                    }
                  }
                }
              }
            }
          })

module.exports = router;
