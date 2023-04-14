const mongoCollections = require('../config/mongoCollections');
const appointments = mongoCollections.appointments;
const userCol = mongoCollections.users;
const garageCol = mongoCollections.garages;
const { ObjectId } = require('mongodb');
const { getUserById } = require('./users');

// Appointments collection:
// - _id
// - user_id
// - garage_id
// - date_time
// - services
// - total_price

const getAllAppointments = async () => {
  const appointmentCollection = await appointments();

  const appointmentList = await appointmentCollection.find({}).toArray();
  // console.log(appointmentList);
  return appointmentList;
}

const getAllAppointmentsByUser = async(id) => {
  const appointmentCollection = await appointments();

  if (!id) throw "no id given";
  if (typeof(id) != 'string') throw "id not string";
  if (!ObjectId.isValid(id)) throw "Id is not a valid ObjectId";

  const appointmentList = await appointmentCollection.find({ user_id: id }).toArray();
  return appointmentList;
}

const getAppointmentById = async(id) => {
  const appointmentCollection = await appointments();

  if (!id) throw "no id given";
  if (typeof(id) != 'string') throw "id not string";
  if (!ObjectId.isValid(id)) throw "Id is not a valid ObjectId";

  let idPass = ObjectId(id);
  const appointment = await appointmentCollection.findOne({ _id: idPass });
  return appointment;
}

const getAllAppointmentsByGarage = async(id) => {
  const appointmentCollection = await appointments();

  if (!id) throw "no id given";
  if (typeof(id) != 'string') throw "id not string";
  if (!ObjectId.isValid(id)) throw "Id is not a valid ObjectId";

  const appointmentList = await appointmentCollection.find({ garage_id: id }).toArray();
  return appointmentList;
}

const getAllAppointmentsByUserAndGarage = async(user_id, garage_id) => {
  const appointmentCollection = await appointments();

  if (!user_id) throw "no user id given";
  if (typeof(user_id) != 'string') throw "user id not string";
  if (!ObjectId.isValid(user_id)) throw "user id is not a valid ObjectId";

  if (!garage_id) throw "no garage id given";
  if (typeof(garage_id) != 'string') throw "garage id not string";
  if (!ObjectId.isValid(garage_id)) throw "garage Id is not a valid ObjectId";

  const appointmentList = await appointmentCollection.find({user_id: user_id, garage_id: garage_id }).toArray();
  return appointmentList;
}


const createAppointment = async (
    user_id,
    garage_id,
    date,
    time,
    service,
    total_price
) => {
    if (!user_id) throw "No user_id";
    if (!garage_id) throw "No garage_id";
    if (!date) throw "No date";
    if (!time) throw "No time";
    if (!service) throw "No service";

    console.log("TIME:" + time);

    if (typeof(user_id) != 'string') throw "user_id not string";
    if (typeof(garage_id) != 'string') throw "garage_id not string";
    if (typeof(date) != 'string') throw "date_time not string";
    if (typeof(time) != 'string') throw "date_time not string";
    if (typeof(service) != 'string') throw "service not string";
    if (typeof(total_price) != 'string') throw "total_price not string";

    if (!ObjectId.isValid(user_id)) throw "user id not valid objectid";
    if (!ObjectId.isValid(garage_id)) throw "garage id not valid objectid";

    const userCollection = await userCol();
    const garageCollection = await garageCol();
    let tempUser = await userCollection.findOne({_id: ObjectId(user_id)});
    let tempGarage = await garageCollection.findOne({_id: ObjectId(garage_id)});
    if(!tempUser) {
      throw "user not found in DB";
    }
    if (!tempGarage) {
      throw "garage not found in DB";
    }

    let test_date = new Date(date);
    if (!test_date.getTime()) throw "invalid Date string";

    let timeRegex = /([01]?[0-9]|2[0-3]):[0-5][0-9]/;
    if (!timeRegex.test(time)) throw "time not valid";

    if (service.trim().length == 0) throw "empty service str";

    console.log(total_price);
    let price_regex = /^[0-9]+(,[0-9]{3})*(\.[0-9]{1,2})?$/;
    if(!price_regex.test(total_price)) throw "price invalid";

    if (time < '06:00' || time > '17:00') {
      throw "time out of range"
    }
  
    const appointmentCollection = await appointments();

    let temp_user = await getUserById(user_id);
    let user_name = temp_user.name;

    let new_appt = {
        user_id: user_id,
        garage_id: garage_id,
        date: date,
        time: time,
        service: service,
        total_price: total_price,
        user_name: user_name
      };
  
      const insertInfo = await appointmentCollection.insertOne(new_appt);
      if (insertInfo.insertedCount === 0) 
        throw 'Could not add new appointment';
  
      const newId = insertInfo.insertedId;
      
      let monthly_earningsTemp = tempGarage.monthly_earnings;
      monthly_earningsTemp += Number(total_price);
      let updatedInfo = await garageCollection.updateOne({_id: tempGarage._id}, {$set: {
        monthly_earnings: monthly_earningsTemp
      }});
    
      if (updatedInfo.modifiedCount === 0) {
        console.log("No details changed");
      }

      const appointment = await newId.toString();
      return appointment;
};

const deleteAppointment = async (apptId) => {
    if (!apptId) throw 'You must provide an id to search for';
    if (typeof(apptId) != 'string') throw 'Id must be a string.';
    if (apptId.trim().length == 0) throw "Id must not be empty string";
  
    if (!ObjectId.isValid(apptId)) throw "Id is not a valid ObjectId";
    
    const idPass = ObjectId(apptId);
  
    const appointmentCollection = await appointments();
    const deletionInfo = await appointmentCollection.deleteOne({_id: idPass});
    if (deletionInfo.deletedCount === 0) {
      throw `Could not delete appointment with id of ${apptId}`;
    }
    return `Successful deletion of appointment`
  };
  
  module.exports = {
    createAppointment,
    deleteAppointment,
    getAllAppointments,
    getAllAppointmentsByUserAndGarage,
    getAllAppointmentsByGarage,
    getAllAppointmentsByUser,
    getAppointmentById
  };
  