import en from '@/messages/en.json';

export type Messages = typeof en;

export function getMessages(): Messages {
  return en;
}

export function formatMessage(template: string, vars: Record<string, string | number>): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), String(value));
  }
  return result;
}
