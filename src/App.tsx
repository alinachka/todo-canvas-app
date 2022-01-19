import React, {
  FC,
  memo,
  useReducer,
  useState,
  useRef,
  useEffect,
} from "react";
import {
  createSmartappDebugger,
  createAssistant,
  AssistantAppState,
} from "@sberdevices/assistant-client";
import "./App.css";

import { reducer } from "./store";

const initializeAssistant = (getState: any) => {
  if (process.env.NODE_ENV === "development") {
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZjAwMTcwYjM3ZjI4M2FiZWI5NGYwN2NmMWVkYThhMTA4MjNhZjFjY2Q2NmE1MjRhOWUwYmVjOTg0ZDE0MTZiNjMzODkiLCJhdWQiOiJWUFMiLCJleHAiOjE2NDI2NzI2OTIsImlhdCI6MTY0MjU4NjI4MiwiaXNzIjoiS0VZTUFTVEVSIiwidHlwZSI6IkJlYXJlciIsImp0aSI6IjU5NTFmNzQwLWZjNzItNGM4Ni1hOTQ1LWMzMTIzMTI1ZGM0MiIsInNpZCI6IjdlNGU1MjI3LWZiOTgtNDE5Yy1iMDNlLTY4OTUwY2NlZjQ2MSJ9.tY0iHK3KADGlWurb5AFHRqVm3itz7zettbgMKdNh2EnVgbwatcqEhj9y3SLE8LQnhho41hqHI69gLC9hBg1-rX_pJmgrckxIIaGXUdveJkYHmmnmcR6gVAH0KovYeayvgryjprygrbdUmIWj0fqFkEvUihfbTaCN23sLpyuu2n5YlRaf1F-ESCuKTMZjQjGFB7aXMUzSTsadT5zn0h2JXVv_U-KXagYNvdUpRIDW7ZGfpRNZEKOHbZEl4nPpNDHHUD7PjE88i4EChD2XVKwZeZ-R3BrGDZEXuBDEWL-zvlEh4BbXp_sj04048ImlsN1qLxla5hk9gu1dd-fWxQypxko7ug8BSrhszm6a4dRRFkIW4sf2fFYOuwOTuh5rk2sOy2xaRWQfCmOdhCuF1JLw7DbSKr3Ssc6ZKC_WXNULdglZZRAjVHNs34ZnkUjUsTTaeb1ikMaapmHupjI6fuvnLcKoaxG4RXO5T4DVFD87bh_k2kEqP_H6XRW3RTAetyG_Dk5w5PBB378l6qyphtLSphMfBjYRU6Wn4Zz0dZ2B3A-hKS21kyGARo2cN3vkDU5WK6THDlcteGWYELyDj4mZ51mydnBGmUwLTEzfpz4ySf8gDpa7lHewFRWVihYTmmPw9vOeB08BjmYzY1PQ2KMSkOrH_Wd9ui4R5TsI4xden3E",
      initPhrase: `Запусти САЛЮТ`,
      getState,
    });
  }

  return createAssistant({ getState });
};

export const App: FC = memo(() => {
  const [appState, dispatch] = useReducer(reducer, { notes: [] });

  const [note, setNote] = useState("");

  const assistantStateRef = useRef<AssistantAppState>();
  const assistantRef = useRef<ReturnType<typeof createAssistant>>();

  useEffect(() => {
    assistantRef.current = initializeAssistant(() => assistantStateRef.current);

    assistantRef.current.on("data", ({ action }: any) => {
      if (action) {
        dispatch(action);
      }
    });
  }, []);

  useEffect(() => {
    assistantStateRef.current = {
      item_selector: {
        items: appState.notes.map(({ id, title }, index) => ({
          number: index + 1,
          id,
          title,
        })),
      },
    };
  }, [appState]);

  return (
    <main className="container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          dispatch({ type: "add_note", note });
          setNote("");
        }}
      >
        <input
          className="add-note"
          type="text"
          placeholder="Add Note"
          value={note}
          onChange={({ target: { value } }) => setNote(value)}
          required
          autoFocus
        />
      </form>
      <ul className="notes">
        {appState.notes.map((note, index) => (
          <li className="note" key={note.id}>
            <span>
              <span style={{ fontWeight: "bold" }}>{index + 1}. </span>
              <span
                style={{
                  textDecorationLine: note.completed ? "line-through" : "none",
                }}
              >
                {note.title}
              </span>
            </span>
            <input
              className="done-note"
              type="checkbox"
              checked={note.completed}
              onChange={() => dispatch({ type: "done_note", id: note.id })}
            />
          </li>
        ))}
      </ul>
    </main>
  );
});
