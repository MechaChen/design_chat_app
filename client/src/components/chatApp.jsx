
import CreateRoom from './createRoom';

export default function ChatApp({ userEmail }) {
    return (
        <div>
            <CreateRoom userEmail={userEmail} />
        </div>
    );
}
