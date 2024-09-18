// const config = require("../config/enviroment-variables.json");
// const tempData = config.tempData;

// module.exports.validateTempId = async (req, res, next) => {
//   console.log(tempData);
//   const tempId = req.params.id;
//   const templateExists = tempData.includes(tempId.toString());
//   if (templateExists) {
//     next();
//   } else {
//     res.status(404).send("The template you are looking for does not exist");
//   }
// };
