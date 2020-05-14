<?php

class PayMFC{
    public $pubkey;
    protected $privkey;

    function __construct($pubkey, $privkey){
        $this -> pubkey = $pubkey;
        $this -> privkey = $privkey;
    }

    function sign($data){
        $encodedData = base64_encode(json_encode($data));
        return [
            'data' => $encodedData,
            'signature' => base64_encode(sha1($this -> privkey . $encodedData . $this -> privkey, 1))
        ];
    }

    function checkSign($encoded_data){
        $parsed_data = json_decode($encoded_data, true);
        $decoded_data = json_decode(base64_decode($parsed_data['data']), true);
        $signed = $this -> sign($decoded_data);
        if($parsed_data['signature'] === $signed['signature']) return $decoded_data;
        return null;
    }

    function onRequest($callback){
        header('Content-Type: application/paymfc-data');
        try{
            $req = $this -> checkSign(file_get_contents('php://input'));
            if($req === null) throw new Exception('Cannot parse data. Check data structure and signature.');
            echo json_encode($this -> sign($callback($req)));
        } catch(Exception $e){
            echo json_encode([ 'error' => $e -> getMessage() ]);
        }
        exit(200);
    }

    function link($product, $callbackData = null){
        $resolve_url = 'https://paymfc.ml/' . $this -> pubkey . '/' . rawurlencode($product);
        if($callbackData) $resolve_url .= '?data=' . rawurlencode(json_encode($callbackData));
        return 'mfcoin://_?r=' . rawurlencode($resolve_url);
    }
}

?>
