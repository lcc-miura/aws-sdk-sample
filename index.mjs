import dotenv from 'dotenv';
dotenv.config();
import { HttpRequest } from '@aws-sdk/protocol-http';
import { SignatureV4 } from '@aws-sdk/signature-v4';
import { Sha256 } from '@aws-crypto/sha256-universal';
import axios from "axios";

const LAMBDA_URL = process.env.LAMBDA_URL;
const ACCESS_KEY_ID = process.env.ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.SECRET_ACCESS_KEY;
const SERVICE = process.env.SERVICE;
const REGION = process.env.REGION;
const user_id = "1";

const generateSignatureV4 = (service, region, accessKeyId, secretAccessKey, Sha256) => {
  return new SignatureV4({
    service,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    sha256: Sha256,
  });
}

const generateHttpRequest = (url, user_id) => {
  return new HttpRequest({
    method: 'GET',
    hostname: url.hostname,
    query: { user_id },
    headers: {
      'content-type': 'application/json',
      host: url.hostname,
    },
    path: url.pathname,
  });
}

const main = async () => {
  const signatureV4 = generateSignatureV4(SERVICE, REGION, ACCESS_KEY_ID, SECRET_ACCESS_KEY, Sha256)
  const httpRequest = generateHttpRequest(new URL(LAMBDA_URL), user_id);

  // signatureV4.signに渡す値とfetchする値は同じである必要
  const signedRequest = await signatureV4.sign(httpRequest);

  console.log({ signedRequest });

  try {
    const response = await axios.get(LAMBDA_URL, {
      headers: signedRequest.headers,
      params: { user_id }
    });
    console.log(response.status);
    console.log(response.data);
  } catch (error) {
    if (error.response) {
      console.log(error.response.data);
    } else {
      console.error(error);
    }
  }
};

main();

