import {getRequestConfig} from 'next-intl/server';

export default getRequestConfig(async () => ({
  locale: 'vi',
  timeZone: 'Asia/Bangkok',
  messages: (await import('../messages/vi.json')).default,
}));
