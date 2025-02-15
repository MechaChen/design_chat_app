import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const parsedBody = JSON.parse(event.body);

        console.log('event ======>', event)

        const { Items } = await documentClient.send(new QueryCommand({
            TableName: 'chat_room_users',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': parsedBody.email,
            },
        }));

        if (Items.length <= 0) {
            await documentClient.send(new PutCommand({
                TableName: 'chat_room_users',
                Item: {
                    email: parsedBody.email,
                },
            }));
        }

        return {
          statusCode: 200,
          headers: {
            ...event.headers,
            "Access-Control-Allow-Headers" : "Content-Type",
            "Access-Control-Allow-Origin": "http://localhost:5173",
            "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: 'Success',
            data: parsedBody.email
          }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                ...event.headers,
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: error.message,
            }),
        };
    }
};

export { client };
