const express = require("express");
const router = express.Router();
const {
  getTemplates,
  getTemplateById,
  createTemplate,
  deleteTemplate,
  editTemplate,
  sendTemplate
} = require("../utils/templates");
const { validateTempId } = require("../middleware/validate");
const { attachCustomerForGet, attachCustomer, attachCustomerForDelete } = require("../middleware/customer");

router
  .get('/:user_id',attachCustomerForGet,async (req, res) => {
    try {
      const data = await getTemplates(req.customer);
      res.send(data);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      const errorMessage = error.response
        ? error.response.data.message
        : "Internal Server Error";
      res.status(statusCode).send(errorMessage);
    }
  })
  .post('/',attachCustomer,async (req, res) => {
    try {
      const {
        templateName,
        category,
        templateHeader,
        templateBody,
        templateFooter,
        callButtonName="",
        phoneNumber="",
        urlButtonName="",
        url=""
      } = req.body;
      console.log("THE ROUTE IS HITTING")
      const response = await createTemplate(
        templateName,
        category,
        templateHeader,
        templateBody,
        templateFooter,
        req.customer,
        callButtonName,
        phoneNumber,
        urlButtonName,
        url
      );
      console.log("THIS IS A RESPONSE:"+response)
    } catch (error) {
      console.error("Error creating template:", error);
      const statusCode = error.response ? error.response.status : 500;
      const errorMessage = error.response
        ? error.response.data.message
        : "Internal Server Error";
      res.status(statusCode).send(errorMessage);
    }
  })
  .delete('/:user_id',attachCustomerForDelete,async (req, res) => {
    try {
      const templateName = req.body.templateName;
      const data = await deleteTemplate(req.customer,templateName);
      res.send(data);
    } catch (error) {
      const statusCode = error.response ? error.response.status : 500;
      const errorMessage = error.response
        ? error.response.data.message
        : "Internal Server Error";
      res.status(statusCode).send(errorMessage);
    }
  });

  //Send Route
router.route("/send").post(attachCustomer,async (req, res) => {
  try {
    const {phoneNumber,name,lang}=req.body
    const response = await sendTemplate(req.customer,name,lang,phoneNumber)
    res.send(response)
  } catch (error) {
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response
      ? error.response.data.message
      : "Internal Server Error";
    res.status(statusCode).send(errorMessage);
  };
});

router.route("/:user_id/:id").get( attachCustomerForGet,async (req, res) => {
  try {
    const id = req.params.id;
    const template = await getTemplateById(req.customer,id);
    res.send(template);
  } catch (error) {
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response
      ? error.response.data.message
      : "Internal Server Error";
    res.status(statusCode).send(errorMessage);
  }
});

router.route("/:id/edit").post(attachCustomer,async (req, res) => {
  try {
    const id = req.params.id;
    const { tempHeader, tempBody, tempFooter ,buttons} = req.body;
    const phBtn = buttons[0]?.text; 
    const phValue = buttons[0]?.phone_number; 
    const urlBtn = buttons[1]?.text; 
    const urlValue = buttons[1]?.url;
    console.log("These are the values"+JSON.stringify(req.body))
    // console.log("This is the edited body:  "+[id, tempHeader, tempBody, tempFooter,phBtn, phValue, urlBtn,urlValue])
    const template = await editTemplate(id, tempHeader, tempBody, tempFooter,phBtn, phValue, urlBtn,urlValue,req.customer);
    console.log("This is the result"+JSON.stringify(template))
    res.send(template);
  } catch (error) {
    console.log("There is an error: " + error);
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response
      ? error.response.data.message
      : "Internal Server Error";
    res.status(statusCode).send(errorMessage);
  }
});

module.exports = router;
