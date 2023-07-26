const { GetCommand, ScanCommand } = require("@aws-sdk/lib-dynamodb");
const { ddbDocClient } = require("./libs/ddbDocClient");
const { sendEmailWithUserId } = require("./libs/nodemailer");

const table = {
    TableName: "art-bounty-users"
};

exports.login = async (userId) => {
    const getParam = {
        TableName: table.TableName,
        Key: {
            "user_id": userId
        }
    };

    const data = await ddbDocClient.send(new GetCommand(getParam));
    return (data.Item !== undefined) ? data.Item : undefined;
};

exports.forgotUserId = async (userEmail) => {
    const data = await ddbDocClient.send(new ScanCommand(table));
    const items = data.Items.filter(item => item.email === userEmail);
    if (items.length > 0) {
        sendEmailWithUserId(items[0].email, items[0].user_id);
        return true;
    }

    return false;
};