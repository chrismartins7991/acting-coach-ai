import { Chat } from "@/components/Chat";

const ChatPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-theater-purple via-black to-theater-red pt-24">
      <div className="container mx-auto px-4">
        <Chat />
      </div>
    </div>
  );
};

export default ChatPage;