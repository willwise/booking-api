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
        KeyConditionExpression:"#group = :group",
        ExpressionAttributeNames:{
            "#group" : "Group",
        },
        ExpressionAttributeValues:{
            ":group": group,
        }
    };

    var data = await docClient.query(getParams).promise()

    var isBooked = true
    for (let i = 0; i < data.Items.length; i++) {
        const element = array[i];
        if(element.Availabilities.indexOf(time)>-1){
            isBooked = false
            break
        }
        
    }

    if(!isBooked){
        var resource = data.Items[i]
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