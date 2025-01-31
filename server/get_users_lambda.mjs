import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
    try {
        const { Items } = await documentClient.send(new ScanCommand({
            TableName: 'chat_room_users',
        }));

        return {
          statusCode: 200,
          body: JSON.stringify({
            message: 'Success',
            data: parsedBody.email
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
