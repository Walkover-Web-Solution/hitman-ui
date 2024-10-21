import React, { useEffect } from 'react';

const ChatWidget = () => {
  useEffect(() => {
    // Create a script element for the configuration
    const configScript = document.createElement('script');
    configScript.type = 'text/javascript';
    configScript.innerHTML = `
      var helloConfig = {
        widgetToken: "ec5d6",
        hide_launcher: true,
        show_widget_form: false,
        show_close_button: true,
        launch_widget: false,
        show_send_button: true,
        unique_id: "user123",
        name: "John Doe",
        number: "1234567890",
        mail: "john.doe@example.com",
        region: "Region",
        country: "Country",
        city: "City",
        hfs: "hfs",
        dsfa: "dsfa",
        CompanyX: "CompanyX",
        Test: "Test",
        "New f": "New f",
        sdsf: "sdsf",
        ET: "ET",
        test: "test",
        newfiled: "newfiled",
        wintest: "wintest",
        newfield: "newfield",
        siddharath_Test: "siddharath_Test",
        siddharth_Test: "siddharth_Test",
        issue: "issue",
        rgsergsr: "rgsergsr",
        ergesrgserg: "ergesrgserg",
        rtgsrtgsrt: "rtgsrtgsrt",
        Newww: "Newww",
        tiger: "tiger",
        water: "water",
        branches: "branches",
        wda: "wda",
        2534: "2534",
        qwe: "qwe"
      };
    `;
    document.body.appendChild(configScript);

    // Create a script element for the widget
    const widgetScript = document.createElement('script');
    widgetScript.type = 'text/javascript';
    widgetScript.src = 'https://control.msg91.com/app/assets/widget/chat-widget.js';
    widgetScript.onload = () => {
      if (typeof initChatWidget === 'function') {
        initChatWidget(helloConfig, 5000);
      }
    };
    document.body.appendChild(widgetScript);

    // Cleanup function to remove scripts when component unmounts
    return () => {
      document.body.removeChild(configScript);
      document.body.removeChild(widgetScript);
    };
  }, []);

  return null; // This component does not render anything visible
};

export default ChatWidget;