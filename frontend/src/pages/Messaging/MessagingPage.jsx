import { useParams } from "react-router-dom";
import MessagingWindow from "./MessagingWindow";

export default function MessagingPage() {
  const { otherUserId } = useParams();

  // Derive logged-in user ID from JWT
  let currentUserId = null;
  const token = localStorage.getItem("token");
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      currentUserId = payload.id;
    } catch (e) {
      console.error("Invalid token", e);
    }
  }

  if (!currentUserId) return <div>Loading user...</div>;

  return (
    <MessagingWindow currentUserId={currentUserId} otherUserId={otherUserId} />
  );
}
