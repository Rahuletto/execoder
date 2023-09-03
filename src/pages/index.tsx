import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";

import Dropdown from "react-dropdown";
import "react-dropdown/style.css";

const CodeEditor = dynamic(
  () => import("../components/CodeEditor").then((mod) => mod.default),
  { ssr: false }
);
import styles from "../styles/Home.module.css";

import React, { useEffect, useState, useCallback } from "react";

import { fromString, getCompilers } from "wandbox-api-updated/lib";

import { loadLanguage } from "@uiw/codemirror-extensions-langs";
import { Languages, LanguagesArray, LanguagesOption } from "../utils/languages";

import { BsFillPlayFill } from "react-icons/bs";
import { FaPlus } from "react-icons/fa"

export default function Home() {
  const router = useRouter();

  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const [compiling, setCompiling] = useState(false);

  const [compiler, setCompiler] = useState<string>(null);
  const [list, setList] = useState<{ value: string; label: string }[]>([]);

  const [lang, setLang] = useState("javascript");
  const [language, setLanguage] = useState(loadLanguage(lang as Languages));

  const [theme, setTheme] = useState<"light" | "dark" | string>();

  useEffect(() => {
    setTheme(localStorage.getItem("theme") || "dark");

    window.addEventListener("keydown", (event) => {
      if (
        (event.shiftKey && event.altKey && event.key.toLowerCase() == "f") ||
        (event.altKey && event.key.toLowerCase() == "f")
      ) {
        formatCode(code, lang).then((f) => {
          setCode(f);
        });
      }
    });

    setCode(localStorage.getItem("code") || "");
    setInput(localStorage.getItem("inp") || "");
    setLang(localStorage.getItem("lang") || "javascript");
  }, []);

  useEffect(() => {
    setLanguage(loadLanguage(lang as Languages));

    getCompilers(LanguagesArray.find((a) => a.language == lang).key).then(
      (c) => {
        const l: { value: string; label: string }[] = [];
        c.forEach((comp) => {
          l.push({
            value: comp.name,
            label:
              comp["display-name"] +
              " " +
              comp.version.replace(/ *\([^)]*\) */g, ""),
          });
        });

        setCompiler(c[0].name);
        setList(l);
      }
    );
  }, [lang]);

  const onChange = useCallback((value: string) => {
    localStorage.setItem("code", String(value));
    setCode(value);
    return;
  }, []);

  function run() {
    setError("");
    setOutput("");
    setCompiling(true);

    fromString({
      code: code,
      compiler: compiler,
      save: false,
      stdin: input,
    })
      .then((out) => {

        if (out.program_error || out.compiler_error)
          setError(out.program_error ? out.program_error : out.compiler_error);
        if (out.program_output) setOutput(out.program_output);

        setCompiling(false);
        console.log(out);
      })
      .catch((err) => {
        setError(err);
        setCompiling(false);
        console.error(err);
      });
  }

  function newCoder() {
    const confirmation = confirm("Are you sure you want to create new coder?\nThe contents will not be saved!");
    if (confirmation == true) {
      localStorage.setItem("code", "");
      localStorage.setItem("inp", "");
      localStorage.setItem("lang", "javascript");

      router.reload()
    } else return;
  }

  return (
    <>
      <Head>
        <title>Execoder</title>
        <meta name="description" content="Execute Code if you need" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main>
        <header>
          <h1>Execoder</h1>
          <button className={styles.newCoder} onClick={() => newCoder()}><FaPlus /> New Coder</button>
        </header>
        <div className={styles.grid}>
          <div className={styles.codeWrapper}>
            <p>Code Editor</p>
            <div className={styles.runtime}>
              {compiling ? (
                <button className={styles.compiling} disabled>
                  Compiling
                </button>
              ) : (
                <button className={styles.run} onClick={() => run()}>
                  <BsFillPlayFill /> Run
                </button>
              )}
              <Dropdown
                options={LanguagesOption}
                value={lang}
                onChange={(values) => {
                  localStorage.setItem("lang", String(values.value));
                  setLang(values.value);
                }}
              />
            </div>
            <CodeEditor
              code={code}
              language={language}
              theme={theme}
              onChange={onChange}
            />
          </div>
          <div className={styles.right}>
            <div className={styles.compilers}>
              <p>Compiler</p>
              <Dropdown
                className="compiler"
                options={list}
                value={compiler}
                onChange={(values) => setCompiler(values.value)}
              />
            </div>
            <div className={styles.boxes}>
              <div className={styles.input}>
                <h2>Input</h2>
                <textarea
                  placeholder="Std Input"
                  value={input}
                  onChange={(e) => {
                    localStorage.setItem("inp", String(e.target.value));
                    setInput(e.target.value);
                  }}
                />
              </div>

              <div
                className={
                  compiling
                    ? styles.compilit
                    : output
                    ? styles.output
                    : error
                    ? styles.error
                    : styles.output
                }
              >
                {!error && !output && compiling ? (
                  <>
                    <h2>Compiling</h2>
                    <pre className={[styles.out, styles.clr].join(" ")}>
                      Beep boop. Boop beep ?
                    </pre>
                  </>
                ) : error && output ? (
                  <>
                    <h2>Terminal</h2>
                    <pre className={styles.err}>{error}</pre>
                    <pre className={styles.out}>{output}</pre>
                  </>
                ) : !error ? (
                  <>
                    <h2>Terminal</h2>
                    <pre className={styles.out}>{output}</pre>
                  </>
                ) : (
                  <>
                    <h2>Error</h2>
                    <pre className={styles.err}>{error}</pre>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

const formatCode = async (code: string, language: string) => {
  const prettier = await import("prettier/standalone");
  const babylonParser = await import("prettier/parser-babel");
  const css = await import("prettier/parser-postcss");
  const html = await import("prettier/parser-html");
  const angular = await import("prettier/parser-angular");
  const markdown = await import("prettier/parser-markdown");
  const typescript = await import("prettier/parser-typescript");
  const yaml = await import("prettier/parser-yaml");

  let parser = "babel";

  switch (language) {
    case "angular":
      parser = "angular";
      break;
    case "css":
      parser = "css";
      break;
    case "markdown":
    case "mdx":
      parser = "markdown";
      break;
    case "html":
      parser = "html";
      break;
    case "typescript":
    case "tsx":
      parser = "typescript";
      break;
    case "yaml":
      parser = "yaml";
      break;
    default:
      parser = "babel";
      break;
  }

  return prettier.format(code, {
    parser: parser,
    plugins: [babylonParser, css, html, markdown, typescript, yaml, angular],
    semi: true,
    singleQuote: true,
    bracketSpacing: true,
    bracketSameLine: true,
    endOfLine: "auto",
  });
};
