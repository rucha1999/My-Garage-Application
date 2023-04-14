const mongoCollections = require('../config/mongoCollections');
const users = mongoCollections.users;
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const saltRounds = 16;

const updateUser = async (id, name, email, desc, vehicle_desc) => {
  
  if (!id) throw "no id given";
  if (typeof(id) != 'string') throw "id not string";
  if (!ObjectId.isValid(id)) throw "Id is not a valid ObjectId";

  console.log(id, name, email, desc, vehicle_desc);
  let idPass = ObjectId(id);
  
  if (!name) throw "no name provided";
  if (!email) throw "no email provided";

  if (typeof(name) != 'string') throw "name not string";
  let nameRegex = /([A-Za-z]+[ ][A-Za-z]+)/;
  if (!nameRegex.test(name.trim())) throw "name not in correct form firstname lastname";

  if (typeof(email) != 'string') throw "email not string";
  let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
  if (!emailRegex.test(email.trim())) throw "not valid email";
  const emailToSubmit = email.trim().toLowerCase();
  let desc_trimmed = '';
  let vehicle_desc_trimmed = '';
  if (desc) {
    if (typeof(desc) != 'string') throw "desc not string";
    if (desc.trim().length > 140) throw "desc too long";
    desc_trimmed = desc.trim();
  }
  if (vehicle_desc) {
    if (typeof(vehicle_desc) != 'string') throw "desc not string";
    if (vehicle_desc.trim().length > 140) throw "vehicle desc too long";
    vehicle_desc_trimmed = vehicle_desc.trim();
  }


  const user_col = await users();
  let updatedInfo = await user_col.updateOne({_id: idPass}, {$set: {
    name: name.trim().toLowerCase(),
    email: emailToSubmit,
    description: desc_trimmed.trim(),
    vehicles: vehicle_desc_trimmed.trim()
  }});

  if (updatedInfo.modifiedCount === 0) {
    console.log("No details changed");
  }

  let user_return = await getUserById(id);
  return user_return;
}

const createUser = async (
    name, email, password
  ) => {
    if (!name) throw "No name provided";
    if (!password) throw "No password provided";
    if (!email) throw "No email provided";
    // name

    if (typeof(name) != 'string') throw "name not string";
    let nameRegex = /([A-Za-z]+[ ][A-Za-z]+)/;
    if (!nameRegex.test(name.trim())) throw "name not in correct form firstname lastname"

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

    // CHECK NON DUPLICATE USERNAME
    const user_col = await users();
    const duplicateCheck = await user_col.find({email: emailToSubmit}).toArray();
    if (duplicateCheck.length > 0) {
      throw "Duplicate email in system."
    }

    const hash = await bcrypt.hash(password, saltRounds);
    
    const userPass = {name: name.trim().toLowerCase(), email: emailToSubmit, password: hash, description: '', vehicles: '', favorite: ''}
    const insertInfo = await user_col.insertOne(userPass);
    if (insertInfo.insertedCount === 0) throw 'Could not add user/pass combination';
    const newId = insertInfo.insertedId;

    return newId.toString();
  };

const checkUser = async (email, password) => {
    console.log("starting checkuser");
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

     // CHECK NON DUPLICATE USERNAME
    const user_col = await users();
    const duplicateCheck = await user_col.find({email: emailToSubmit}).toArray();
    if (!(duplicateCheck.length == 1)) {
      throw "Username not in system."
    }

    // compare passwords

    try {
      compareToMatch = await bcrypt.compare(password, duplicateCheck[0].password);
    } catch (e) {
      //no op
    }

    if (compareToMatch) {
      return {authenticatedUser: true}
    } else {
      throw "Either the username or password is invalid";
    }
  
  
  };

const getUserByEmail = async(email) => {
    if (!email) throw "no email";
    if (typeof(email) != 'string') throw "email not string";
    let emailRegex = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!emailRegex.test(email.trim())) throw "not valid email";
    const emailToSubmit = email.trim().toLowerCase();

    userCollection = await users();
    const user = await userCollection.findOne({email: emailToSubmit});
    if (!user) throw "No user found with that email."
    return user;
}

const getUserById = async(id) => {
    if (!id) 
      throw 'You must provide an id to search for';

    if (typeof id !== 'string' || !id.trim().replace(/\s/g, "").length)
      throw 'Please provide a valid ID for the user'

    if(!ObjectId.isValid(id))
      throw 'The ID is not a valid Object ID';

    const userCollection = await users();
    const user = await userCollection.findOne({ _id: ObjectId(id) });

    if (!user)
      throw 'No user with that id';

    return user;
}

const setfavbyid = async(garage,id) => {
  const userCollection =  await users();

  if (!garage)
    throw 'No garage';
  else {
    let updatedInfo = await userCollection.updateOne({_id: ObjectId(id)}, {$set: {
      favorite: garage,
    }});
    if (updatedInfo.modifiedCount === 0) {
      throw 'could not update Favorite successfully';
    }
  }
  const user = getUserById(id)
  
  return user;
}

module.exports = {
    createUser,
    checkUser,
    getUserByEmail,
    getUserById,
    updateUser,
    setfavbyid
};