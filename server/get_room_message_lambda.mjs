import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const { Items } = await documentClient.send(new QueryCommand({
            TableName: 'chat_app_messages',
            KeyConditionExpression: 'room_id = :room_id',
            ExpressionAttributeValues: {
                ':room_id': event.pathParameters.room_id,
            },
        }));

        return {
            statusCode: 200,
            headers: {
                ...event.headers,
                "Access-Control-Allow-Headers" : "Content-Type",
                "Access-Control-Allow-Origin": "http://localhost:5173",
                "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message: 'Success', data: Items }),
        };
    } catch (error) {
        console.error(error);

        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
}