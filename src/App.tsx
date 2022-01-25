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
      token: process.env.REACT_APP_TOKEN ?? "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJmZjAwMTcwYjM3ZjI4M2FiZWI5NGYwN2NmMWVkYThhMTA4MjNhZjFjY2Q2NmE1MjRhOWUwYmVjOTg0ZDE0MTZiNjMzODkiLCJhdWQiOiJWUFMiLCJleHAiOjE2NDMyMDA5NTEsImlhdCI6MTY0MzExNDU0MSwiaXNzIjoiS0VZTUFTVEVSIiwidHlwZSI6IkJlYXJlciIsImp0aSI6Ijc5MmM5MmNmLTIxNmItNGQwMy04ZDc1LWQxOTUzZjM2YzIyYSIsInNpZCI6IjAyMzJiN2I4LTM4YzUtNGY5Yy1iMTIwLWZiODVhYWM0ODkwZiJ9.OCjhvgNgMCRpreioeMQHExGzdk7ju8KY9-HF77nx0FJtY2Q6v0bxbac3iz-avTntXea4Ptrz53GlODPsWM4SG_sYEiFnF9dY7VS4mEeP-Vcjeghj5AYnY5sK1kD03d_N3k2ywYp1aXB28HHSwZlwKb7yvTzgpOAl6Z2gFOze-UDNpIQ7BVg6n0yaTjP5tixTn7omusOgKI3UWA1SVt0YD-u9l6Ee8WqW9VJjkrYyiVj37ajuYnYWT2AdT2_B1JCdGWoHnv4PGs1oFGg03fXalxysDbFsdGUV4d6AaCaAB-sQLsaeV8EurO7bzoMFRZMNcuVSr7LEGLmiUgVAH9m8pFiW_zGMpEHieeKk-sjiE34cyxYDCBwc3yvkAi1OJhGIkI6x69lXWXwlDc0aZskRy1lGF4iiEcfzvU8uU0Y7g-Zewh_kJ8kf2hvtGmABQ86KCWwX34KIBfvIU9QPxqn7fIE5GPDmRRPLOjP0DpulC7CsMWmYPtaoq7sLgz39pGH6viLTGmcICrZuZfmxEoa9dqg3bd4biPwOl-M1DqNJneULiOV3DgkEzz0Df6iWYeCyYIvNqK-5sVO4a0ZMB1ETV7e76N5cjOA_eEo75fj2bMvHDp7Wbi9ugdz2dds2mH_1XU2uqupj-ney3cBKH1cyL_06kIsS1TBJgp2MadgGJsg",
      initPhrase: `Запусти Электронный рецепт`,
      getState,
      nativePanel: {
        defaultText: 'Покажи что-нибудь',
        screenshotMode: false,
        tabIndex: -1,
      },
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
