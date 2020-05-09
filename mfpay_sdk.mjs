import { createHash } from 'crypto'
import * as JSON from './JSON.mjs'

class PayMFC{
    constructor(pubkey, privkey){
        this.pubkey = pubkey;
        this.#privkey = privkey;
    }

    sign(params){
        const hash = createHash('sha1');
        const data = new Buffer(JSON.stringify(params)).toString('base64');
        hash.update(this.#privkey + data + this.#privkey);
        return {
            data,
            signature: hash.digest('base64')
        }
    }

    checkSign(encodedData){
        const { signature, data } = JSON.parse(encodedData);
        const decodedData = JSON.parse(Buffer.from(data, 'base64'));
        if(signature === this.sign(decodedData).signature) return decodedData;
        return null
    }

    link(product, callbackData = null){
        let resolveUrl = `https://paymfc.ml:444/${this.pubkey}/${encodeURIComponent(product)}`;
        if(callbackData) resolveUrl += `?data=${encodeURIComponent(JSON.stringify(callbackData))}`;
        return `mfcoin://_?r=${encodeURIComponent(resolveUrl)}`
    }
}

export default PayMFC
