type Listener = () => void;

const listeners = new Set<Listener>();

export function subscribeBookingEvents(fn: Listener): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function emitBookingEvent() {
  listeners.forEach((fn) => fn());
}
