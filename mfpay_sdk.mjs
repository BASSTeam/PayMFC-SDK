import { createHash } from 'crypto'
import * as JSON from './JSON.mjs'

function getRequestData(req){
    return new Promise((resolve, reject) => {
        let data = '';
        req.on('data', chunk => data += chunk);
        req.on('end', () => resolve(data));
        req.on('error', reject)
    })
}

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

    onRequest(server, targetURL, callback){
        server.prependListener('request', async (req, res) => {
            if(req.url === targetURL){
                const data = await getRequestData(req);
                res.writeHead(200, { 'Content-Type': 'application/paymfc-data' });
                try{
                    const decoded = this.checkSign(data);
                    if(decoded === null) throw new Error('Cannot parse data. Check data structure and signature');
                    const { txid } = decoded;
                    const response = await callback(decoded);
                    res.end(JSON.stringify(this.sign(Object.assign({}, response, { txid }))))
                } catch(e){
                    res.end(JSON.stringify({ error: e.message }))
                }
            }
        })
    }

    link(product, callbackData = null){
        let resolveUrl = `https://paymfc.ml:444/${this.pubkey}/${encodeURIComponent(product)}`;
        if(callbackData) resolveUrl += `?data=${encodeURIComponent(JSON.stringify(callbackData))}`;
        return `mfcoin://_?r=${encodeURIComponent(resolveUrl)}`
    }
}

export default PayMFC
