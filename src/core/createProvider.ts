import { IProvider } from '../interface.js';

export function createProvider<ProviderName extends string>(providerName: ProviderName): IProvider {
  throw Error('Not Implemented');
}
