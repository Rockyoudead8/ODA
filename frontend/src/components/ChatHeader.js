export default function ChatHeader({ user }) {
  if (!user) {
    return (
      <div className="h-16 flex items-center justify-center border-b bg-white">
        Select a chat
      </div>
    );
  }

  return (
    <div className="h-16 bg-white border-b flex items-center px-4 gap-3">
      <img src={user.avatar} className="w-10 h-10 rounded-full" />

      <div>
        <div className="font-semibold">{user.name}</div>
        <div className="text-sm text-gray-500">
          {user.online ? "Online" : "Offline"}
        </div>
      </div>
    </div>
  );
}