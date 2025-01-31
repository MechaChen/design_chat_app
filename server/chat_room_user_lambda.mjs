import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const { Items } = await documentClient.send(new QueryCommand({
            TableName: 'chat_room_users',
            KeyConditionExpression: 'email = :email',
            ExpressionAttributeValues: {
                ':email': event.email   ,
            },
        }));

        if (Items.length <= 0) {
            await documentClient.send(new PutCommand({
                TableName: 'chat_room_users',
                Item: {
                    email: event.email,
                },
            }));
        }

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Success',
            data: event.email
          }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message,
            }),
        };
    }
};

export { client };
