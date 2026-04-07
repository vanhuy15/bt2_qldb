const Group = require("../models/Group");
const getGenericController = require("./genericController");

const groupController = getGenericController(Group);

module.exports = groupController;
