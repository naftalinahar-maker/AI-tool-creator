interface DownloadsApi {
  save(req: { filename: string; data: Blob }): Promise<unknown>;
}

interface ClaudeHost {
  use(name: string): Promise<unknown>;
}

/**
 * Save a generated file for the user.
 * When the app runs inside a claude.ai artifact (sandboxed, plain downloads are
 * blocked) this goes through the host's `downloads` capability; otherwise it
 * falls back to a regular <a download> link.
 */
export async function saveFile(filename: string, blob: Blob): Promise<void> {
  const host = (window as unknown as { claude?: ClaudeHost }).claude;
  if (host?.use) {
    const downloads = (await host.use("downloads").catch(() => null)) as DownloadsApi | null;
    if (downloads) {
      try {
        await downloads.save({ filename, data: blob });
      } catch {
        // Viewer declined or saving is unavailable here; nothing else to do.
      }
      return;
    }
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
