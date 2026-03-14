export default function ChatSidebar({ users, selectedUser, setSelectedUser }) {
  return (
    <div className="w-80 bg-white border-r overflow-y-auto">

      <div className="p-4 border-b">
        <input
          placeholder="Search..."
          className="w-full p-2 border rounded-lg"
        />
      </div>

      {users.map((user) => (
        <div
          key={user.id}
          onClick={() => setSelectedUser(user)}
          className={`flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 ${
            selectedUser?.id === user.id && "bg-gray-100"
          }`}
        >
          <div className="relative">
            <img src={user.avatar} className="w-10 h-10 rounded-full" />

            {user.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border"></span>
            )}
          </div>

          <div className="flex-1">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm text-gray-500">Last message...</div>
          </div>

          {user.unread > 0 && (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
              {user.unread}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}