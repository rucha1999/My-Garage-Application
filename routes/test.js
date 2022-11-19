const path = require('path');

const express = require('express');
const router = express.Router();

router.route("/").get(async (req, res) => {
    //code here for GET
    res.sendFile(path.resolve('static/homepage.html'));
});

module.exports = router;