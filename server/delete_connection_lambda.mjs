import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, DeleteCommand } from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const documentClient = DynamoDBDocumentClient.from(client);

export const handler = async (event) => {
  const connectionId = event.requestContext.connectionId;

  try {
    const connectionPayload = JSON.parse(event.body);
    delete connectionPayload.action;

    await documentClient.send(
      new DeleteCommand({
        TableName: "chat_app_connections",
        Key: {
          user_id: connectionPayload.user_id,
          connection_id: connectionId,
        },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Connection deleted successfully",
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
