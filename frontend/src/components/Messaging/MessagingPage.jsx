import { useParams } from "react-router-dom";
import MessagingWindow from "./MessagingWindow";

export default function MessagingPage() {
  const { otherUserId } = useParams();

  // TODO: Replace with real logged-in user ID from context or auth
  const currentUserId = "YOUR_LOGGED_IN_USER_ID";

  if (!currentUserId) return <div>Loading user...</div>;

  return (
    <MessagingWindow currentUserId={currentUserId} otherUserId={otherUserId} />
  );
}
