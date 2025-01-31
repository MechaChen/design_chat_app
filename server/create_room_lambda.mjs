import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;

    console.log('connectionId ======>', connectionId);

    try {
        const roomPayload = JSON.parse(event.body);
        delete roomPayload.action;

        const uuid = uuidv4();

        await documentClient.send(new PutCommand({
            TableName: 'chat_app_rooms ',
            Item: {
                room_id: uuid,
                participants: [],
            },
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Success',
            room_id: uuid,
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
