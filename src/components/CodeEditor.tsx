import dynamic from "next/dynamic";
import React, { Suspense, memo, useEffect } from "react";
import Loader from "./Loader";

const CodeMirror = dynamic(() => import("@uiw/react-codemirror"), {
  loading: () => <Loader />,
  ssr: false,
});

const CodeMenu = dynamic(() => import("./menus/CodeMenu"), {
  ssr: false,
});

import { tokyoNightInit } from "@uiw/codemirror-theme-tokyo-night";
import { tokyoNightDayInit } from "@uiw/codemirror-theme-tokyo-night-day";

const vscodeKeymap = await (
  await import("@replit/codemirror-vscode-keymap")
).vscodeKeymap;
const indentationMarkers = await (
  await import("@replit/codemirror-indentation-markers")
).indentationMarkers;
const keymap = await (await import("@codemirror/view")).keymap;
const openSearchPanel = await (
  await import("@codemirror/search")
).openSearchPanel;
const colorPicker = await (
  await import("@replit/codemirror-css-color-picker")
).colorPicker;

import { useContextMenu } from "react-contexify";

const ext = [
  keymap.of([{ key: "Ctrl-Shift-f", run: openSearchPanel }, ...vscodeKeymap]),
  indentationMarkers(),
  colorPicker,
];

type EditorProps = {
  language?: any;
  code?: string;
  theme?: "light" | "dark" | string;
  onChange?: Function | any;
};

const UnmemoEditor: React.FC<EditorProps> = ({
  language,
  code,
  theme,
  onChange,
}) => {
  const setup = {
    defaultKeymap: false,
    foldGutter: true,
    closeBrackets: true,
    bracketMatching: true,
    autocompletion: true,
    highlightActiveLine: true,
    highlightSpecialChars: true,
    syntaxHighlighting: true,
    searchKeymap: false,
    dropCursor: false,
    allowMultipleSelections: false,
    indentOnInput: true,
    lintKeymap: false,
    drawSelection: true,
    completionKeymap: false,
    history: true,
    historyKeymap: false,
    lineNumbers: true,
  };

  const { show } = useContextMenu({
    id: "execoder",
  });

  function displayMenu(e) {
    show({
      event: e,
    });
  }

  return (
    <Suspense fallback={<Loader />}>
      <CodeMirror
        id="code-board"
        onContextMenu={displayMenu}
        placeholder={"Try with a hello world program."}
        theme={
          (localStorage.getItem("theme") || theme) == "light"
            ? tokyoNightDayInit({
                settings: {
                  fontFamily: "var(--jb-font)",
                },
              })
            : tokyoNightInit({
                settings: {
                  fontFamily: "var(--jb-font)",
                  gutterForeground: "#4C4F73",
                },
              })
        }
        style={{
          pointerEvents: "auto",
          fontFamily: "var(--jb-font)",
          fontSize: "14px",
        }}
        value={code}
        extensions={language ? [...ext, language] : ext}
        draggable={false}
        aria-label="codeboard"
        basicSetup={setup}
        onChange={onChange}
      />
      <CodeMenu />
    </Suspense>
  );
};

export default memo(function Editor(props: EditorProps) {
  return <UnmemoEditor {...props} />;
});
