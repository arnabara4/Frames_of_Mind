/** Ask the server to refresh the ISR cache for the given public paths. */
export async function revalidatePaths(paths: string[]) {
  try {
    await fetch("/api/revalidate", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ paths }),
    });
  } catch {
    // Best-effort; ISR will catch up within the revalidate window anyway.
  }
}
