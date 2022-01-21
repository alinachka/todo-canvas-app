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
    console.log(`Запусти ${process.env.REACT_APP_SMARTAPP}`);
    return createSmartappDebugger({
      token: process.env.REACT_APP_TOKEN ?? "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZjAwMTcwYjM3ZjI4M2FiZWI5NGYwN2NmMWVkYThhMTA4MjNhZjFjY2Q2NmE1MjRhOWUwYmVjOTg0ZDE0MTZiNjMzODkiLCJhdWQiOiJWUFMiLCJleHAiOjE2NDI4Mzk5NTAsImlhdCI6MTY0Mjc1MzU0MCwiaXNzIjoiS0VZTUFTVEVSIiwidHlwZSI6IkJlYXJlciIsImp0aSI6IjNlYjE0NzdkLTI3MzctNGE3My04YzQ4LWIwNGNlNjUwN2Y1MSIsInNpZCI6ImEzNzBiNTliLWM0NWMtNGJhMS04OTU2LTc2ZjVhMTdhZmFlZiJ9.CwFELNsaT_wAB82tH0K70RCw_W-jkPGOqnq_7QeT31L56YzlnQ4Z547VKkFtXx-PLpxOQEIpqvU0L0xi-rFKnaa9ZZL_ydyHX7xMcaLUXBv0Sxebfk281Ktny4Dh2tZ1KREIYAnU9jaXubcZF44mv6B97b9dR2hJeAKwvTqVbiQ22U4Xq9nNJ2XMFvKZ337iNvYd1SlOB3dZRMKDUF8RxjZFiKjFSDpudKg8b2kIrZfRMDm_ZvjqCEZlengy0iQJVgnSHSGGs3lW-VgtGl2svqCPQ6J1bKhnHMbTKpRFMjWmbW48k954EkaVFkADWvuP9HFNNFTO_e3-qR_Vd2smeDiDu9JKzWr2i7ALnxktjAfAOGuGLRnS2Jx-4ADCm7qtIVNZitVRSWjayuqXZmKtixn7_fScFanE-lZeo8g2FZHLRWf-JyJNAHVEPWem5LxN7JIr4LNc0mAzFM0lFY0jasnL5ZOaHmRtTVOkSiCQG_tiqzblkIhBR9-wTy35484i3yPyMFwz6yioZIbhdvZpIWk4db7Zx-FPcJCpotibtN8PULj8OND3UrYZA1YEwBnFdsFbtqpnPFi9y-3td8QVibsMNKtl_T2CSI6yB96S_hAmD04a0eeLSsEO0uARZFNpINndg50KqaomxPUJgzIheeP_FMJioz9ky5jcXr0BtuU",
      initPhrase: `Запусти Электронный рецепт`,
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
