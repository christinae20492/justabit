let pending: { identifier: string; password: string } | null = null;

export function setPendingLogin(identifier: string, password: string) {
  pending = { identifier, password };
}

export function consumePendingLogin(): { identifier: string; password: string } | null {
  const val = pending;
  pending = null;
  return val;
}
