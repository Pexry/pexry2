import type { PayloadRequest } from 'payload';

declare module 'payload' {
  interface PayloadRequest {
    payloadRedirect?: string;
  }
}
