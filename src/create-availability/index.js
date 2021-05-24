var AWS = require("aws-sdk");
AWS.config.update({region:"eu-west-2"});

exports.handler = async (event, context)=>{
    item = JSON.parse(event.body)
    //var data = await generateAppointments(item.startDate, item.endDate, item.startTime, item.endTime, item.appointmentLength, item.daysOfWeek)
    var res = await createAvailability(event.body)
    return{
        statusCode:200,
        body: "Availability created",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    }
}

async function generateAppointments(startDate, endDate, startTime, endTime, appointmentLength, daysOfWeek){
    var appointments = []
    var startDateTime = new Date(startDate + 'T' + startTime)
    var endDateTime = new Date(endDate + 'T' + endTime)
    var currDateEndTime = new Date(startDate + 'T' + endTime)
    var startTimeString = startTime.split(':')

    //loop from the first date until the last to go through each day
    //check if the day of week is in the day of week array
    //if it is generate appointments for that day
    for (var i = 0; startDateTime < endDateTime; startDateTime.setDate(startDateTime.getDate()+1)) {
        if(daysOfWeek.includes(startDateTime.getDay())){
            for (let index = 0; startDateTime < currDateEndTime; startDateTime = addMinutes(startDateTime,appointmentLength)) {
                appointments.push(startDateTime.toString())
            }
            startDateTime.setHours(parseInt(startTimeString[0]),parseInt(startTimeString[1]))
            
        }
        currDateEndTime.setDate(currDateEndTime.getDate()+1)
    }
    return appointments
}

function addMinutes(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
}

async function createAvailability(item){
    item = JSON.parse(item)
    var docClient = new AWS.DynamoDB.DocumentClient();
    var tableName = process.env.TABLE_NAME;

    var getParams = {
        TableName: tableName,
        KeyConditionExpression:"#group = :group",
        ExpressionAttributeNames:{
            "#group" : "Group"
        },
        ExpressionAttributeValues:{
            ":group": item.Group
        }
    };

    var data = await docClient.query(getParams).promise()

    console.log(data)

    var newAvailabilility = await generateAppointments(item.startDate, item.endDate, item.startTime, item.endTime, item.appointmentLength, item.daysOfWeek)

    if(data.Items[0].hasOwnProperty('Availabilities')){
        newAvailabilility = newAvailabilility.concat(data.Items[0].Availabilities)
        newAvailabilility = removeDupes(newAvailabilility)
    }

    console.log(newAvailabilility)

    var updateParams = {
        TableName: tableName,
        Key: {
            "Name": item.Name,
            "Group": item.Group
        },
        UpdateExpression: "set #Availabilities = :a",
        ExpressionAttributeNames: {
            "#Availabilities": "Availabilities"
        },
        ExpressionAttributeValues: {
            ":a": newAvailabilility
        }
    };

    console.log(updateParams);

    var res = await docClient.update(updateParams).promise()

    return res
}

function removeDupes(array){
    return [...new Set(array)]
}