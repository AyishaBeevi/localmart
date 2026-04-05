
import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import { useParams, useNavigate } from "react-router-dom";
import API from "../utils/api";

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

  const [reactions, setReactions] = useState({});
  const addReaction = (messageId, emoji) => {
  setReactions(prev => {
    const existing = prev[messageId] || [];

    return {
      ...prev,
      [messageId]: [...existing, emoji]
    };
  });
};

const EMOJIS = ["❤️", "😂", "😮", "😢", "👍"];

  const typingTimeoutRef = useRef(null);


  const messagesContainerRef = useRef(null);

  /*  AUTO SCROLL  */


useEffect(() => {
  if (messagesContainerRef.current) {
    messagesContainerRef.current.scrollTop =
      messagesContainerRef.current.scrollHeight;
  }
}, [messages]);


  /*  ONLINE USERS  */

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
  <div className="flex h-[calc(100vh-70px)] bg-gradient-to-br from-bg via-bg to-black/5">

    {/* LEFT SIDE */}

    <div
      className={`
        ${conversationId ? "hidden md:block" : "block"}
        w-full md:w-1/3 border-r border-white/10
        backdrop-blur-xl bg-white/40
        overflow-y-auto
      `}
    >
      <div className="p-4 font-semibold text-lg tracking-tight">
        Messages
      </div>

      {conversations.map(c => {
        const user = c.members.find(
          m => String(m._id) !== String(userId)
        );

        const unread = c.unreadCounts?.[userId] || 0;

        return (
          <div
            key={c._id}
            onClick={() => navigate(`/chat/${c._id}`)}
            className={`
              group flex justify-between items-center gap-3 px-4 py-3 cursor-pointer
              transition-all duration-200
              ${c._id === conversationId ? "bg-white/60 shadow-sm" : "hover:bg-white/30"}
            `}
          >

            <div className="flex gap-3 items-center">

              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                  {user?.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm font-semibold">
                      {user?.name?.charAt(0)}
                    </div>
                  )}
                </div>

                {onlineUsers.includes(user?._id) && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"/>
                )}
              </div>

              <div className="leading-tight">
                <p className={`text-sm ${unread ? "font-bold" : "font-medium"}`}>
                  {user?.name}
                </p>

                <p className={`text-xs truncate w-[170px] ${unread ? "text-black" : "text-textMuted"}`}>
                  {c.lastMessage || "Start conversation"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1">

              <span className="text-[10px] text-gray-400">
                {new Date(c.updatedAt).toLocaleTimeString([], {hour:"2-digit", minute:"2-digit"})}
              </span>

              {unread > 0 && (
                <span className="bg-brand text-white text-xs px-2 py-[2px] rounded-full">
                  {unread}
                </span>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c._id);
                }}
                className="opacity-0 group-hover:opacity-100 text-[10px] text-red-500 transition"
              >
                delete
              </button>
            </div>

          </div>
        );
      })}
    </div>

    {/* RIGHT SIDE */}

    <div
      className={`
        ${conversationId ? "flex" : "hidden md:flex"}
        flex-col w-full md:flex-1
      `}
    >

      {!conversationId && (
        <div className="flex flex-1 items-center justify-center text-textMuted text-sm">
          Select a conversation
        </div>
      )}

      {currentConversation && (
        <>
          {/* HEADER */}

          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/10 backdrop-blur-xl bg-white/50 sticky top-0 z-10">

            <button
              onClick={() => navigate("/chat")}
              className="md:hidden text-lg"
            >
              ←
            </button>

            <img
              src={currentConversation.product?.images?.[0]}
              className="w-10 h-10 rounded-lg object-cover shadow"
            />

            <div className="leading-tight">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-sm">{otherUser?.name}</p>
                {isOnline && <span className="w-2 h-2 bg-green-500 rounded-full"/>}
              </div>

              <p className="text-xs text-textMuted">
                {currentConversation.product?.title}
              </p>
            </div>
          </div>

          {/* MESSAGES */}

          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto px-4 py-6 space-y-3"
          >
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
                  <div className="max-w-[75%]">

                    {!mine && (
                      <p className="text-[11px] text-textMuted mb-1">
                        {senderName}
                      </p>
                    )}

                    <div
                      className={`
                        px-4 py-2 rounded-2xl text-sm shadow-md backdrop-blur-md
                        ${mine
                          ? "bg-gradient-to-r from-brand to-brand/80 text-white rounded-br-none"
                          : "bg-white/80 border border-white/40 rounded-bl-none"}
                      `}
                    >

                      {m.product && (
                        <div className="mb-2 rounded-lg overflow-hidden bg-white shadow-sm">
                          <img
                            src={m.product.images?.[0]}
                            className="w-full h-32 object-cover"
                          />
                          <div className="p-2">
                            <p className="text-xs font-semibold">{m.product.title}</p>
                            <p className="text-xs text-textMuted">₹ {m.product.price}</p>
                          </div>
                        </div>
                      )}

                      {m.text}
                    </div>

                    <div className="flex items-center gap-1 mt-1 justify-end">
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
              <div className="text-sm text-textMuted italic animate-pulse">
                typing...
              </div>
            )}
          </div>

          {/* INPUT */}

          <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10 backdrop-blur-xl bg-white/50 sticky bottom-0">

            <input
              value={text}
              onChange={(e) => handleTypingInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-white/70 border border-white/40 rounded-full px-5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand/40"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button
              onClick={sendMessage}
              className="bg-gradient-to-r from-brand to-brand/80 text-white px-5 py-2 rounded-full shadow hover:scale-105 transition"
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