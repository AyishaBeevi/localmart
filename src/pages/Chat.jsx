
import { useEffect, useState, useRef } from "react";
import axios from "axios";
import socket from "../socket";
import { useParams, useNavigate } from "react-router-dom";

function Chat() {

  const { conversationId } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  /* ---------- GET USER ID ---------- */

  let userId = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id || payload._id;
    } catch {}
  }

  /* ---------- STATE ---------- */

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [currentConversation, setCurrentConversation] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const [typing, setTyping] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const typingTimeoutRef = useRef(null);
  const messagesEndRef = useRef(null);

  /* ---------- AUTO SCROLL ---------- */

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------- ONLINE USERS ---------- */

  useEffect(() => {

    const handleOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    socket.on("onlineUsers", handleOnlineUsers);

    return () => socket.off("onlineUsers", handleOnlineUsers);

  }, []);

  /* ---------- LOAD CONVERSATIONS ---------- */

  useEffect(() => {

    const fetchConversations = async () => {

      try {

        const res = await API.get(
          "/chat",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const sorted = res.data.sort(
          (a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt)
        );

        setConversations(sorted);

        if (conversationId) {
          const convo = sorted.find(c => c._id === conversationId);
          setCurrentConversation(convo);
        }

      } catch (err) {
        console.log(err);
      }

    };

    fetchConversations();

  }, [conversationId]);

  /* ---------- LOAD MESSAGES ---------- */

  useEffect(() => {

    if (!conversationId) return;

    const fetchMessages = async () => {

      try {

        const res = await API.get(
          `/chat/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setMessages(res.data);

        socket.emit("joinConversation", conversationId);

        await API.put(
          `/chat/read/${conversationId}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );



        setConversations(prev =>
          prev.map(c =>
            c._id === conversationId
              ? {
                  ...c,
                  unreadCounts: {
                    ...c.unreadCounts,
                    [userId]: 0
                  }
                }
              : c
          )
        );

      } catch (err) {
        console.log(err);
      }

    };

    setMessages([]);
    fetchMessages();

  }, [conversationId]);

  /* ---------- RECEIVE MESSAGE ---------- */

  useEffect(() => {

    const handleMessage = (msg) => {

      setConversations(prev => {

        const updated = prev.map(c => {

          if (c._id !== msg.conversationId) return c;

          const unread =
            msg.sender !== userId
              ? (c.unreadCounts?.[userId] || 0) + 1
              : c.unreadCounts?.[userId] || 0;

          return {
            ...c,
            lastMessage: msg.text,
            unreadCounts: { ...c.unreadCounts, [userId]: unread },
            updatedAt: new Date()
          };

        });

        return updated.sort(
          (a,b)=> new Date(b.updatedAt) - new Date(a.updatedAt)
        );

      });

      if (msg.conversationId !== conversationId) return;

      setMessages(prev => {

        const exists = prev.some(m => m._id === msg._id);
        if (exists) return prev;

        return [...prev, msg];

      });

    };

    socket.on("receiveMessage", handleMessage);

    return () => socket.off("receiveMessage", handleMessage);

  }, [conversationId]);

  /* ---------- TYPING EVENTS ---------- */

  useEffect(() => {

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
    };

  }, []);

