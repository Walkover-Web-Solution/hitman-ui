"use client"
import { useEffect } from 'react';
const ChatbotWidget = (props) => {
  useEffect(() => {
    const loadScript = (src, callback) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = callback;
      document.body.appendChild(script);
    };
    loadScript('https://control.msg91.com/app/assets/widget/chat-widget.js', () => {
      if (typeof window.initChatWidget === 'function') {
        window.initChatWidget(props.webToken, 500);
      } else {
        console.error('initChatWidget is not defined');
      }
    });

    return () => {
      const script = document.querySelector('script[src="https://control.msg91.com/app/assets/widget/chat-widget.js"]');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);
};

export default ChatbotWidget;