import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface newNoteProps {
  onNoteCreated: (content: string) => void;
}

let speechRecognition: SpeechRecognition | null = null;

export function NewNote({ onNoteCreated }: newNoteProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setContent(event.target.value);

    if (event.target.value == "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();

    if (content == "") {
      setShouldShowOnboarding(true);
      toast.error("A nota nao pode estar vazia!");

      return;
    }

    onNoteCreated(content);

    setContent("");
    setShouldShowOnboarding(true);
    setShowEditor(false);

    toast.success("Nota salva com sucesso!");
  }

  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;

    if (!isSpeechRecognitionAPIAvailable) {
      alert(
        "Infelizmente seu navegador não é compativel com o recurso de gravação."
      );
      return;
    }

    setIsRecording(true);
    setShouldShowOnboarding(false);

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    speechRecognition = new SpeechRecognitionAPI();

    speechRecognition.lang = "pt-BR";
    speechRecognition.continuous = true;
    speechRecognition.maxAlternatives = 1;
    speechRecognition.interimResults = true;

    speechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");

      setContent(transcription);
    };

    speechRecognition.onerror = (event) => {
      console.error(event);
    };

    speechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);

    if (content == "") {
      setShouldShowOnboarding(true);
    }

    if (speechRecognition != null) {
      speechRecognition.stop();
    }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger
        onClick={() => setShowEditor(true)}
        className="rounded-md bg-slate-700 p-5 flex flex-col text-left gap-3 outline-none hover:ring-2 hover:ring-slate-600 focus:ring-2 focus:ring-lime-400"
      >
        <span className="text-sm font-medium text-slate-200">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Adicione uma nova nota de áudio ou texto.
        </p>
      </Dialog.Trigger>

      {showEditor ? (
        <Dialog.Portal>
          <Dialog.Overlay className="inset-0 fixed bg-black/50">
            {" "}
            <Dialog.Content className=" overflow-hidden z-10 fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 max-w-[640px] w-full h-[60vh] bg-slate-700 rounded-md flex flex-col outline-none">
              <Dialog.Close className="absolute right-0 top-0 bg-slate-800 p-1.5 text-slate-400 hover:text-slate-100">
                <X className="size-5" />
              </Dialog.Close>

              <form className="flex-1 flex flex-col">
                <div className=" flex flex-1 flex-col gap-3 p-5">
                  <span className="text-sm font-medium text-slate-200">
                    Adicionar nota
                  </span>
                  {shouldShowOnboarding ? (
                    <p className="text-sm leading-6 text-slate-400">
                      {" "}
                      Grave uma{" "}
                      <button
                        type="button"
                        onClick={handleStartRecording}
                        className="font-medium text-lime-400 hover:underline"
                      >
                        nota em áudio
                      </button>{" "}
                      ou utilize{" "}
                      <button
                        type="button"
                        onClick={handleStartEditor}
                        className="font-medium text-lime-400 hover:underline"
                      >
                        apenas texto.
                      </button>
                    </p>
                  ) : (
                    <textarea
                      autoFocus
                      onChange={handleContentChange}
                      className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                      value={content}
                    />
                  )}
                </div>

                {isRecording ? (
                  <button
                    onClick={handleStopRecording}
                    type="button"
                    className="flex items-center justify-center gap-2 w-full bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none hover:text-slate-100"
                  >
                    <div className="size-3 rounded-full bg-red-600 animate-pulse  " />
                    Gravando. Clique aqui para interromper.
                  </button>
                ) : (
                  <button
                    onClick={handleSaveNote}
                    type="button"
                    className="w-full bg-lime-400 py-4 text-center text-sm text-lime-950 outline-none hover:bg-lime-500"
                  >
                    Salvar nota
                  </button>
                )}
              </form>
            </Dialog.Content>{" "}
          </Dialog.Overlay>
        </Dialog.Portal>
      ) : (
        ""
      )}
    </Dialog.Root>
  );
}
