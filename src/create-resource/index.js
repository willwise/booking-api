var AWS = require("aws-sdk");
AWS.config.update({region:"eu-west-2"});

exports.handler = async (event, context)=>{
    item = JSON.parse(event.body)
    console.log(event)
    //var data = await generateAppointments(item.startDate, item.endDate, item.startTime, item.endTime, item.appointmentLength, item.daysOfWeek)
    var res = await createResource(event.body)
    return{
        statusCode:200,
        body: "Resource created",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    }
}

async function createResource(item){
    item = JSON.parse(item)
    var docClient = new AWS.DynamoDB.DocumentClient();
    var tableName = process.env.TABLE_NAME;

    var params = {
        TableName: tableName,
        Item: {
            "Name": item.Name,
            "Group": item.Group
        }
    };

    var data = await docClient.put(params).promise()

    return data

}
