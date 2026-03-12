import { type PropsWithChildren } from "react";

import { ScrollViewStyleReset } from "expo-router/html";

export default function Html({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta content="IE=edge" httpEquiv="X-UA-Compatible" />
        <meta
          content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover, user-scalable=no"
          name="viewport"
        />
        <meta content="yes" name="apple-mobile-web-app-capable" />
        <meta content="black-translucent" name="apple-mobile-web-app-status-bar-style" />
        <ScrollViewStyleReset />
        <style
          dangerouslySetInnerHTML={{
            __html:
              "html,body,#root{width:100%;height:100%;overscroll-behavior:none;-webkit-tap-highlight-color:transparent;-webkit-text-size-adjust:100%}body{margin:0;position:fixed;inset:0;overflow:hidden;background:#07111f}#root{display:flex;min-height:100dvh}"
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

