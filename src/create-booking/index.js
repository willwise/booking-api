var AWS = require("aws-sdk");
AWS.config.update({region:"eu-west-2"});

exports.handler = async (event, context)=>{
    item = JSON.parse(event.body)
    var res = await createBooking(item.Time, item.Group, item.Name)
    return{
        statusCode:200,
        body: "Resource created",
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "*",
        }
    }
}

async function createBooking(time, group, name){
    //get the resource
    //get the array
    //remove the item from the array
    //add the item to the booking array
    var docClient = new AWS.DynamoDB.DocumentClient();
    var tableName = process.env.TABLE_NAME;

    var getParams = {
        TableName: tableName,
        KeyConditionExpression:"#group = :group and #name = :name",
        ExpressionAttributeNames:{
            "#group" : "Group",
            "#name" : "Name"
        },
        ExpressionAttributeValues:{
            ":group": group,
            ":name" : name
        }
    };

    var data = await docClient.query(getParams).promise()

    var resource = data.Items[0]
    console.log(time)
    console.log(resource.Availabilities)

    const index = resource.Availabilities.indexOf(time)
    if(index > -1){
        resource.Availabilities.splice(index, 1)
    } else {
        return "Booking already taken"
    }

    if (resource.hasOwnProperty('Bookings')){
        resource.Bookings.push(time)
    } else {
        resource["Bookings"] = [time]
    }

    var updateParams = {
        TableName: tableName,
        Key: {
            "Name": name,
            "Group": group
        },
        UpdateExpression: "set Availabilities = :a, Bookings=:b",
        ExpressionAttributeValues: {
            ":a": resource.Availabilities,
            ":b": resource.Bookings
        }
    };

    console.log(updateParams);

    var res = await docClient.update(updateParams).promise()

    return res
}