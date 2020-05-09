import Net from 'net'

type Request = {
    product: string
    txid: string
}

type ConfirmRequest = {
    type: 'confirm'
    txid: string
}

type DeclineRequest = {
    type: 'decline'
    txid: string
}

export default class PayMFC{
    constructor(pubkey: string, privkey: string)

    /** Sign data and returns base64-encoded data and signature */
    sign(params: any): {
        data: string;
        signature: string;
    }

    /** Checks the signature of encoded data and, if success, returns decoded one or `null` if not */
    checkSign(encodedData: string): any

    /**
     * Binds listener for specified server and url. Callback may be both synchronous and asynchronous
     * @param server Server to listen on
     * @param targetURL Url to listen to
     * @param callback User-defined function that can deal with requests from PayMFC server
     */
    onRequest(server: Net.Server, targetURL: string, callback: (req: Request | ConfirmRequest | DeclineRequest) => Promise<{
        name: string
        price: number
        payment_address: string
    } | void>): void

    /**
     * Generates mfcoin:// link for payment request
     * @param product Product/Product group/Cart ID
     * @param callbackData (Optional) data to be in onRequest's callback's `req` parameter
     */
    link(product: string, callbackData?: any): string
}
