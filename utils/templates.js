const axios = require("axios");
const config = require('config')

const accessToken = process.env.ACCESS_TOKEN;
const wabaId = process.env.WABA_ID;
const phId = process.env.PH_ID;


/* Deprecated */
// function pushTemplateData(tempArr) {
//   for (let template of tempArr) {
//     if (
//       tempData.find((existingTemplate) => existingTemplate.id === template.id)
//     ) {
//       continue;
//     }
//     tempData.push(template.id);
//   }
// }

module.exports.getTemplates = async (customer) => {
  try {
    const res = await axios({
      method: "get",
      url: config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${customer.whatsapp_business_account_id}/message_templates`,
      headers: {
        Authorization: `Bearer ${customer.access_token}`,
      },
    });
    console.log(res.data.data);
    return {
      success: true,
      data: res.data.data,
    };
  } catch (err) {
    console.error("Error in getting all Templates:", err);
    const responseData = err.response ? err.response.data : {};
    return {
      success: false,
      data: {
        err_name: responseData.name || "Unknown Error",
        err_code: responseData.code || "UNKNOWN_ERROR",
      },
    };
  }
};

module.exports.getTemplateById = async (customer,templateId) => {
  try {
    const res = await axios({
      method: "get",
      url: config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${templateId}`,
      headers: {
        Authorization: `Bearer ${customer.access_token}`,
      },
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      data: {
        err_name: error.response.data.name,
        err_code: error.response.data.code,
      },
    };
  }
};

module.exports.createTemplate = async (
  tempName,
  tempCategory,
  tempHeader,
  tempBody,
  tempFooter,
  customer,
  callButtonName="",
  phoneNumber="",
  urlButtonName="",
  url=""
) => {
  try {
    const components = [
      {
        type: "HEADER",
        format: "TEXT",
        text: tempHeader,
      },
      {
        type: "BODY",
        text: tempBody,
      },
      {
        type: "FOOTER",
        text: tempFooter,
      },
    ];

    if ((phoneNumber && callButtonName) || (url && urlButtonName)) {
      const buttonsComponent = {
        type: "BUTTONS",
        buttons: [],
      };

      if (phoneNumber && callButtonName) {
        buttonsComponent.buttons.push({
          type: "PHONE_NUMBER",
          text: callButtonName,
          phone_number: phoneNumber,
        });
      }

      if (url && urlButtonName) {
        buttonsComponent.buttons.push({
          type: "URL",
          text: urlButtonName,
          url: url,
        });
      }

      components.push(buttonsComponent);
    }

    const res = await axios({
      method: "post",
      url: config.get("graphAPIURL") + config.get("graphAPIVersion") + `/${customer.whatsapp_business_account_id}/message_templates`,
      headers: {
        Authorization: `Bearer ${customer.access_token}`,
        "Content-Type": "application/json",
      },
      data: {
        name: tempName,
        category: tempCategory,
        allow_category_change: true,
        language: "en",
        components: components,
      },
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Error creating template:", error);
    if (error.response) {
      console.error("Response data:", error.response.data);
    }
    const statusCode = error.response ? error.response.status : 500;
    const errorMessage = error.response
      ? error.response.data.message
      : "Internal Server Error";
    res.status(statusCode).send(errorMessage);
  }
};


module.exports.sendTemplate = async (customer,tempName, tempLan, to_phone_number) => {
  try {
    const res = await axios({
      method: "post",
      url: config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${customer.phone_number_ids[0]}/messages`,
      headers: {
        Authorization: `Bearer ${customer.access_token}`,
      },
      data: {
        messaging_product: "whatsapp",
        to: to_phone_number,
        type: "template",
        template: {
          name: tempName,
          language: {
            code: tempLan,
          },
        },
      },
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    return {
      success: false,
      data: {
        err_name: error.response.data.name,
        err_code: error.response.data.code,
      },
    };
  }
};

module.exports.deleteTemplate = async (customer,tempName) => {
  try {
    const res = await axios({
      method: "delete",
      url: config.get('graphAPIURL') + config.get('graphAPIVersion') + `/${customer.whatsapp_business_account_id}/message_templates?name=${tempName}`,
      headers: {
        Authorization: `Bearer ${customer.access_token}`,
      },
    });
    return {
      success: true,
    };
  } catch (err) {
    const responseData = err.response ? err.response.data : {};
    return {
      success: false,
      data: {
        err_name: responseData.name || "Unknown Error",
        err_code: responseData.code || "UNKNOWN_ERROR",
      },
    };
  }
};

module.exports.editTemplate = async (
  tempId,
  tempHeader,
  tempBody,
  tempFooter,
  callButtonName = "",
  phoneNumber = "",
  urlButtonName = "",
  url = "",
  customer
) => {
  try {
    const components = [
      {
        type: "HEADER",
        format: "TEXT",
        text: tempHeader,
      },
      {
        type: "BODY",
        text: tempBody,
      },
      {
        type: "FOOTER",
        text: tempFooter,
      },
    ];

    if ((phoneNumber && callButtonName) || (url && urlButtonName)) {
      const buttonsComponent = {
        type: "BUTTONS",
        buttons: [],
      };

      if (phoneNumber && callButtonName) {
        buttonsComponent.buttons.push({
          type: "PHONE_NUMBER",
          text: callButtonName,
          phone_number: phoneNumber,
        });
      }

      if (url && urlButtonName) {
        buttonsComponent.buttons.push({
          type: "URL",
          text: urlButtonName,
          url: url,
        });
      }

      components.push(buttonsComponent);
    }

    const res = await axios({
      method: "post",
      url:
        config.get("graphAPIURL") +
        config.get("graphAPIVersion") +
        `/${tempId}`,
      headers: {
        Authorization: `Bearer ${customer.access_token}`,
        "Content-Type": "application/json",
      },
      data: {
        components: components,
      },
    });
    return {
      success: true,
      data: res.data,
    };
  } catch (err) {
    const responseData = err.response ? err.response.data : {};
    return {
      success: false,
      data: {
        err_name: responseData.name || "Unknown Error",
        err_code: responseData.code || "UNKNOWN_ERROR",
      },
    };
  }
};
