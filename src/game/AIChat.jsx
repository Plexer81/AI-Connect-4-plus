export default function AIChat({ text }) {
  return (
    <div className="ai-chat">
      <div className="ai-chat-avatar">🤖</div>
      <div className="ai-chat-bubble">{text}</div>
    </div>
  )
}
