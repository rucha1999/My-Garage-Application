
const express = require('express');
const router = express.Router();
const data = require('../data');
const garagedata = data.garages;
//const userData = data.users;
const { ObjectId } = require('mongodb');
const { createAppointment, deleteAppointment, getAllAppointments, getAllAppointmentsByGarage, getAllAppointmentsByUser, getAllAppointmentsByUserAndGarage, getAppointmentById } = require('../data/appointments');
const { getGarageByOwner, getgarage } = require('../data/garages');

let serviceType = ['pickuppart', 'maintainance', 'delivercar'];
serviceType.sort();

// Route for the page of all garages
router.get('/garage_list', async (req, res) => {
    const garages = await garagedata.getAllgarages();
    res.render('garage_list', { 
        'authenticated': req.session.user ? true : false,
        'user': req.session.user,
        'title': 'All Garages',
        'garages': garages,
        'user_email': req.session.email,
        'isOwner': req.session.isOwner,
        'logged_in': req.session.user
    });
});

router
  .route('/info/:id')
  .get(async (req, res) => {
    console.log(req.params);
    let garage_id = req.params.id;
    if (!garage_id) {
      res.status(404).redirect('/');
    } else {
      if(!ObjectId.isValid(garage_id)){
        res.status(404).redirect('/');
      } else {
        let garageTemp = await getgarage(garage_id);
        let appointmentsTemp = '';
        if(req.session.user_id) {
          appointmentsTemp = await getAllAppointmentsByUserAndGarage(req.session.user_id, garage_id);
        }
        let inventoryTemp = garageTemp.inventory;
        let servicesTemp = garageTemp.serviceOptions;
        res.render('garage_info', {'title': 'Garage Info', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'appointments': appointmentsTemp, 'garage': garageTemp, 'cur_user': req.session.user_id, 'user_email': req.session.email, 'inventory': inventoryTemp, 'services': servicesTemp});
      }
    }
  });

router
  .route('/management')
  .get(async (req, res) => {
    //code here for GET
    if (!req.session.isOwner) {
      console.log('in redirect');
      res.redirect('/');
    } else {
      let garageTemp = await getGarageByOwner(req.session.user_id);
      if(!garageTemp) res.redirect('/');

      console.log("Garage Temp:" + garageTemp);
      let appointmentsTemp = await getAllAppointmentsByGarage(garageTemp._id.toString());
      let inventoryTemp = garageTemp.inventory;
      console.log("Appointments Temp: " + appointmentsTemp);
      let monthly_earnings = 0;
      let num_appointments = appointmentsTemp.length;
      for (let i = 0; i < appointmentsTemp.length; i++){
        monthly_earnings += Number(appointmentsTemp[i].total_price);
      }
      let servicesTemp = garageTemp.serviceOptions;
      res.render('garage_management', {'title': 'Garage Management', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'appointments': appointmentsTemp, 'garage': garageTemp, 'user_email': req.session.email, 'inventory': inventoryTemp, 'services': servicesTemp, 'monthly_earnings': monthly_earnings, 'num_appointments': num_appointments});
    }
  });

router
  .route('/create_appointment/:garage_id')
  .get(async (req, res) => {
    //code here for GET
    if (!req.session.user) {
      res.status(403).redirect('/');
    } else {
      let garage_id = req.params.garage_id;
      if (!garage_id) {
        res.status(404).redirect('/');
      } else {
        if(!ObjectId.isValid(garage_id)){
          res.status(404).redirect('/');
        } else {
          let garageTemp = await getgarage(garage_id);
          let services = garageTemp.serviceOptions;
          res.render('create_appointment', {'title': 'Create Appointment', 'isOwner': req.session.isOwner, 'logged_in': req.session.user, 'garage': garageTemp, 'services': services, 'cur_user': req.session.user_id, 'user_email': req.session.email });
        }
      }
    }
  })
  .post(async (req, res) => {
      try {
          console.log(req.body)
          if (!req.session.user) {
            res.status(403).redirect('/');
          } else {
            console.log(req.params);
            let spaghetti = await createAppointment(req.session.user_id, req.params.garage_id, req.body.dateInput, req.body.timeInput, req.body.serviceInput, req.body.priceInput);
            console.log(spaghetti);
            res.redirect('/garage/info/' + req.params.garage_id);
          }
      }
      catch (e) {
          console.log(e);
      }
    });   
router
  .route('/delete_appointment/:appointment_id')
  .post(async (req, res) => {
    console.log("IN DELETE");
    try {
      if (!req.session.isOwner) {
        res.status(403).redirect('/');
      } else {
        console.log(req.params);
        let appointmentTemp = await getAppointmentById(req.params.appointment_id);
        if (!appointmentTemp) {
          console.log(" no appointment temp");
          res.status(400).redirect('/');
        } else {
          let tempGarage = await getgarage(appointmentTemp.garage_id);
          if (!tempGarage) {
            console.log("no temp garage");
            res.status(403).redirect('/');
          } else {
            if (tempGarage.ownerid != req.session.user_id) {
              console.log("owner id not same as session userid");
              res.status(403).redirect('/');
            } else {
              console.log("before delete");
              let deleteAppt = await deleteAppointment(req.params.appointment_id);
              console.log("after delete");
              res.redirect('/garage/management');
            }
          }
          
        }
      }
    }
    catch (e) {
      console.log(e);
    }
  });


module.exports = router;