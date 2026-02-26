import { fetchEditorState, type EditorStatePayload } from "@/lib/editor-api-client";

type CancellationCheck = () => boolean;

type LoadEditorStateOptions = {
  setLoading: (value: boolean) => void;
  setError: (value: string) => void;
  onLoaded: (payload: EditorStatePayload) => void;
  errorMessage: string;
  isCancelled?: CancellationCheck;
};

type RunEditorMutationOptions<TPayload> = {
  setPending: (value: boolean) => void;
  setError: (value: string) => void;
  setStatus: (value: string) => void;
  run: () => Promise<TPayload>;
  errorMessage: string;
  successMessage?: string;
  onSuccess?: (payload: TPayload) => void;
  onError?: (error: unknown) => void;
};

export function toEditorErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export async function loadEditorState({
  setLoading,
  setError,
  onLoaded,
  errorMessage,
  isCancelled,
}: LoadEditorStateOptions) {
  const isCancelledNow = () => Boolean(isCancelled?.());

  if (isCancelledNow()) {
    return null;
  }

  setLoading(true);
  setError("");

  try {
    const payload = await fetchEditorState();
    if (!isCancelledNow()) {
      onLoaded(payload);
    }
    return payload;
  } catch (error) {
    if (!isCancelledNow()) {
      setError(toEditorErrorMessage(error, errorMessage));
    }
    return null;
  } finally {
    if (!isCancelledNow()) {
      setLoading(false);
    }
  }
}

export async function runEditorMutation<TPayload>({
  setPending,
  setError,
  setStatus,
  run,
  errorMessage,
  successMessage,
  onSuccess,
  onError,
}: RunEditorMutationOptions<TPayload>) {
  setPending(true);
  setError("");
  setStatus("");

  try {
    const payload = await run();
    onSuccess?.(payload);

    if (successMessage) {
      setStatus(successMessage);
    }

    return payload;
  } catch (error) {
    onError?.(error);
    setError(toEditorErrorMessage(error, errorMessage));
    return null;
  } finally {
    setPending(false);
  }
}
