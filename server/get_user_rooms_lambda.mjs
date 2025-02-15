import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const userRoomsPayload = JSON.parse(event.body);

        // add to room table to quick find all participants to find connection_id
        const { Items } = await documentClient.send(new QueryCommand({
            TableName: 'chat_app_user_rooms',
            KeyConditionExpression: 'user_id = :user_id',
            ExpressionAttributeValues: {
                ':user_id': userRoomsPayload.user_id,
            },
        }));


        return {
          statusCode: 200,
          body: JSON.stringify({
            data: Items,
            action: 'get_user_rooms'
          }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                action: 'get_user_rooms',
                message: error.message,
            }),
        };
    }
};

export { client };
