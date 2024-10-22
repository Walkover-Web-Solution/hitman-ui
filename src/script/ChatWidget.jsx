"use client"
import { useEffect } from 'react';
const ChatbotWidget = () => {
  useEffect(() => {
    const helloConfig = {
      widgetToken: "1d31e",
      widget_enabled: true,
      hide_launcher: false, // replace <true|false> with actual boolean value
      show_widget_form: true, // replace <true|false> with actual boolean value
      show_close_button: true, // replace <true|false> with actual boolean value
      launch_widget: true, // replace <true|false> with actual boolean value
      show_send_button: true, // replace <true|false> with actual boolean value
      unique_id: "user123", // replace <unique_id> with actual unique identifier
      name: "John Doe",  // replace <name> with actual name or remove if not needed
      number: "1234567890", // replace <number> with actual number or remove if not needed
      mail: "john.doe@example.com", // replace <mail> with actual email or remove if not needed
      region: "North America", // replace <region> with actual region
      country: "USA", // replace <country> with actual country
      city: "New York", // replace <city> with actual city
      hfs: "value", // replace <hfs> with actual value
      dsfa: "value", // replace <dsfa> with actual value
      CompanyX: "value", // replace <CompanyX> with actual value
      Test: "value", // replace <Test> with actual value
      "New f": "value", // replace <New f> with actual value
      sdsf: "value", // replace <sdsf> with actual value
      ET: "value", // replace <ET> with actual value
      test: "value", // replace <test> with actual value
      newfiled: "value", // replace <newfiled> with actual value
      wintest: "value", // replace <wintest> with actual value
      newfield: "value", // replace <newfield> with actual value
      siddharath_Test: "value", // replace <siddharath_Test> with actual value
      siddharth_Test: "value", // replace <siddharth_Test> with actual value
      issue: "value", // replace <issue> with actual value
      rgsergsr: "value", // replace <rgsergsr> with actual value
      ergesrgserg: "value", // replace <ergesrgserg> with actual value
      rtgsrtgsrt: "value", // replace <rtgsrtgsrt> with actual value
      Newww: "value", // replace <Newww> with actual value
      tiger: "value", // replace <tiger> with actual value
      water: "value", // replace <water> with actual value
      branches: "value", // replace <branches> with actual value
      wda: "value", // replace <wda> with actual value
      2534: "value", // replace <2534> with actual value
      qwe: "value", // replace <qwe> with actual value,
    };

    const loadScript = (src, callback) => {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = src;
      script.onload = callback;
      document.body.appendChild(script);
    };
    loadScript('https://control.msg91.com/app/assets/widget/chat-widget.js', () => {
      if (typeof window.initChatWidget === 'function') {
        window.initChatWidget(helloConfig, 500);
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