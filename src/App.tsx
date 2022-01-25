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
      token: process.env.REACT_APP_TOKEN ?? "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZjAwMTcwYjM3ZjI4M2FiZWI5NGYwN2NmMWVkYThhMTA4MjNhZjFjY2Q2NmE1MjRhOWUwYmVjOTg0ZDE0MTZiNjMzODkiLCJhdWQiOiJWUFMiLCJleHAiOjE2NDMxMDc1MTQsImlhdCI6MTY0MzAyMTEwNCwiaXNzIjoiS0VZTUFTVEVSIiwidHlwZSI6IkJlYXJlciIsImp0aSI6ImNhOTVhMDgwLTA5OGMtNGQ4YS05YjY5LWI5MDczOTNiZGVjYyIsInNpZCI6ImE1ZTBmOWQzLTJhNTgtNGQ4Ny05ODQ5LTQ0ZmZlMmUzZmIwNSJ9.SBwdw_JIag2t-qr9U5XdyssNFFpctVdACHzDhoZQg2NC2zB9xas7SDGjvKUbnEENLetT5s9bATzydd_NmntAg0XBDJNHMi9PWWK6XqVJTOub0Dw_ZtrjwYGNqmaMDfCyV0OXVXvmAsAS7FwuNl3KoOAEJqi_AUKTlgvF5cgRI6xPOnhfQA0awh8w7eCF3TsdcNxsu7MBTdH4NHRNTwsXmpdUuXph-Yy3wZ-weIAJvzT6j-TVUBss_BghKQqAQGsElAlRFU5Q9MO8SgJKcG5iqSt6faJa1xVeKYuIpL3YW6d4VNZM7FFcdwAygWxCTiYbJZqka1PZBqfGp27xp2PdxoZKcqfxGh4s_vaswyqHKLFDe4lx7w-_Z5izpav86cY3xqIDDaUY5n4-G0yNWdH8ZiUgl79p2Wc7L7IzxpH04NPK6BF4LUZdGSIQ8VzJy05QxQvkuvKQk6D9PGWqSUnwxJ5vVzumd15zZDwQNeQYRo7awhxIAsQMkJEVfp8gsPNfR7ELHLATPl9EVu9MKUjpilyZfruWA9FlNu4OLo80SxyASMI8T6aHSTyQf694AVk5Y3c2JbMK3fLmAraMmOgFZ9lGeq_oka6LlowkdsEIMhbiNMdjTBYphBjXR0bXPYK_hcYJhKlabuQZqs1jeIiUNYagvgjYLF8PXM0iPVxXGQk",
      initPhrase: `Запусти Электронный рецепт`,
      getState,
    });
  }

  return createAssistant({ getState });
};

export const App: FC = memo(() => {
  const [appState, dispatch] = useReducer(reducer, {
    notes: [{ id: 'uinmh', title: 'купить хлеб', completed: false }],
  });

  const [note, setNote] = useState('');

  const assistantStateRef = useRef<AssistantAppState>();
  const assistantRef = useRef<ReturnType<typeof createAssistant>>();

  useEffect(() => {
    assistantRef.current = initializeAssistant(() => assistantStateRef.current);

    assistantRef.current.on('data', ({ navigation, action }: any) => {
      if (navigation) {
        switch (navigation.command) {
          case 'UP':
            window.scrollTo(0, window.scrollY - 500);
            break;
          case 'DOWN':
            window.scrollTo(0, window.scrollY + 500);
            break;
        }
      }

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

  const doneNote = (title: string) => {
    assistantRef.current?.sendData({ action: { action_id: 'done', parameters: { title } } });
  };

  return (
      <main className="container">
        <form
            onSubmit={(event) => {
              event.preventDefault();
              dispatch({ type: 'add_note', note });
              setNote('');
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
                            <span style={{ fontWeight: 'bold' }}>{index + 1}. </span>
                            <span
                                style={{
                                  textDecorationLine: note.completed ? 'line-through' : 'none',
                                }}
                            >
                                {note.title}
                            </span>
                        </span>
                <input
                    id={`checkbox-note-${note.id}`}
                    className="done-note"
                    type="checkbox"
                    checked={note.completed}
                    onChange={() => doneNote(note.title)}
                    disabled={note.completed}
                />
              </li>
          ))}
        </ul>
      </main>
  );
});