//delete conv
  const deleteConversation = async (id) => {

  if (!window.confirm("Delete this conversation?")) return;

  try {

    await API.delete(
      `/chat/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setConversations(prev =>
      prev.filter(c => c._id !== id)
    );

    if (conversationId === id) {
      navigate("/chat");
      setMessages([]);
    }

  } catch (err) {
    console.log(err);
  }

};

  /* ---------- HANDLE TYPING ---------- */

  const handleTypingInput = (value) => {

    setText(value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", conversationId);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {

      socket.emit("stopTyping", conversationId);
      setTyping(false);

    }, 1200);

  };

  /* ---------- SEND MESSAGE ---------- */

  const sendMessage = async () => {

    if (!text.trim()) return;

    try {

      const res = await API.post(
        "/chat/message",
        { conversationId, text },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const message = res.data;

      setMessages(prev => {

        const exists = prev.some(m => m._id === message._id);
        if (exists) return prev;

        return [...prev, message];

      });

      setConversations(prev =>
        prev.map(c =>
          c._id === conversationId
            ? { ...c, lastMessage: text, updatedAt: new Date() }
            : c
        )
      );

      socket.emit("stopTyping", conversationId);

      setText("");

    } catch (err) {
      console.log(err);
    }

  };

  /* ---------- OTHER USER ---------- */

  const otherUser = currentConversation?.members?.find(
    m => String(m._id) !== String(userId)
  );

  const isOnline = onlineUsers.includes(otherUser?._id);

  /* ---------- UI ---------- */

  return (

    <div className="flex h-[85vh] border rounded-lg overflow-hidden bg-white">

      {/* LEFT SIDE */}

      <div className="w-1/3 border-r overflow-y-auto">

        {conversations.map(c => {

          const user = c.members.find(
            m => String(m._id) !== String(userId)
          );

          const unread = c.unreadCounts?.[userId] || 0;

          return (

            <div
              key={c._id}
              onClick={() => navigate(`/chat/${c._id}`)}
              className={`flex justify-between items-center gap-3 p-4 border-b cursor-pointer transition
              ${c._id === conversationId ? "bg-gray-100" : ""}
              ${unread > 0 ? "bg-green-50" : "hover:bg-gray-50"}
              `}
            >

              <div className="flex gap-3">

                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">

  {user?.avatar ? (
    <img
      src={user.avatar}
      alt={user.name}
      className="w-full h-full object-cover"
    />
  ) : (
    <span className="text-sm font-semibold">
      {user?.name?.charAt(0)}
    </span>
  )}

</div>

                <div>



                  <p className={`text-sm ${unread > 0 ? "font-bold" : "font-semibold"}`}>
                    {user?.name}
                  </p>

                  <p className={`text-xs truncate w-[160px]
                    ${unread > 0 ? "text-black font-medium" : "text-textMuted"}
                  `}>
                    {c.lastMessage || "Start conversation"}
                  </p>

                  <p className="text-[10px] text-gray-400">
  {new Date(c.updatedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
</p>

                </div>

              </div>

              {unread > 0 && (
                <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                  {unread}
                </span>
              )}


              <button
  onClick={(e) => {
    e.stopPropagation();
    deleteConversation(c._id);
  }}
  className="text-xs text-red-500 hover:underline"
>
  Delete
</button>

            </div>

          );

        })}

        

      </div>

      {/* RIGHT CHAT */}

      <div className="flex flex-col flex-1">

        {!conversationId && (
          <div className="flex flex-1 items-center justify-center text-gray-400">
            Select a conversation to start chatting
          </div>
        )}

        {currentConversation && (

          <>
            {/* HEADER */}

            <div className="border-b p-4 flex items-center gap-3">

              <img
                src={currentConversation.product?.images?.[0]}
                className="w-10 h-10 rounded object-cover"
              />

              <div>

                <div className="flex items-center gap-2">

                  <p className="font-semibold text-sm">
                    {otherUser?.name}
                  </p>

                  {isOnline && (
                    <span className="w-2 h-2 bg-green-500 rounded-full"/>
                  )}

                </div>

                <p className="text-xs text-textMuted">
                  Chat about {currentConversation.product?.title}
                </p>

              </div>

            </div>

            {/* MESSAGES */}

            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-3">

              {messages.map(m => {

                const senderId =
                  typeof m.sender === "object"
                    ? m.sender._id
                    : m.sender;

                const senderName =
                  typeof m.sender === "object"
                    ? m.sender.name
                    : "User";

                const mine = String(senderId) === String(userId);

                return (

                  <div
                    key={m._id}
                    className={`flex ${mine ? "justify-end" : "justify-start"}`}
                  >

                    <div className="max-w-[70%]">

                      <p className="text-xs text-textMuted mb-1">
                        {senderName}
                      </p>

                      <div
                      
  className={`px-4 py-2 rounded-lg text-sm ${
    mine ? "bg-brand text-white" : "bg-white border"
  }`}
>

  {m.product && (
    <div className="mb-2 border rounded-lg overflow-hidden bg-white">

      <img
        src={m.product.images?.[0]}
        className="w-full h-32 object-cover"
      />

      <div className="p-2">

        <p className="text-xs font-semibold">
          {m.product.title}
        </p>

        <p className="text-xs text-textMuted">
          ₹ {m.product.price}
        </p>

      </div>

    </div>
  )}

  {m.text}
</div>


                      <div className="flex items-center gap-1 mt-1">

  <span className="text-[10px] text-gray-400">
    {new Date(m.createdAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
  </span>

  {mine && (
    <span className="text-[10px] text-gray-400">
      {m.readBy?.length > 1 ? "✓✓" : "✓"}
    </span>
  )}

</div>

                    </div>

                  </div>

                );

              })}

              {isTyping && (
                <p className="text-sm text-textMuted italic">
                  <div className="text-sm text-textMuted italic animate-pulse">
  typing...
</div>
                </p>
              )}

              <div ref={messagesEndRef} />

            </div>

            {/* INPUT */}

            <div className="flex border-t p-4 bg-white">

              <input
                value={text}
                onChange={(e) => handleTypingInput(e.target.value)}
                placeholder="Type message..."
                className="flex-1 border rounded-lg px-4 py-2"
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                className="ml-3 bg-brand text-white px-5 py-2 rounded-lg"
              >
                Send
              </button>

            </div>

          </>

        )}

      </div>

    </div>

  );

}

export default Chat;