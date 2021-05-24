var AWS = require("aws-sdk");
AWS.config.update({region:"eu-west-2"});
const tableName = process.env.TABLE_NAME

exports.handler = async (event, context)=>{
    console.log(event)
    item = event.queryStringParameters
    const res = await getAppointments(item.startDate, item.endDate, item.Group)
    return{
        statusCode:200,
        body: JSON.stringify({appointments: res}),
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    }
}

async function getAppointments(startDate, endDate, group){
    var docClient = new AWS.DynamoDB.DocumentClient();
    var getParams = {
        TableName: tableName,
        KeyConditionExpression:"#group = :group",
        ExpressionAttributeNames:{
            "#group" : "Group"
        },
        ExpressionAttributeValues:{
            ":group": group
        }
    };

    var data = await docClient.query(getParams).promise()

    return data.Items[0].Availabilities
}