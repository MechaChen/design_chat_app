import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;


    try {
        const connectionPayload = JSON.parse(event.body);
        delete connectionPayload.action;

        await documentClient.send(new PutCommand({
            TableName: 'chat_app_connections',
            Item: {
                ...connectionPayload,
                connection_id: connectionId,
                created_at: new Date().toISOString(),
            },
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({
            connection_id: connectionId,
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
